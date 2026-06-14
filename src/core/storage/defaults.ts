import type { FeedGuardSettings } from "~core/types"

export const CURRENT_SETTINGS_SCHEMA_VERSION = 4
const UNBLOCKED_BY_DEFAULT_CATEGORIES = ["graphic-injury-gore"]

export const DEFAULT_SETTINGS: FeedGuardSettings = {
  settingsSchemaVersion: CURRENT_SETTINGS_SCHEMA_VERSION,
  enabled: true,
  badgeEnabled: true,
  detailPanelEnabled: true,
  mode: "blur",
  impulseDelaySeconds: 30,
  whitelistMode: false,
  approvedCategories: ["education", "programming", "news"],
  blockedCategories: [
    "celebrity-drama",
    "influencer-drama",
    "fan-wars",
    "gossip",
    "political-outrage",
    "culture-war",
    "gaming-drama",
    "streamer-drama",
    "crypto-hype",
    "gambling-content",
    "sports-betting",
    "doomscroll-news"
  ],
  sensitivity: "balanced",
  emotionalFilters: [
    { tone: "anger", threshold: 76, enabled: false },
    { tone: "fear", threshold: 76, enabled: false },
    { tone: "anxiety", threshold: 72, enabled: false },
    { tone: "contempt", threshold: 72, enabled: false }
  ],
  customTriggers: [
    {
      id: "wake-up-sheep",
      label: "Wake up sheep",
      pattern: "wake up sheep",
      enabled: true,
      score: 72
    },
    {
      id: "they-dont-want-you-to-know",
      label: "They do not want you to know",
      pattern: "they don't want you to know",
      enabled: true,
      score: 74
    }
  ],
  customAiCategories: [
    {
      id: "custom-valorant",
      label: "Valorant",
      prompt: "Hide anything related to Valorant.",
      enabled: false,
      action: "hide",
      score: 72
    },
    {
      id: "custom-ipl",
      label: "IPL",
      prompt: "Hide anything related to IPL cricket.",
      enabled: false,
      action: "hide",
      score: 72
    },
    {
      id: "custom-celebrity-gossip",
      label: "Celebrity Gossip",
      prompt: "Hide celebrity gossip.",
      enabled: false,
      action: "hide",
      score: 78
    },
    {
      id: "custom-programming-only",
      label: "Programming Only",
      prompt: "Hide content unrelated to programming.",
      enabled: false,
      action: "hide",
      score: 70
    }
  ],
  schedules: [
    {
      id: "late-outrage",
      label: "Quiet Nights",
      enabled: false,
      startTime: "22:00",
      endTime: "06:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      categories: ["political-outrage", "celebrity-drama", "gaming-drama"],
      tones: ["anger", "contempt"]
    },
    {
      id: "study-hours",
      label: "Study Hours",
      enabled: false,
      startTime: "18:00",
      endTime: "21:00",
      days: [1, 2, 3, 4, 5],
      categories: ["memes", "shorts", "reaction-content", "celebrity-drama", "gaming-drama"],
      tones: ["anger", "anxiety", "contempt"]
    },
    {
      id: "morning-focus",
      label: "Morning Focus",
      enabled: false,
      startTime: "06:00",
      endTime: "10:00",
      days: [1, 2, 3, 4, 5],
      categories: ["doomscroll-news", "political-outrage", "financial-hype", "relationship-gossip"],
      tones: ["fear", "anxiety", "anger"]
    }
  ],
  focusSessions: [
    {
      id: "study",
      name: "Study",
      active: false,
      blockedCategories: ["celebrity-drama", "gaming-drama", "relationship-gossip", "crypto-hype"],
      blockedTones: ["anger", "contempt"]
    },
    {
      id: "coding",
      name: "Coding",
      active: false,
      blockedCategories: ["celebrity-drama", "gaming-drama", "political-outrage"],
      blockedTones: ["anger", "fear", "contempt"]
    },
    {
      id: "work",
      name: "Work",
      active: false,
      blockedCategories: ["celebrity-drama", "relationship-gossip", "gambling-content"],
      blockedTones: ["anger", "contempt"]
    },
    {
      id: "sleep",
      name: "Sleep",
      active: false,
      blockedCategories: ["doomscroll-news", "political-outrage", "health-anxiety", "true-crime", "war-conflict"],
      blockedTones: ["anger", "fear", "anxiety", "contempt"]
    },
    {
      id: "gym",
      name: "Gym",
      active: false,
      blockedCategories: ["celebrity-drama", "political-outrage", "relationship-gossip"],
      blockedTones: ["anger", "contempt"]
    }
  ],
  goalRules: [
    {
      id: "learning",
      label: "Learning",
      enabled: false,
      approvedCategories: ["education", "programming", "science", "history", "documentary", "language-learning"],
      blockedCategories: ["memes", "shorts", "reaction-content", "celebrity-drama", "gaming-drama"],
      blockedTones: ["anger", "contempt"]
    },
    {
      id: "fitness",
      label: "Fitness",
      enabled: false,
      approvedCategories: ["fitness-body-image", "sports", "cooking-food"],
      blockedCategories: ["luxury-flex", "relationship-gossip", "celebrity-drama"],
      blockedTones: ["contempt", "anxiety"]
    },
    {
      id: "career",
      label: "Career",
      enabled: false,
      approvedCategories: ["career-jobs", "business-entrepreneurship", "programming", "education"],
      blockedCategories: ["fake-entrepreneurship", "hustle-culture", "sigma-content", "luxury-flex"],
      blockedTones: ["anxiety", "contempt"]
    },
    {
      id: "exam-prep",
      label: "Exam Preparation",
      enabled: false,
      approvedCategories: ["education", "science", "history", "language-learning"],
      blockedCategories: ["gaming-drama", "memes", "shorts", "reels", "fan-wars"],
      blockedTones: ["anger", "fear", "anxiety", "contempt"]
    }
  ],
  attentionBudgets: [
    {
      id: "gaming-budget",
      label: "Gaming",
      categories: ["gaming-drama", "esports-drama", "game-leaks", "game-spoilers", "console-wars"],
      dailyLimitMinutes: 25,
      enabled: true
    },
    {
      id: "politics-budget",
      label: "Politics",
      categories: ["political-outrage", "political-news", "political-arguments", "culture-war"],
      dailyLimitMinutes: 20,
      enabled: true
    },
    {
      id: "social-budget",
      label: "Social Media",
      categories: ["memes", "viral-trends", "reaction-content", "shorts", "reels"],
      dailyLimitMinutes: 30,
      enabled: true
    }
  ],
  attentionFirewallEnabled: false,
  mentalStateMode: "off",
  enabledPlatforms: ["youtube"],
  cloudProvider: "none",
  allowCloudAnalysis: false,
  transparencyMode: true,
  analyticsEnabled: true,
  replyCheckerEnabled: true,
  theme: "system"
}

export function mergeSettings(value?: Partial<FeedGuardSettings>): FeedGuardSettings {
  const incomingVersion = value?.settingsSchemaVersion ?? 1
  const incomingBlockedCategories = value?.blockedCategories ?? DEFAULT_SETTINGS.blockedCategories
  const blockedCategories =
    incomingVersion < CURRENT_SETTINGS_SCHEMA_VERSION
      ? incomingBlockedCategories.filter((category) => !UNBLOCKED_BY_DEFAULT_CATEGORIES.includes(category))
      : incomingBlockedCategories
  const focusSessions =
    incomingVersion < CURRENT_SETTINGS_SCHEMA_VERSION
      ? mergeById(DEFAULT_SETTINGS.focusSessions, value?.focusSessions, "id").map((session) => ({
          ...session,
          blockedCategories: session.blockedCategories.filter(
            (category) => !UNBLOCKED_BY_DEFAULT_CATEGORIES.includes(category)
          )
        }))
      : mergeById(DEFAULT_SETTINGS.focusSessions, value?.focusSessions, "id")

  return {
    ...DEFAULT_SETTINGS,
    ...value,
    settingsSchemaVersion: CURRENT_SETTINGS_SCHEMA_VERSION,
    blockedCategories,
    emotionalFilters: mergeById(DEFAULT_SETTINGS.emotionalFilters, value?.emotionalFilters, "tone"),
    customTriggers: mergeById(DEFAULT_SETTINGS.customTriggers, value?.customTriggers, "id"),
    customAiCategories: mergeById(DEFAULT_SETTINGS.customAiCategories, value?.customAiCategories, "id"),
    schedules: mergeById(DEFAULT_SETTINGS.schedules, value?.schedules, "id"),
    focusSessions,
    goalRules: mergeById(DEFAULT_SETTINGS.goalRules, value?.goalRules, "id"),
    attentionBudgets: mergeById(DEFAULT_SETTINGS.attentionBudgets, value?.attentionBudgets, "id"),
    enabledPlatforms: value?.enabledPlatforms ?? DEFAULT_SETTINGS.enabledPlatforms,
    cloudProvider: value?.allowCloudAnalysis ? value.cloudProvider ?? DEFAULT_SETTINGS.cloudProvider : "none"
  }
}

function mergeById<TItem, TKey extends keyof TItem>(
  defaults: TItem[],
  incoming: TItem[] | undefined,
  key: TKey
): TItem[] {
  if (!incoming) {
    return defaults
  }

  const incomingById = new Map(incoming.map((item) => [item[key], item]))
  const merged = defaults.map((item) => ({ ...item, ...incomingById.get(item[key]) }))
  const defaultIds = new Set(defaults.map((item) => item[key]))
  const extra = incoming.filter((item) => !defaultIds.has(item[key]))

  return [...merged, ...extra]
}
