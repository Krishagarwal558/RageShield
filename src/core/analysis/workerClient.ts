import { RuleBasedAnalysisProvider, type AnalysisProvider } from "~core/analysis/engine"
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

export class AnalysisWorkerClient implements AnalysisProvider {
  public readonly id = "web-worker-rule-engine"
  public readonly name = "Web Worker Rule Engine"

  private worker?: Worker
  private fallback = new RuleBasedAnalysisProvider()
  private pending = new Map<
    string,
    {
      resolve: (result: AnalysisResult) => void
      reject: (error: Error) => void
      timeoutId: number
    }
  >()

  public constructor() {
    try {
      this.worker = new Worker(new URL("./analysis.worker.ts", import.meta.url), { type: "module" })
      this.worker.addEventListener("message", this.handleMessage)
      this.worker.addEventListener("error", () => {
        this.teardown()
      })
    } catch {
      this.worker = undefined
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.worker)
  }

  public async analyze(item: ContentItem, settings: FeedGuardSettings): Promise<AnalysisResult> {
    if (!this.worker) {
      return this.fallback.analyze(item, settings)
    }

    const requestId = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const payload: WorkerRequest = { requestId, item, settings }

    return new Promise<AnalysisResult>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pending.delete(requestId)
        void this.fallback.analyze(item, settings).then(resolve, reject)
      }, 2500)

      this.pending.set(requestId, { resolve, reject, timeoutId })
      this.worker?.postMessage(payload)
    })
  }

  private handleMessage = (event: MessageEvent<WorkerResponse>) => {
    const pendingRequest = this.pending.get(event.data.requestId)

    if (!pendingRequest) {
      return
    }

    window.clearTimeout(pendingRequest.timeoutId)
    this.pending.delete(event.data.requestId)

    if (event.data.error || !event.data.result) {
      pendingRequest.reject(new Error(event.data.error ?? "Analysis worker returned no result."))
      return
    }

    pendingRequest.resolve(event.data.result)
  }

  private teardown(): void {
    this.worker?.removeEventListener("message", this.handleMessage)
    this.worker?.terminate()
    this.worker = undefined
  }
}
