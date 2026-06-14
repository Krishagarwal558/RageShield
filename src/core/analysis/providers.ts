import { RuleBasedAnalysisProvider, type AnalysisProvider } from "~core/analysis/engine"
import { AnalysisWorkerClient } from "~core/analysis/workerClient"

export type AnalysisProviderId =
  | "local-rule-engine"
  | "web-worker-rule-engine"
  | "transformers-js"
  | "onnx-runtime"
  | "local-llm"
  | "ollama"
  | "openai"
  | "gemini"
  | "anthropic"

export interface ProviderDescriptor {
  id: AnalysisProviderId
  label: string
  localByDefault: boolean
  availableInMvp: boolean
}

export const PROVIDER_DESCRIPTORS: ProviderDescriptor[] = [
  { id: "web-worker-rule-engine", label: "Web Worker Rule Engine", localByDefault: true, availableInMvp: true },
  { id: "local-rule-engine", label: "Local Rule Engine", localByDefault: true, availableInMvp: true },
  { id: "transformers-js", label: "Transformers.js", localByDefault: true, availableInMvp: false },
  { id: "onnx-runtime", label: "ONNX Runtime", localByDefault: true, availableInMvp: false },
  { id: "local-llm", label: "Local LLM", localByDefault: true, availableInMvp: false },
  { id: "ollama", label: "Ollama", localByDefault: true, availableInMvp: false },
  { id: "openai", label: "OpenAI", localByDefault: false, availableInMvp: false },
  { id: "gemini", label: "Gemini", localByDefault: false, availableInMvp: false },
  { id: "anthropic", label: "Anthropic", localByDefault: false, availableInMvp: false }
]

export function createDefaultAnalysisProvider(): AnalysisProvider {
  const workerClient = new AnalysisWorkerClient()
  return workerClient.isAvailable() ? workerClient : new RuleBasedAnalysisProvider()
}
