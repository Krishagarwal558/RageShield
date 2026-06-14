import type { AnalysisResult, ContentItem, FeedGuardDecision } from "~core/types"

export interface DetectedContentItem extends ContentItem {
  element: HTMLElement
  titleElement?: HTMLElement
  mountElement?: HTMLElement
}

export interface PlatformAdapter {
  detectContent(): DetectedContentItem[]
  injectBadge(item: DetectedContentItem, analysis: AnalysisResult, onOpen: () => void): void
  injectOverlay(item: DetectedContentItem, analysis: AnalysisResult, decision: FeedGuardDecision, onReveal: () => void): void
  clearOverlay(item: DetectedContentItem): void
  start(): void
  stop(): void
}

export interface PlatformAdapterEvents {
  onContentChanged: () => void
  onReplyTextChanged: (target: HTMLElement, text: string) => void
}
