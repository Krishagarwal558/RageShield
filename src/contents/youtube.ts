import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:~contents/youtube.css"
import { createDefaultAnalysisProvider } from "~core/analysis/providers"
import { evaluateFeedGuard } from "~core/feedguard/engine"
import { YouTubeAdapter } from "~core/platforms/youtubeAdapter"
import type { DetectedContentItem } from "~core/platforms/types"
import { checkReplyTone } from "~core/replyChecker"
import { getSettings, subscribeToSettings } from "~core/storage/chromeStorage"
import { DEFAULT_SETTINGS } from "~core/storage/defaults"
import { hashString } from "~core/utils/hash"
import { throttle } from "~core/utils/debounce"
import type { AnalysisResult, AnalyticsEvent, FeedGuardSettings } from "~core/types"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"],
  all_frames: false,
  run_at: "document_idle"
}

type QueueEntry = {
  item: DetectedContentItem
  attempts: number
}

const provider = createDefaultAnalysisProvider()
const analysisCache = new Map<string, Promise<AnalysisResult>>()
const processedItems = new Set<string>()
const queue = new Map<string, QueueEntry>()
const revealedItems = new Set<string>()
const latestDebugRows: unknown[] = []
let settings: FeedGuardSettings = DEFAULT_SETTINGS
let activePanelItemId: string | undefined
let activeCount = 0

injectStyles()

void getSettings().then((loaded) => {
  settings = loaded
  scheduleScan()
})

subscribeToSettings((nextSettings) => {
  settings = nextSettings
  processedItems.clear()
  scheduleScan()
})

const adapter = new YouTubeAdapter({
  onContentChanged: () => scheduleScan(),
  onReplyTextChanged: (target, text) => handleReplyText(target, text)
})

adapter.start()
installDebugHook()
window.addEventListener("scroll", throttle(scheduleScan, 500), { passive: true })
window.addEventListener("yt-navigate-finish", () => {
  processedItems.clear()
  queue.clear()
  scheduleScan()
})

function scheduleScan(): void {
  const items = adapter.detectContent()

  for (const item of items) {
    if (processedItems.has(item.id) || item.element.dataset.rsfgProcessing === "true") {
      continue
    }

    queue.set(item.id, { item, attempts: 0 })
  }

  void processQueue()
}

async function processQueue(): Promise<void> {
  if (activeCount >= 2 || queue.size === 0) {
    return
  }

  const entry = queue.values().next().value as QueueEntry | undefined

  if (!entry) {
    return
  }

  queue.delete(entry.item.id)
  activeCount += 1
  entry.item.element.dataset.rsfgProcessing = "true"

  try {
    await idle()
    await analyzeAndRender(entry.item)
  } catch {
    if (entry.attempts < 2) {
      queue.set(entry.item.id, { ...entry, attempts: entry.attempts + 1 })
    }
  } finally {
    activeCount -= 1
    delete entry.item.element.dataset.rsfgProcessing
    if (queue.size > 0) {
      void processQueue()
    }
  }
}

async function analyzeAndRender(item: DetectedContentItem): Promise<void> {
  const analysis = await getAnalysis(item)
  processedItems.add(item.id)

  if (settings.badgeEnabled) {
    adapter.injectBadge(item, analysis, () => openPanel(item, analysis))
  }

  const decision = evaluateFeedGuard(item, analysis, settings)
  captureDebugRow(item, analysis, decision)

  if (decision.action === "allow" || revealedItems.has(item.id)) {
    adapter.clearOverlay(item)
  } else {
    adapter.injectOverlay(item, analysis, decision, () => {
      revealedItems.add(item.id)
      adapter.clearOverlay(item)
    })
  }

  if (settings.analyticsEnabled) {
    recordEvent(item, analysis, decision)
  }
}

function captureDebugRow(item: DetectedContentItem, analysis: AnalysisResult, decision: ReturnType<typeof evaluateFeedGuard>): void {
  const row = {
    surface: item.surface,
    title: item.title,
    author: item.author,
    categories: analysis.categories.map((category) => `${category.label}:${category.score}`),
    intensity: analysis.emotionalIntensity,
    action: decision.action,
    reasons: decision.reasons
  }
  latestDebugRows.unshift(row)
  latestDebugRows.splice(12)

  if (globalThis.localStorage?.getItem("rsfgDebug") === "1") {
    console.table([row])
  }
}

function installDebugHook(): void {
  ;(window as unknown as { __rsfgDebug?: () => unknown }).__rsfgDebug = () => latestDebugRows
}

function getAnalysis(item: DetectedContentItem): Promise<AnalysisResult> {
  const cached = analysisCache.get(item.id)

  if (cached) {
    return cached
  }

  const promise = provider.analyze(item, settings)
  analysisCache.set(item.id, promise)
  return promise
}

function openPanel(item: DetectedContentItem, analysis: AnalysisResult): void {
  if (!settings.detailPanelEnabled) {
    return
  }

  activePanelItemId = item.id
  document.querySelector(".rsfg-panel")?.remove()

  const panel = document.createElement("aside")
  panel.className = "rsfg-panel"
  panel.setAttribute("role", "dialog")
  panel.setAttribute("aria-label", "RageShield analysis panel")
  panel.innerHTML = renderPanel(item, analysis)
  document.body.appendChild(panel)

  panel.querySelector(".rsfg-panel-close")?.addEventListener("click", () => {
    if (activePanelItemId === item.id) {
      activePanelItemId = undefined
    }

    panel.remove()
  })

  panel.querySelector(".rsfg-copy-button")?.addEventListener("click", () => {
    const rewrite = analysis.neutralRewrite?.neutral

    if (rewrite) {
      void navigator.clipboard.writeText(rewrite)
    }
  })
}

function renderPanel(item: DetectedContentItem, analysis: AnalysisResult): string {
  const techniques = Object.entries(analysis.techniques)
    .filter(([, score]) => score > 0)
    .sort(([, left], [, right]) => right - left)
    .map(([key, score]) => barRow(readableKey(key), score))
    .join("")
  const tones = Object.entries(analysis.tones)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 4)
    .map(([key, score]) => barRow(readableKey(key), score))
    .join("")
  const categories = analysis.categories
    .slice(0, 4)
    .map((category) => barRow(category.label, category.score))
    .join("")
  const nutrition = [
    ["Information Value", analysis.nutritionLabel.informationValue],
    ["Emotional Intensity", analysis.nutritionLabel.emotionalIntensity],
    ["Manipulation Risk", analysis.nutritionLabel.manipulationRisk],
    ["Novelty", analysis.nutritionLabel.noveltyScore],
    ["Clickbait", analysis.nutritionLabel.clickbaitScore]
  ]
    .map(([label, score]) => barRow(String(label), Number(score)))
    .join("")
  const summarySignals = analysis.summary.mainSignals
    .map((signal) => `<li>${escapeHtml(signal)}</li>`)
    .join("")
  const triggers = settings.transparencyMode
    ? analysis.triggers
        .slice(0, 8)
        .map((trigger) => `<li><strong>${escapeHtml(trigger.phrase)}</strong><br>${escapeHtml(trigger.explanation)}</li>`)
        .join("")
    : ""
  const rewrite = analysis.neutralRewrite
    ? `
      <div class="rsfg-section">
        <h3>Neutral Rewrite</h3>
        <div class="rsfg-rewrite-box">
          <strong>Original:</strong><br>${escapeHtml(analysis.neutralRewrite.original)}<br><br>
          <strong>Neutral:</strong><br>${escapeHtml(analysis.neutralRewrite.neutral)}
        </div>
        <button type="button" class="rsfg-copy-button">Copy</button>
      </div>
    `
    : ""

  return `
    <div class="rsfg-panel-header">
      <div>
        <div class="rsfg-panel-title">RageShield Analysis</div>
        <div class="rsfg-panel-subtitle">${escapeHtml(item.surface.replace("youtube-", "YouTube "))}</div>
      </div>
      <button type="button" class="rsfg-panel-close" aria-label="Close">x</button>
    </div>
    <div class="rsfg-panel-body">
      <div class="rsfg-score-row">
        <div>
          <div class="rsfg-panel-subtitle">Emotional Intensity</div>
          <div class="rsfg-score-big">${analysis.emotionalIntensity} / 100</div>
        </div>
        <strong>${escapeHtml(analysis.intensityLabel)}</strong>
      </div>
      <div class="rsfg-meter"><span style="width:${analysis.emotionalIntensity}%"></span></div>
      <div class="rsfg-section">
        <strong>Feed Summary</strong><br>
        ${escapeHtml(analysis.summary.short)}
        <ul class="rsfg-compact-list">${summarySignals}</ul>
      </div>
      <div class="rsfg-section">${escapeHtml(analysis.explanation)}</div>
      <div class="rsfg-section">
        <h3>Digital Nutrition Label</h3>
        ${nutrition}
      </div>
      <div class="rsfg-section">
        <h3>Content Density</h3>
        ${barRow("Signal to noise", analysis.contentDensity.signalToNoise)}
        ${barRow("Low information", analysis.contentDensity.lowInformation)}
        ${barRow("Repetitive filler", analysis.contentDensity.repetitiveFiller)}
        <div class="rsfg-panel-subtitle">${escapeHtml(analysis.contentDensity.label)}</div>
      </div>
      <div class="rsfg-section">
        <h3>Categories</h3>
        ${categories || "<div class=\"rsfg-panel-subtitle\">No strong category detected.</div>"}
      </div>
      <div class="rsfg-section">
        <h3>Detected Techniques</h3>
        ${techniques || "<div class=\"rsfg-panel-subtitle\">No strong persuasion techniques detected.</div>"}
      </div>
      <div class="rsfg-section">
        <h3>Emotional Tone</h3>
        ${tones}
      </div>
      <div class="rsfg-section">
        <h3>Exact Triggers</h3>
        <ul class="rsfg-trigger-list">${
          settings.transparencyMode ? triggers || "<li>No exact trigger matched.</li>" : "<li>Transparency mode is off.</li>"
        }</ul>
      </div>
      ${rewrite}
    </div>
  `
}

function barRow(label: string, score: number): string {
  return `
    <div class="rsfg-bar-row">
      <div>
        <div>${escapeHtml(label)}</div>
        <div class="rsfg-bar-track"><span style="width:${score}%"></span></div>
      </div>
      <strong>${score}</strong>
    </div>
  `
}

function handleReplyText(target: HTMLElement, text: string): void {
  if (!settings.replyCheckerEnabled || text.trim().length < 4) {
    target.parentElement?.querySelector(".rsfg-reply-warning")?.remove()
    return
  }

  const result = checkReplyTone(text)
  target.parentElement?.querySelector(".rsfg-reply-warning")?.remove()

  if (result.safe) {
    return
  }

  const warning = document.createElement("div")
  warning.className = "rsfg-reply-warning"
  warning.innerHTML = `
    <strong>Reply check</strong>
    This draft may read as aggressive. Suggestions:
    <ul>${result.suggestions.map((suggestion) => `<li>${escapeHtml(suggestion)}</li>`).join("")}</ul>
  `
  target.insertAdjacentElement("afterend", warning)
}

function recordEvent(
  item: DetectedContentItem,
  analysis: AnalysisResult,
  decision: ReturnType<typeof evaluateFeedGuard>
): void {
  const event: AnalyticsEvent = {
    id: hashString(`${item.id}-${analysis.analyzedAt}`),
    contentId: item.id,
    platform: item.platform,
    surface: item.surface,
    url: item.url,
    sourceName: item.author,
    title: item.title,
    timestamp: Date.now(),
    emotionalIntensity: analysis.emotionalIntensity,
    intensityLabel: analysis.intensityLabel,
    techniques: analysis.techniques,
    tones: analysis.tones,
    categories: analysis.categories,
    contentDensity: analysis.contentDensity,
    nutritionLabel: analysis.nutritionLabel,
    summary: analysis.summary,
    decisionAction: decision.action,
    blocked: decision.action !== "allow"
  }

  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: "RSFG_RECORD_EVENT", event }).catch(() => undefined)
  }
}

function injectStyles(): void {
  if (document.getElementById("rsfg-youtube-styles")) {
    return
  }

  const style = document.createElement("style")
  style.id = "rsfg-youtube-styles"
  style.textContent = cssText
  document.documentElement.appendChild(style)
}

function idle(): Promise<void> {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => resolve(), { timeout: 800 })
      return
    }

    globalThis.setTimeout(resolve, 16)
  })
}

function readableKey(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/-/g, " ").toLowerCase()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
