import {
  CATEGORY_PATTERNS,
  TECHNIQUE_PATTERNS,
  TONE_PATTERNS,
  type RulePattern
} from "~core/analysis/patterns"
import {
  EMPTY_TECHNIQUE_SCORES,
  EMPTY_TONE_SCORES,
  clampScore,
  intensityLabel,
  normalizeToneScores,
  scoreEmotionalIntensity
} from "~core/analysis/scoring"
import { rewriteHeadlineNeutral } from "~core/analysis/rewrite"
import { getCategoryLabel } from "~core/feedguard/categories"
import type {
  AnalysisResult,
  CategoryId,
  CategoryScore,
  ContentDensityScore,
  ContentItem,
  CustomAiCategory,
  DigitalNutritionLabel,
  FeedGuardSettings,
  PersuasionTechniqueKey,
  TechniqueScores,
  ToneScores,
  TriggerHit
} from "~core/types"

export interface AnalysisProvider {
  id: string
  name: string
  analyze(item: ContentItem, settings: FeedGuardSettings): Promise<AnalysisResult>
}

export class RuleBasedAnalysisProvider implements AnalysisProvider {
  public readonly id = "local-rule-engine"
  public readonly name = "Local rule engine"

  public async analyze(item: ContentItem, settings: FeedGuardSettings): Promise<AnalysisResult> {
    const text = [item.title, item.body, item.author].filter(Boolean).join(" \n ")
    const triggers: TriggerHit[] = []
    const techniques = scorePatterns(TECHNIQUE_PATTERNS, text, triggers, "technique", EMPTY_TECHNIQUE_SCORES)
    const rawTones = scorePatterns(TONE_PATTERNS, text, triggers, "tone", EMPTY_TONE_SCORES)
    const tones = normalizeToneScores(rawTones)
    const categories = scoreCategories(text, triggers, settings)

    for (const trigger of settings.customTriggers) {
      if (!trigger.enabled || !trigger.pattern.trim()) {
        continue
      }

      if (text.toLowerCase().includes(trigger.pattern.toLowerCase())) {
        triggers.push({
          type: "custom",
          key: trigger.id,
          phrase: trigger.pattern,
          score: trigger.score,
          explanation: `Matched custom trigger "${trigger.label}".`
        })
      }
    }

    const customPressure = triggers
      .filter((trigger) => trigger.type === "custom")
      .reduce((max, trigger) => Math.max(max, trigger.score), 0)
    const emotionalIntensity = clampScore(
      Math.max(scoreEmotionalIntensity(techniques, tones, settings.sensitivity), customPressure)
    )
    const contentDensity = scoreContentDensity(text)
    const nutritionLabel = buildNutritionLabel(emotionalIntensity, techniques, tones, categories, contentDensity, text)
    const summary = summarizeContent(categories, tones, techniques, nutritionLabel)

    return {
      contentId: item.id,
      providerId: this.id,
      analyzedAt: Date.now(),
      emotionalIntensity,
      intensityLabel: intensityLabel(emotionalIntensity),
      techniques,
      tones,
      categories,
      triggers,
      contentDensity,
      nutritionLabel,
      summary,
      explanation: buildExplanation(emotionalIntensity, techniques, tones, triggers),
      neutralRewrite: rewriteHeadlineNeutral(item.title)
    }
  }
}

function scorePatterns<TKey extends string>(
  patterns: Array<RulePattern<TKey>>,
  text: string,
  triggers: TriggerHit[],
  triggerType: TriggerHit["type"],
  emptyScores: Record<TKey, number>
): Record<TKey, number> {
  const scores: Record<TKey, number> = { ...emptyScores }

  for (const rule of patterns) {
    const matches = text.match(rule.pattern)

    if (!matches?.[0]) {
      continue
    }

    const allCapsBoost = /[A-Z]{5,}/.test(text) ? 8 : 0
    const punctuationBoost = /!!|\?\?/.test(text) ? 6 : 0
    const score = clampScore((scores[rule.key] ?? 0) + rule.score + allCapsBoost + punctuationBoost)
    scores[rule.key] = score
    triggers.push({
      type: triggerType,
      key: rule.key,
      phrase: matches[0],
      score,
      explanation: rule.explanation
    })
  }

  return scores
}

function scoreCategories(text: string, triggers: TriggerHit[], settings: FeedGuardSettings): CategoryScore[] {
  const categories: CategoryScore[] = []

  for (const rule of CATEGORY_PATTERNS) {
    const match = text.match(rule.pattern)

    if (!match?.[0]) {
      continue
    }

    const semanticBoost = hasSemanticDramaFrame(text) && isDramaCategory(rule.key) ? 18 : 0
    const score = clampScore(rule.score + semanticBoost)
    categories.push({
      id: rule.key,
      label: rule.label,
      score,
      reasons: [rule.explanation]
    })
    triggers.push({
      type: "category",
      key: rule.key,
      phrase: match[0],
      score,
      explanation: rule.explanation
    })
  }

  for (const inferred of inferContextualCategories(text)) {
    categories.push(inferred)
    triggers.push({
      type: "category",
      key: inferred.id,
      phrase: "context match",
      score: inferred.score,
      explanation: inferred.reasons[0] ?? "Matched context-aware category signals."
    })
  }

  for (const customCategory of settings.customAiCategories) {
    const customMatch = scoreCustomAiCategory(text, customCategory, categories)

    if (!customMatch) {
      continue
    }

    categories.push(customMatch)
    triggers.push({
      type: "customCategory",
      key: customCategory.id,
      phrase: customCategory.prompt,
      score: customMatch.score,
      explanation: customMatch.reasons[0] ?? `Matched custom category "${customCategory.label}".`
    })
  }

  if (categories.length === 0) {
    categories.push({
      id: "other",
      label: getCategoryLabel("other"),
      score: 30,
      reasons: ["No category matched strongly enough."]
    })
  }

  return mergeCategoryScores(categories).sort((left, right) => right.score - left.score).slice(0, 4)
}

function inferContextualCategories(text: string): CategoryScore[] {
  const normalized = text.toLowerCase()
  const inferred: CategoryScore[] = []

  if (/\b(spoiler|ending|leak|leaked|finale|chapter)\b/i.test(text)) {
    if (/\b(anime|episode|arc|character death)\b/i.test(text)) {
      inferred.push(contextCategory("anime-spoilers", "Anime Spoilers", 62, "Matched spoiler language in an anime context."))
    }

    if (/\b(manga|chapter|raw scans|panel)\b/i.test(text)) {
      inferred.push(contextCategory("manga-spoilers", "Manga Spoilers", 62, "Matched spoiler language in a manga context."))
    }

    if (/\b(movie|film|post credit|cinema)\b/i.test(text)) {
      inferred.push(contextCategory("movie-spoilers", "Movie Spoilers", 62, "Matched spoiler language in a movie context."))
    }

    if (/\b(tv|series|season|episode|finale)\b/i.test(text)) {
      inferred.push(contextCategory("tv-spoilers", "TV Spoilers", 62, "Matched spoiler language in a TV context."))
    }

    if (/\b(game|boss|campaign|patch|skin|agent|map)\b/i.test(text)) {
      inferred.push(contextCategory("game-spoilers", "Game Spoilers", 60, "Matched spoiler or leak language in a game context."))
    }
  }

  if (hasSemanticDramaFrame(text) && /\b(creator|influencer|streamer|fans|fandom|stan|community)\b/i.test(text)) {
    inferred.push(contextCategory("drama-commentary", "Drama Commentary", 58, "Matched controversy framing around a creator or fan community."))
  }

  if (/\b(collapse|crisis|doomed|getting worse|bad news)\b/i.test(text) && /\b(news|world|economy|war|crime|disaster)\b/i.test(text)) {
    inferred.push(contextCategory("doomscroll-news", "Doomscroll News", 64, "Matched repeated crisis framing that can encourage doomscrolling."))
  }

  if (/\b(shorts|#shorts|quick clip|60 seconds)\b/i.test(text) || normalized.length <= 80) {
    inferred.push(contextCategory("shorts", "Shorts", normalized.length <= 80 ? 42 : 55, "Matched short-form or very low-context content signals."))
  }

  return inferred
}

function contextCategory(id: CategoryId, label: string, score: number, reason: string): CategoryScore {
  return {
    id,
    label,
    score,
    reasons: [reason]
  }
}

function scoreCustomAiCategory(
  text: string,
  customCategory: CustomAiCategory,
  currentCategories: CategoryScore[]
): CategoryScore | undefined {
  if (!customCategory.enabled || !customCategory.prompt.trim()) {
    return undefined
  }

  const normalized = text.toLowerCase()
  const prompt = customCategory.prompt.toLowerCase()

  if (prompt.includes("unrelated to programming")) {
    const hasProgrammingSignal =
      currentCategories.some((category) => category.id === "programming") ||
      /\b(programming|coding|software|developer|typescript|javascript|python|react|api|database)\b/i.test(text)

    if (hasProgrammingSignal) {
      return undefined
    }

    return {
      id: customCategory.id,
      label: customCategory.label,
      score: customCategory.score,
      reasons: ["Custom category matched because the item lacks programming-related context."]
    }
  }

  const terms = extractPromptTerms(prompt)
  const matches = terms.filter((term) => normalized.includes(term))

  if (matches.length === 0) {
    return undefined
  }

  return {
    id: customCategory.id,
    label: customCategory.label,
    score: clampScore(customCategory.score + matches.length * 6),
    reasons: [`Custom category matched: ${matches.slice(0, 4).join(", ")}.`]
  }
}

function extractPromptTerms(prompt: string): string[] {
  return Array.from(
    new Set(
      prompt
        .replace(/hide anything related to|hide|anything|related|content|unrelated|only|show|about|to|the/gi, " ")
        .split(/[^a-z0-9+#.]+/i)
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length >= 3 && !CUSTOM_CATEGORY_STOPWORDS.has(term))
    )
  )
}

function mergeCategoryScores(categories: CategoryScore[]): CategoryScore[] {
  const merged = new Map<CategoryId, CategoryScore>()

  for (const category of categories) {
    const current = merged.get(category.id)

    if (!current || category.score > current.score) {
      merged.set(category.id, {
        ...category,
        reasons: Array.from(new Set([...(current?.reasons ?? []), ...category.reasons]))
      })
      continue
    }

    current.reasons = Array.from(new Set([...current.reasons, ...category.reasons]))
  }

  return Array.from(merged.values())
}

function scoreContentDensity(text: string): ContentDensityScore {
  const words = tokenizeWords(text)
  const uniqueWords = new Set(words)

  if (words.length === 0) {
    return {
      signalToNoise: 0,
      lowInformation: 100,
      repetitiveFiller: 100,
      uniqueWordRatio: 0,
      label: "No text"
    }
  }

  const contentWords = words.filter((word) => word.length > 2 && !DENSITY_STOPWORDS.has(word))
  const uniqueContentWords = new Set(contentWords)
  const fillerMatches = text.match(/\b(like|subscribe|comment|share|follow|watch until the end|smash|bro|guys|literally|basically)\b/gi)?.length ?? 0
  const uniqueWordRatio = clampScore((uniqueWords.size / words.length) * 100)
  const signalToNoise = clampScore((contentWords.length / words.length) * 100 + Math.min(18, uniqueContentWords.size * 1.2))
  const shortPenalty = words.length < 8 ? 34 : words.length < 16 ? 16 : 0
  const repetitionPenalty = clampScore(((words.length - uniqueWords.size) / words.length) * 100)
  const lowInformation = clampScore(100 - signalToNoise + shortPenalty + fillerMatches * 7)
  const repetitiveFiller = clampScore(repetitionPenalty + fillerMatches * 12)

  return {
    signalToNoise,
    lowInformation,
    repetitiveFiller,
    uniqueWordRatio,
    label: lowInformation >= 65 ? "Low information" : signalToNoise >= 68 ? "High signal" : "Mixed density"
  }
}

function buildNutritionLabel(
  emotionalIntensity: number,
  techniques: TechniqueScores,
  tones: ToneScores,
  categories: CategoryScore[],
  density: ContentDensityScore,
  text: string
): DigitalNutritionLabel {
  const techniqueValues = Object.values(techniques)
  const manipulationRisk = clampScore(
    Math.max(...techniqueValues) * 0.65 +
      emotionalIntensity * 0.28 +
      (categories.some((category) => category.score >= 65) ? 8 : 0)
  )
  const clickbaitScore = clampScore(
    Math.max(
      techniques.engagementBait,
      techniques.exaggeration,
      techniques.urgency,
      techniques.fomo,
      techniques.certaintyLanguage
    ) +
      (/[A-Z]{5,}/.test(text) ? 8 : 0) +
      (/!!|\?\?/.test(text) ? 7 : 0)
  )
  const noveltyScore = density.uniqueWordRatio
  const informationValue = clampScore(
    density.signalToNoise * 0.45 +
      tones.informational * 0.32 +
      noveltyScore * 0.25 -
      clickbaitScore * 0.22 -
      emotionalIntensity * 0.12
  )

  return {
    informationValue,
    emotionalIntensity,
    manipulationRisk,
    noveltyScore,
    clickbaitScore
  }
}

function summarizeContent(
  categories: CategoryScore[],
  tones: ToneScores,
  techniques: TechniqueScores,
  nutrition: DigitalNutritionLabel
): { short: string; mainSignals: string[] } {
  const topCategory = categories[0]?.label ?? "Uncategorized"
  const topTone = Object.entries(tones)
    .filter(([key]) => key !== "neutral")
    .sort(([, left], [, right]) => right - left)[0]
  const topTechniques = Object.entries(techniques)
    .filter(([, score]) => score > 0)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 2)
    .map(([key]) => readableKey(key))
  const toneText = topTone ? readableKey(topTone[0]) : "neutral"
  const techniqueText = topTechniques.length > 0 ? ` with ${topTechniques.join(" and ")} cues` : ""
  const short = `${topCategory} content with a ${toneText} tone${techniqueText}.`

  return {
    short,
    mainSignals: [
      `Information value ${nutrition.informationValue}/100`,
      `Manipulation risk ${nutrition.manipulationRisk}/100`,
      `Clickbait ${nutrition.clickbaitScore}/100`
    ]
  }
}

function hasSemanticDramaFrame(text: string): boolean {
  return /\b(internet reacts|fans are furious|people are losing it|everyone is mad|controversy explained)\b/i.test(text)
}

function isDramaCategory(category: CategoryId): boolean {
  return [
    "celebrity-drama",
    "influencer-drama",
    "streamer-drama",
    "fan-wars",
    "gaming-drama",
    "political-outrage",
    "relationship-drama",
    "drama-commentary"
  ].includes(category)
}

function buildExplanation(
  intensity: number,
  techniques: TechniqueScores,
  tones: ToneScores,
  triggers: TriggerHit[]
): string {
  const topTechniques = Object.entries(techniques)
    .filter(([, score]) => score > 0)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 3)
    .map(([key]) => readableKey(key))

  const topTone = Object.entries(tones)
    .filter(([key]) => key !== "neutral" && key !== "informational")
    .sort(([, left], [, right]) => right - left)[0]

  if (topTechniques.length === 0 && intensity <= 30) {
    return "This content appears mostly informational, with limited emotional or persuasion cues."
  }

  const triggerText = triggers
    .slice(0, 3)
    .map((trigger) => `"${trigger.phrase}"`)
    .join(", ")

  const techniqueText = topTechniques.length > 0 ? topTechniques.join(", ") : "general emotional wording"
  const toneText = topTone ? ` and a ${readableKey(topTone[0])} tone` : ""

  return `This content received its score because it uses ${techniqueText}${toneText}. Trigger examples: ${triggerText}.`
}

function readableKey(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/-/g, " ").toLowerCase()
}

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((word) => word.trim())
    .filter(Boolean)
}

const DENSITY_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "you",
  "your",
  "are",
  "that",
  "this",
  "with",
  "from",
  "have",
  "has",
  "was",
  "were",
  "but",
  "not",
  "what",
  "why",
  "how",
  "who",
  "when",
  "where",
  "can",
  "will",
  "just",
  "about",
  "into",
  "over",
  "after",
  "before",
  "they",
  "them",
  "their",
  "our",
  "out"
])

const CUSTOM_CATEGORY_STOPWORDS = new Set([
  "hide",
  "anything",
  "related",
  "content",
  "unrelated",
  "show",
  "only",
  "about",
  "topic",
  "topics"
])
