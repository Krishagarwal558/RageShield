import type { RewriteResult } from "~core/types"

const REPLACEMENTS: Array<[RegExp, string, string]> = [
  [/\bDESTROYED\b/gi, "criticized", "Softened destructive framing."],
  [/\bEXPOSED\b/gi, "examined", "Replaced scandal framing."],
  [/\bSHOCKING\b/gi, "notable", "Reduced surprise cue."],
  [/\bINSANE\b/gi, "unusual", "Reduced emotional intensity."],
  [/\bEVERYTHING\b/gi, "several things", "Reduced totalizing language."],
  [/\bNobody can deny\b/gi, "Some observers argue", "Reduced certainty language."],
  [/\bEveryone knows\b/gi, "Many people believe", "Reduced certainty language."],
  [/\bBefore it'?s too late\b/gi, "soon", "Reduced urgency cue."],
  [/\bYou won'?t believe\b/gi, "A report discusses", "Reduced clickbait framing."],
  [/\bThey don'?t want you to know\b/gi, "A less-discussed claim says", "Reduced conspiracy framing."],
  [/\bLast chance\b/gi, "Limited-time", "Reduced urgency cue."],
  [/\bEveryone is talking about\b/gi, "Some people are discussing", "Reduced bandwagon framing."],
  [/\bThis will change your life\b/gi, "This may be useful", "Reduced transformational promise."],
  [/\bThe truth about\b/gi, "A closer look at", "Reduced certainty framing."],
  [/\bWake up\b/gi, "Consider this", "Reduced alarm framing."]
]

export function rewriteHeadlineNeutral(original: string): RewriteResult | undefined {
  const trimmed = original.trim()

  if (!trimmed) {
    return undefined
  }

  let neutral = trimmed.replace(/\s+/g, " ")
  const changes: string[] = []

  for (const [pattern, replacement, change] of REPLACEMENTS) {
    if (pattern.test(neutral)) {
      neutral = neutral.replace(pattern, replacement)
      changes.push(change)
    }
  }

  if (/[A-Z]{4,}/.test(trimmed)) {
    neutral = sentenceCase(neutral)
    changes.push("Converted all-caps emphasis to sentence case.")
  }

  neutral = neutral
    .replace(/!{2,}/g, ".")
    .replace(/\?{2,}/g, "?")
    .replace(/\s+([?.!,])/g, "$1")
    .trim()

  if (neutral === trimmed && changes.length === 0) {
    return undefined
  }

  return {
    original: trimmed,
    neutral,
    changes
  }
}

function sentenceCase(value: string): string {
  const lower = value.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}
