import type {
  EmotionalToneKey,
  SensitivityLevel,
  TechniqueScores,
  ToneScores
} from "~core/types"

export const EMPTY_TECHNIQUE_SCORES: TechniqueScores = {
  fearAppeal: 0,
  usVsThem: 0,
  certaintyLanguage: 0,
  engagementBait: 0,
  mockery: 0,
  personalAttack: 0,
  exaggeration: 0,
  urgency: 0,
  fomo: 0,
  guiltPersuasion: 0,
  victimhoodFraming: 0,
  conspiracyFraming: 0,
  adHominem: 0,
  strawman: 0,
  falseDilemma: 0,
  bandwagon: 0,
  appealToAuthority: 0,
  appealToEmotion: 0,
  slipperySlope: 0,
  confirmationBias: 0
}

export const EMPTY_TONE_SCORES: ToneScores = {
  anger: 0,
  fear: 0,
  anxiety: 0,
  contempt: 0,
  excitement: 0,
  neutral: 0,
  informational: 0
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function getSensitivityMultiplier(sensitivity: SensitivityLevel): number {
  if (sensitivity === "relaxed") {
    return 0.84
  }

  if (sensitivity === "strict") {
    return 1.16
  }

  return 1
}

export function intensityLabel(score: number): string {
  if (score <= 20) {
    return "Informational"
  }

  if (score <= 40) {
    return "Lightly Emotional"
  }

  if (score <= 60) {
    return "Emotionally Charged"
  }

  if (score <= 80) {
    return "Highly Persuasive"
  }

  return "Extreme Emotional Manipulation"
}

export function scoreEmotionalIntensity(
  techniques: TechniqueScores,
  tones: ToneScores,
  sensitivity: SensitivityLevel
): number {
  const techniqueValues = Object.values(techniques)
  const tonePressure =
    tones.anger * 0.22 +
    tones.fear * 0.18 +
    tones.anxiety * 0.18 +
    tones.contempt * 0.2 +
    tones.excitement * 0.08 -
    tones.informational * 0.1 -
    tones.neutral * 0.05

  const techniquePressure =
    techniqueValues.reduce((sum, score) => sum + score, 0) / 4 + Math.max(...techniqueValues) * 0.35

  return clampScore((techniquePressure + tonePressure) * getSensitivityMultiplier(sensitivity))
}

export function normalizeToneScores(scores: ToneScores): ToneScores {
  const chargedTones: EmotionalToneKey[] = ["anger", "fear", "anxiety", "contempt", "excitement"]
  const chargedMax = Math.max(...chargedTones.map((key) => scores[key]))
  const informational = scores.informational
  const neutral = Math.max(0, 100 - chargedMax - informational * 0.5)

  return {
    ...scores,
    neutral: clampScore(neutral),
    informational: clampScore(informational)
  }
}
