import { isTimeInRange } from "~core/utils/time"
import type {
  AnalysisResult,
  CategoryId,
  ContentItem,
  EmotionalToneKey,
  FeedGuardDecision,
  FeedGuardSettings
} from "~core/types"

export function evaluateFeedGuard(
  item: ContentItem,
  analysis: AnalysisResult,
  settings: FeedGuardSettings,
  now = new Date()
): FeedGuardDecision {
  if (!settings.enabled) {
    return { action: "allow", reasons: [], categories: analysis.categories, toneHits: [] }
  }

  if (!settings.enabledPlatforms.includes(item.platform)) {
    return { action: "allow", reasons: [], categories: analysis.categories, toneHits: [] }
  }

  const reasons: string[] = []
  const matchedBlockedCategories = new Set<CategoryId>()
  const toneHits = collectToneHits(analysis, settings)

  for (const category of analysis.categories) {
    const categoryBlocked = settings.blockedCategories.includes(category.id)
    const whitelistBlocked =
      settings.whitelistMode && !settings.approvedCategories.includes(category.id) && category.id !== "other"

    if (categoryBlocked || whitelistBlocked) {
      matchedBlockedCategories.add(category.id)
      reasons.push(
        whitelistBlocked
          ? `${category.label} is outside the approved category list.`
          : `${category.label} is blocked.`
      )
    }
  }

  for (const customCategory of settings.customAiCategories) {
    if (!customCategory.enabled || customCategory.action !== "hide") {
      continue
    }

    const matchedCategory = analysis.categories.find((category) => category.id === customCategory.id)

    if (matchedCategory) {
      matchedBlockedCategories.add(matchedCategory.id)
      reasons.push(`${matchedCategory.label} matched your custom AI category.`)
    }
  }

  for (const session of settings.focusSessions) {
    if (!session.active || (session.endsAt && session.endsAt < now.getTime())) {
      continue
    }

    for (const category of analysis.categories) {
      if (session.blockedCategories.includes(category.id)) {
        matchedBlockedCategories.add(category.id)
        reasons.push(`${category.label} is hidden during ${session.name} focus mode.`)
      }
    }

    for (const tone of session.blockedTones) {
      addToneHit(toneHits, analysis, tone, 58)
      if (analysis.tones[tone] >= 58) {
        reasons.push(`${readableKey(tone)} tone is hidden during ${session.name} focus mode.`)
      }
    }
  }

  for (const rule of settings.schedules) {
    if (!rule.enabled || !rule.days.includes(now.getDay()) || !isTimeInRange(now, rule.startTime, rule.endTime)) {
      continue
    }

    for (const category of analysis.categories) {
      if (rule.categories.includes(category.id)) {
        matchedBlockedCategories.add(category.id)
        reasons.push(`${category.label} is hidden by the "${rule.label}" schedule.`)
      }
    }

    for (const tone of rule.tones) {
      addToneHit(toneHits, analysis, tone, 58)
      if (analysis.tones[tone] >= 58) {
        reasons.push(`${readableKey(tone)} tone is hidden by the "${rule.label}" schedule.`)
      }
    }
  }

  for (const goal of settings.goalRules) {
    if (!goal.enabled) {
      continue
    }

    for (const category of analysis.categories) {
      const goalBlocked = goal.blockedCategories.includes(category.id)
      const outsideGoal =
        goal.approvedCategories.length > 0 && !goal.approvedCategories.includes(category.id) && category.id !== "other"

      if (goalBlocked || outsideGoal) {
        matchedBlockedCategories.add(category.id)
        reasons.push(
          goalBlocked
            ? `${category.label} conflicts with your ${goal.label} goal.`
            : `${category.label} is outside your ${goal.label} goal topics.`
        )
      }
    }

    for (const tone of goal.blockedTones) {
      addToneHit(toneHits, analysis, tone, 58)
      if (analysis.tones[tone] >= 58) {
        reasons.push(`${readableKey(tone)} tone conflicts with your ${goal.label} goal.`)
      }
    }
  }

  const mentalStateRule = MENTAL_STATE_RULES[settings.mentalStateMode]

  if (mentalStateRule) {
    for (const category of analysis.categories) {
      if (mentalStateRule.categories.includes(category.id)) {
        matchedBlockedCategories.add(category.id)
        reasons.push(`${category.label} is hidden in ${mentalStateRule.label} mode.`)
      }
    }

    for (const tone of mentalStateRule.tones) {
      addToneHit(toneHits, analysis, tone, 58)
      if (analysis.tones[tone] >= 58) {
        reasons.push(`${readableKey(tone)} tone is hidden in ${mentalStateRule.label} mode.`)
      }
    }
  }

  for (const hit of toneHits) {
    reasons.push(`${readableKey(hit.tone)} tone is ${hit.score}/100, above your ${hit.threshold}/100 filter.`)
  }

  if (reasons.length === 0) {
    return { action: "allow", reasons, categories: analysis.categories, toneHits }
  }

  const action = settings.mode

  return {
    action,
    reasons: Array.from(new Set(reasons)),
    categories: analysis.categories.filter((category) => matchedBlockedCategories.has(category.id)),
    toneHits,
    revealDelaySeconds: action === "softLock" ? settings.impulseDelaySeconds : undefined
  }
}

function collectToneHits(
  analysis: AnalysisResult,
  settings: FeedGuardSettings
): Array<{ tone: EmotionalToneKey; score: number; threshold: number }> {
  return settings.emotionalFilters
    .filter((filter) => filter.enabled)
    .map((filter) => ({
      tone: filter.tone,
      score: analysis.tones[filter.tone],
      threshold: filter.threshold
    }))
    .filter((hit) => hit.score >= hit.threshold)
}

function addToneHit(
  toneHits: Array<{ tone: EmotionalToneKey; score: number; threshold: number }>,
  analysis: AnalysisResult,
  tone: EmotionalToneKey,
  threshold: number
): void {
  const score = analysis.tones[tone]

  if (score < threshold || toneHits.some((hit) => hit.tone === tone && hit.threshold === threshold)) {
    return
  }

  toneHits.push({ tone, score, threshold })
}

function readableKey(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/-/g, " ").toLowerCase()
}

const MENTAL_STATE_RULES: Partial<
  Record<
    FeedGuardSettings["mentalStateMode"],
    { label: string; categories: CategoryId[]; tones: EmotionalToneKey[] }
  >
> = {
  study: {
    label: "Study",
    categories: ["memes", "shorts", "reaction-content", "celebrity-drama", "gaming-drama", "political-outrage"],
    tones: ["anger", "anxiety", "contempt"]
  },
  work: {
    label: "Work",
    categories: ["celebrity-drama", "relationship-gossip", "fan-wars", "gambling-content", "sports-betting"],
    tones: ["anger", "contempt"]
  },
  sleep: {
    label: "Sleep",
    categories: ["doomscroll-news", "health-anxiety", "true-crime", "war-conflict", "political-outrage"],
    tones: ["anger", "fear", "anxiety", "contempt"]
  },
  gym: {
    label: "Gym",
    categories: ["political-outrage", "celebrity-drama", "relationship-drama", "doomscroll-news"],
    tones: ["anger", "contempt"]
  }
}
