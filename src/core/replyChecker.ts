import type { TriggerHit } from "~core/types"

const AGGRESSIVE_PATTERNS: Array<{ pattern: RegExp; label: string; replacement: string }> = [
  {
    pattern: /\b(you'?re|you are)\s+(an?\s+)?(idiot|moron|braindead|clown)\b/i,
    label: "Personal attack",
    replacement: "I disagree with this because..."
  },
  {
    pattern: /\b(stupid|pathetic|delusional|trash)\b/i,
    label: "Mockery",
    replacement: "I read this differently because..."
  },
  {
    pattern: /\b(shut up|touch grass|learn to read)\b/i,
    label: "Dismissive phrasing",
    replacement: "Could you clarify how you are interpreting..."
  }
]

export interface ReplyCheckResult {
  safe: boolean
  score: number
  triggers: TriggerHit[]
  suggestions: string[]
}

export function checkReplyTone(text: string): ReplyCheckResult {
  const triggers: TriggerHit[] = []
  const suggestions = new Set<string>()

  for (const rule of AGGRESSIVE_PATTERNS) {
    const match = text.match(rule.pattern)

    if (!match?.[0]) {
      continue
    }

    triggers.push({
      type: "technique",
      key: rule.label,
      phrase: match[0],
      score: 82,
      explanation: `${rule.label} can escalate the conversation.`
    })
    suggestions.add(rule.replacement)
  }

  if (text.includes("!!!") || /[A-Z]{8,}/.test(text)) {
    triggers.push({
      type: "tone",
      key: "high-emphasis",
      phrase: text.includes("!!!") ? "!!!" : "ALL CAPS",
      score: 68,
      explanation: "High emphasis can read as aggressive."
    })
    suggestions.add("I want to push back on this point without making it personal.")
  }

  return {
    safe: triggers.length === 0,
    score: Math.min(100, triggers.reduce((sum, trigger) => sum + trigger.score, 0) / Math.max(1, triggers.length)),
    triggers,
    suggestions: Array.from(suggestions).slice(0, 3)
  }
}
