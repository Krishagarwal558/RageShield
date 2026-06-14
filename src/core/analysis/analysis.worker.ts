import { RuleBasedAnalysisProvider } from "~core/analysis/engine"
import type { AnalysisResult, ContentItem, FeedGuardSettings } from "~core/types"

type WorkerRequest = {
  requestId: string
  item: ContentItem
  settings: FeedGuardSettings
}

type WorkerResponse = {
  requestId: string
  result?: AnalysisResult
  error?: string
}

const provider = new RuleBasedAnalysisProvider()

self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  void provider
    .analyze(event.data.item, event.data.settings)
    .then((result) => {
      const response: WorkerResponse = {
        requestId: event.data.requestId,
        result
      }
      self.postMessage(response)
    })
    .catch((error: unknown) => {
      const response: WorkerResponse = {
        requestId: event.data.requestId,
        error: error instanceof Error ? error.message : "Unknown worker analysis error."
      }
      self.postMessage(response)
    })
})
