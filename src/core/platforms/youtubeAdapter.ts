import { hashString } from "~core/utils/hash"
import { debounce } from "~core/utils/debounce"
import type { AnalysisResult, FeedGuardDecision } from "~core/types"
import type { DetectedContentItem, PlatformAdapter, PlatformAdapterEvents } from "~core/platforms/types"

const CONTENT_SELECTORS = [
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-reel-item-renderer",
  "ytd-reel-video-renderer",
  "ytd-shorts",
  "ytd-shorts-video-renderer",
  "ytd-comment-thread-renderer",
  "ytd-watch-metadata"
]

export class YouTubeAdapter implements PlatformAdapter {
  private observer?: MutationObserver
  private replyObserver?: MutationObserver
  private debouncedChange: () => void

  public constructor(private readonly events: PlatformAdapterEvents) {
    this.debouncedChange = debounce(this.events.onContentChanged, 350)
  }

  public start(): void {
    this.observer = new MutationObserver(this.debouncedChange)
    this.observer.observe(document.body, { childList: true, subtree: true })
    this.observeReplyBoxes()
    this.events.onContentChanged()
  }

  public stop(): void {
    this.observer?.disconnect()
    this.replyObserver?.disconnect()
  }

  public detectContent(): DetectedContentItem[] {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(CONTENT_SELECTORS.join(",")))
    return elements
      .filter((element) => isVisible(element) && !element.dataset.rsfgIgnored)
      .map((element) => this.parseElement(element))
      .filter((item): item is DetectedContentItem => Boolean(item?.title || item?.body))
  }

  public injectBadge(item: DetectedContentItem, analysis: AnalysisResult, onOpen: () => void): void {
    const mountElement = item.mountElement ?? item.titleElement ?? item.element
    let badge = item.element.querySelector<HTMLButtonElement>(".rsfg-badge")

    if (!badge) {
      badge = document.createElement("button")
      badge.type = "button"
      badge.className = "rsfg-badge"
      badge.addEventListener("click", (event) => {
        event.preventDefault()
        event.stopPropagation()
        onOpen()
      })
      mountElement.insertAdjacentElement("afterbegin", badge)
    }

    badge.dataset.level = getBadgeLevel(analysis)
    item.element.dataset.rsfgHeat = getBadgeLevel(analysis)
    badge.setAttribute(
      "aria-label",
      `RageShield emotional intensity ${analysis.emotionalIntensity} out of 100. ${analysis.intensityLabel}.`
    )
    badge.title = `${analysis.intensityLabel}: ${analysis.explanation}${contentWarningLabel(analysis) ?? ""}`
    badge.innerHTML = `<span class="rsfg-badge-dot"></span><span>${analysis.emotionalIntensity}</span><span>${escapeHtml(topToneLabel(analysis))}</span>`
  }

  public injectOverlay(
    item: DetectedContentItem,
    analysis: AnalysisResult,
    decision: FeedGuardDecision,
    onReveal: () => void
  ): void {
    if (item.element.dataset.rsfgRevealed === "true") {
      return
    }

    const isShorts = item.surface === "youtube-shorts"
    item.element.classList.add(isShorts ? "rsfg-shorts-guarded" : "rsfg-guarded")
    item.element.dataset.rsfgGuardMode = decision.action
    suppressMedia(collectMediaTargets(item))
    let overlay = findOverlay(item)

    if (!overlay) {
      overlay = document.createElement("div")
      overlay.className = isShorts ? "rsfg-guard-overlay rsfg-shorts-guard-overlay" : "rsfg-guard-overlay"
      overlay.dataset.rsfgOverlayFor = item.id
      if (isShorts) {
        document.body.appendChild(overlay)
      } else {
        item.element.appendChild(overlay)
      }
    }

    if (isShorts) {
      positionShortsOverlay(item.element, overlay)
    }

    const categoryLabel = decision.categories[0]?.label ?? decision.toneHits[0]?.tone ?? "attention filter"
    const isHardLock = decision.action === "hardLock"
    const revealDelay = decision.revealDelaySeconds ?? 0
    const actionLabel =
      decision.action === "hardLock" ? "Hard locked" : decision.action === "softLock" ? "Soft locked" : "Blurred"
    const buttonHtml = isHardLock
      ? ""
      : `<button type="button" class="rsfg-reveal-button" ${revealDelay > 0 ? "disabled" : ""}>${
          revealDelay > 0 ? `Unlock in ${revealDelay}s` : "Reveal"
        }</button>`
    overlay.innerHTML = `
      <div class="rsfg-guard-card">
        <div class="rsfg-guard-title">${actionLabel} by FeedGuard</div>
        <div class="rsfg-guard-category">Category: ${escapeHtml(categoryLabel)}</div>
        <div class="rsfg-guard-reason">${escapeHtml(decision.reasons[0] ?? "Matched an attention rule.")}</div>
        <div class="rsfg-guard-note">Rage ${analysis.emotionalIntensity}/100 · Info ${analysis.nutritionLabel.informationValue}/100 · Risk ${analysis.nutritionLabel.manipulationRisk}/100</div>
        ${buttonHtml}
      </div>
    `

    const revealButton = overlay.querySelector<HTMLButtonElement>(".rsfg-reveal-button")

    if (!revealButton) {
      return
    }

    if (revealDelay > 0 && overlay.dataset.rsfgCountdownActive !== "true") {
      overlay.dataset.rsfgCountdownActive = "true"
      let remaining = revealDelay
      const intervalId = window.setInterval(() => {
        remaining -= 1
        revealButton.textContent = remaining > 0 ? `Unlock in ${remaining}s` : "Reveal"

        if (remaining > 0) {
          return
        }

        revealButton.disabled = false
        window.clearInterval(intervalId)
      }, 1000)
    }

    revealButton.addEventListener("click", (event) => {
      event.preventDefault()
      event.stopPropagation()

      if (revealButton.disabled) {
        return
      }

      item.element.dataset.rsfgRevealed = "true"
      onReveal()
      this.clearOverlay(item)
    })
  }

  public clearOverlay(item: DetectedContentItem): void {
    item.element.classList.remove("rsfg-guarded")
    item.element.classList.remove("rsfg-shorts-guarded")
    delete item.element.dataset.rsfgGuardMode
    restoreMedia(collectMediaTargets(item))
    findOverlay(item)?.remove()
  }

  private parseElement(element: HTMLElement): DetectedContentItem | undefined {
    const surface = detectSurface(element)
    const titleElement =
      element.querySelector<HTMLElement>("#video-title") ??
      element.querySelector<HTMLElement>("h1 yt-formatted-string") ??
      element.querySelector<HTMLElement>("yt-shorts-video-title-view-model") ??
      element.querySelector<HTMLElement>("yt-shorts-video-title-view-model h2") ??
      element.querySelector<HTMLElement>("yt-shorts-video-title-view-model span") ??
      element.querySelector<HTMLElement>("yt-reel-player-header-renderer yt-formatted-string") ??
      element.querySelector<HTMLElement>("yt-reel-metapanel-view-model h2") ??
      element.querySelector<HTMLElement>("#overlay #title") ??
      element.querySelector<HTMLElement>("#title") ??
      element.querySelector<HTMLElement>("h2 span") ??
      element.querySelector<HTMLElement>("h2") ??
      element.querySelector<HTMLElement>("#content-text")
    const visibleText = surface === "youtube-shorts" ? extractVisibleText(element) : ""
    const title = normalizeText(titleElement?.textContent) || shortsDocumentTitle(surface)
    const body = normalizeText(
      element.querySelector<HTMLElement>("#description-text")?.textContent ??
        element.querySelector<HTMLElement>("#metadata-line")?.textContent ??
        element.querySelector<HTMLElement>("#content #text")?.textContent ??
        element.querySelector<HTMLElement>("#content-text")?.textContent ??
        visibleText
    )
    const author = normalizeText(
      element.querySelector<HTMLElement>("#channel-name")?.textContent ??
        element.querySelector<HTMLElement>("yt-reel-channel-bar-view-model h3")?.textContent ??
        element.querySelector<HTMLElement>("yt-reel-channel-bar-view-model a")?.textContent ??
        element.querySelector<HTMLElement>("yt-shorts-channel-bar-view-model h3")?.textContent ??
        element.querySelector<HTMLElement>("yt-shorts-channel-bar-view-model a")?.textContent ??
        element.querySelector<HTMLElement>('a[href^="/@"]')?.textContent ??
        element.querySelector<HTMLElement>("#author-text")?.textContent
    )
    const anchor =
      element.querySelector<HTMLAnchorElement>("a#video-title") ??
      element.querySelector<HTMLAnchorElement>('a[href*="/watch"]') ??
      element.querySelector<HTMLAnchorElement>('a[href*="/shorts"]')
    const url = anchor?.href ?? location.href
    const id = hashString(["youtube", surface, url, title, body].join("|"))

    if (!title && !body) {
      return undefined
    }

    element.dataset.rsfgItemId = id

    return {
      id,
      platform: "youtube",
      surface,
      title: title || body.slice(0, 120),
      body,
      author,
      url,
      observedAt: Date.now(),
      element,
      titleElement: titleElement ?? undefined,
      mountElement: titleElement?.parentElement ?? element
    }
  }

  private observeReplyBoxes(): void {
    const notifyReplyText = debounce((target: HTMLElement) => {
      this.events.onReplyTextChanged(target, normalizeText(target.textContent ?? (target as HTMLTextAreaElement).value))
    }, 250)

    this.replyObserver = new MutationObserver(() => {
      for (const target of document.querySelectorAll<HTMLElement>('textarea, div[contenteditable="true"]')) {
        if (target.dataset.rsfgReplyBound === "true") {
          continue
        }

        target.dataset.rsfgReplyBound = "true"
        target.addEventListener("input", () => notifyReplyText(target))
        target.addEventListener("blur", () => notifyReplyText(target))
      }
    })
    this.replyObserver.observe(document.body, { childList: true, subtree: true })
  }
}

function detectSurface(element: HTMLElement): DetectedContentItem["surface"] {
  if (element.matches("ytd-comment-thread-renderer")) {
    return "youtube-comments"
  }

  if (
    location.pathname.startsWith("/shorts") ||
    element.matches("ytd-reel-video-renderer, ytd-shorts, ytd-shorts-video-renderer")
  ) {
    return "youtube-shorts"
  }

  if (location.pathname === "/results") {
    return "youtube-search"
  }

  if (location.pathname === "/watch") {
    return element.matches("ytd-watch-metadata") ? "youtube-watch" : "youtube-recommended"
  }

  if (location.pathname === "/" || location.pathname === "/feed/subscriptions") {
    return "youtube-home"
  }

  return "unknown"
}

function isVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 && rect.bottom >= -200 && rect.top <= window.innerHeight + 400
}

function normalizeText(value?: string | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim()
}

function shortsDocumentTitle(surface: DetectedContentItem["surface"]): string {
  if (surface !== "youtube-shorts") {
    return ""
  }

  return normalizeText(document.title.replace(/- YouTube$/i, "").replace(/\| YouTube$/i, ""))
}

function extractVisibleText(element: HTMLElement): string {
  return normalizeText(element.innerText || element.textContent).slice(0, 800)
}

function collectMediaTargets(item: DetectedContentItem): HTMLMediaElement[] {
  const mediaTargets = new Set<HTMLMediaElement>()

  for (const media of item.element.querySelectorAll<HTMLMediaElement>("video, audio")) {
    mediaTargets.add(media)
  }

  if (item.surface === "youtube-shorts") {
    for (const media of document.querySelectorAll<HTMLMediaElement>("video, audio")) {
      if (isVisible(media)) {
        mediaTargets.add(media)
      }
    }
  }

  return Array.from(mediaTargets)
}

function suppressMedia(mediaTargets: HTMLMediaElement[]): void {
  for (const media of mediaTargets) {
    if (media.dataset.rsfgMediaSuppressed !== "true") {
      media.dataset.rsfgPreviousMuted = String(media.muted)
      media.dataset.rsfgPreviousVolume = String(media.volume)
    }

    media.dataset.rsfgMediaSuppressed = "true"
    media.muted = true
    media.volume = 0
    media.pause()
    media.addEventListener("play", keepSuppressedMediaPaused)
  }
}

function restoreMedia(mediaTargets: HTMLMediaElement[]): void {
  for (const media of mediaTargets) {
    if (media.dataset.rsfgMediaSuppressed !== "true") {
      continue
    }

    media.removeEventListener("play", keepSuppressedMediaPaused)
    media.muted = media.dataset.rsfgPreviousMuted === "true"
    media.volume = Number(media.dataset.rsfgPreviousVolume ?? 1)
    delete media.dataset.rsfgMediaSuppressed
    delete media.dataset.rsfgPreviousMuted
    delete media.dataset.rsfgPreviousVolume
  }
}

function keepSuppressedMediaPaused(event: Event): void {
  const media = event.currentTarget as HTMLMediaElement

  if (media.dataset.rsfgMediaSuppressed !== "true") {
    return
  }

  media.muted = true
  media.volume = 0
  media.pause()
}

function findOverlay(item: DetectedContentItem): HTMLDivElement | null {
  return (
    item.element.querySelector<HTMLDivElement>(".rsfg-guard-overlay") ??
    document.querySelector<HTMLDivElement>(`.rsfg-guard-overlay[data-rsfg-overlay-for="${cssEscape(item.id)}"]`)
  )
}

function positionShortsOverlay(element: HTMLElement, overlay: HTMLElement): void {
  const rect = element.getBoundingClientRect()
  overlay.style.left = `${Math.max(0, rect.left)}px`
  overlay.style.top = `${Math.max(0, rect.top)}px`
  overlay.style.width = `${Math.max(280, rect.width)}px`
  overlay.style.height = `${Math.max(360, rect.height)}px`
}

function getBadgeLevel(analysis: AnalysisResult): "low" | "mid" | "high" {
  if (hasRedFlagCategory(analysis)) {
    return "high"
  }

  const score = analysis.emotionalIntensity

  if (score <= 40) {
    return "low"
  }

  if (score <= 70) {
    return "mid"
  }

  return "high"
}

function topToneLabel(analysis: AnalysisResult): string {
  const topTone = Object.entries(analysis.tones)
    .filter(([key]) => key !== "neutral")
    .sort(([, left], [, right]) => right - left)[0]

  return topTone ? readableKey(topTone[0]) : "neutral"
}

function hasRedFlagCategory(analysis: AnalysisResult): boolean {
  return analysis.categories.some((category) => category.id === "graphic-injury-gore")
}

function contentWarningLabel(analysis: AnalysisResult): string | undefined {
  const redFlagCategory = analysis.categories.find((category) => category.id === "graphic-injury-gore")
  return redFlagCategory ? ` Category: ${redFlagCategory.label}.` : undefined
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function cssEscape(value: string): string {
  if ("CSS" in window && typeof CSS.escape === "function") {
    return CSS.escape(value)
  }

  return value.replace(/"/g, '\\"')
}

function readableKey(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/-/g, " ").toLowerCase()
}
