export type PlatformId = "youtube" | "reddit" | "x" | "linkedin" | "news" | "facebook" | "instagram"

export type ContentSurface =
  | "youtube-home"
  | "youtube-search"
  | "youtube-recommended"
  | "youtube-comments"
  | "youtube-watch"
  | "youtube-shorts"
  | "unknown"

export type PersuasionTechniqueKey =
  | "fearAppeal"
  | "usVsThem"
  | "certaintyLanguage"
  | "engagementBait"
  | "mockery"
  | "personalAttack"
  | "exaggeration"
  | "urgency"
  | "fomo"
  | "guiltPersuasion"
  | "victimhoodFraming"
  | "conspiracyFraming"
  | "adHominem"
  | "strawman"
  | "falseDilemma"
  | "bandwagon"
  | "appealToAuthority"
  | "appealToEmotion"
  | "slipperySlope"
  | "confirmationBias"

export type EmotionalToneKey =
  | "anger"
  | "fear"
  | "anxiety"
  | "contempt"
  | "excitement"
  | "neutral"
  | "informational"

export type CategoryId =
  | "celebrity-drama"
  | "political-outrage"
  | "gaming-drama"
  | "crypto-hype"
  | "gambling-content"
  | "productivity-guru"
  | "relationship-gossip"
  | "education"
  | "programming"
  | "news"
  | "other"
  | string

export type SensitivityLevel = "relaxed" | "balanced" | "strict"

export type FeedGuardMode = "blur" | "softLock" | "hardLock"

export type ThemePreference = "system" | "light" | "dark"

export type CloudProviderId = "none" | "openai" | "gemini" | "ollama" | "anthropic"

export type MentalStateMode = "off" | "study" | "work" | "sleep" | "gym"

export interface ContentItem {
  id: string
  platform: PlatformId
  surface: ContentSurface
  title: string
  body?: string
  author?: string
  url?: string
  observedAt: number
}

export interface CategoryDefinition {
  id: CategoryId
  label: string
  description: string
  defaultBlocked?: boolean
}

export interface TriggerHit {
  type: "technique" | "tone" | "category" | "custom" | "customCategory" | "density"
  key: string
  phrase: string
  score: number
  explanation: string
}

export type TechniqueScores = Record<PersuasionTechniqueKey, number>

export type ToneScores = Record<EmotionalToneKey, number>

export interface CategoryScore {
  id: CategoryId
  label: string
  score: number
  reasons: string[]
}

export interface RewriteResult {
  original: string
  neutral: string
  changes: string[]
}

export interface ContentDensityScore {
  signalToNoise: number
  lowInformation: number
  repetitiveFiller: number
  uniqueWordRatio: number
  label: string
}

export interface DigitalNutritionLabel {
  informationValue: number
  emotionalIntensity: number
  manipulationRisk: number
  noveltyScore: number
  clickbaitScore: number
}

export interface ContentSummary {
  short: string
  mainSignals: string[]
}

export interface AnalysisResult {
  contentId: string
  providerId: string
  analyzedAt: number
  emotionalIntensity: number
  intensityLabel: string
  techniques: TechniqueScores
  tones: ToneScores
  categories: CategoryScore[]
  triggers: TriggerHit[]
  contentDensity: ContentDensityScore
  nutritionLabel: DigitalNutritionLabel
  summary: ContentSummary
  explanation: string
  neutralRewrite?: RewriteResult
}

export interface CustomTrigger {
  id: string
  label: string
  pattern: string
  enabled: boolean
  score: number
}

export interface CustomAiCategory {
  id: string
  label: string
  prompt: string
  enabled: boolean
  action: "hide" | "approve" | "track"
  score: number
}

export interface EmotionalFilter {
  tone: EmotionalToneKey
  threshold: number
  enabled: boolean
}

export interface ScheduleRule {
  id: string
  label: string
  enabled: boolean
  startTime: string
  endTime: string
  days: number[]
  categories: CategoryId[]
  tones: EmotionalToneKey[]
}

export interface FocusSession {
  id: string
  name: string
  active: boolean
  endsAt?: number
  blockedCategories: CategoryId[]
  blockedTones: EmotionalToneKey[]
}

export interface GoalRule {
  id: string
  label: string
  enabled: boolean
  approvedCategories: CategoryId[]
  blockedCategories: CategoryId[]
  blockedTones: EmotionalToneKey[]
}

export interface AttentionBudget {
  id: string
  label: string
  categories: CategoryId[]
  dailyLimitMinutes: number
  enabled: boolean
}

export interface FeedGuardSettings {
  settingsSchemaVersion: number
  enabled: boolean
  badgeEnabled: boolean
  detailPanelEnabled: boolean
  mode: FeedGuardMode
  impulseDelaySeconds: 10 | 30 | 60
  whitelistMode: boolean
  approvedCategories: CategoryId[]
  blockedCategories: CategoryId[]
  sensitivity: SensitivityLevel
  emotionalFilters: EmotionalFilter[]
  customTriggers: CustomTrigger[]
  customAiCategories: CustomAiCategory[]
  schedules: ScheduleRule[]
  focusSessions: FocusSession[]
  goalRules: GoalRule[]
  attentionBudgets: AttentionBudget[]
  attentionFirewallEnabled: boolean
  mentalStateMode: MentalStateMode
  enabledPlatforms: PlatformId[]
  cloudProvider: CloudProviderId
  allowCloudAnalysis: boolean
  transparencyMode: boolean
  analyticsEnabled: boolean
  replyCheckerEnabled: boolean
  theme: ThemePreference
}

export interface FeedGuardDecision {
  action: "allow" | FeedGuardMode
  reasons: string[]
  categories: CategoryScore[]
  toneHits: Array<{ tone: EmotionalToneKey; score: number; threshold: number }>
  revealDelaySeconds?: number
}

export interface AnalyticsEvent {
  id: string
  contentId: string
  platform: PlatformId
  surface: ContentSurface
  url?: string
  sourceName?: string
  title: string
  timestamp: number
  emotionalIntensity: number
  intensityLabel: string
  techniques: Partial<TechniqueScores>
  tones: Partial<ToneScores>
  categories: CategoryScore[]
  contentDensity: ContentDensityScore
  nutritionLabel: DigitalNutritionLabel
  summary: ContentSummary
  decisionAction?: FeedGuardDecision["action"]
  blocked?: boolean
  timeVisibleMs?: number
}

export interface TrendRow {
  day: string
  averageIntensity: number
  count: number
}

export interface AnalyticsSummary {
  averageIntensity: number
  highIntensityCount: number
  totalItems: number
  mostCommonTechniques: Array<{ key: PersuasionTechniqueKey; count: number; average: number }>
  categoryBreakdown: Array<{ id: CategoryId; label: string; count: number; percentage: number }>
  toneBreakdown: Array<{ key: EmotionalToneKey; average: number }>
  estimatedTimeSavedMinutes: number
  postsBlocked: number
  usefulContentPercentage: number
  noisePercentage: number
  manipulativeContentPercentage: number
  feedPurityScore: number
  weeklyTrend: TrendRow[]
  monthlyTrend: TrendRow[]
  doomscroll: {
    detected: boolean
    highIntensityLastHour: number
    message: string
  }
  algorithmLoops: Array<{ label: string; count: number; percentage: number }>
  attentionBudgetUsage: Array<{
    id: string
    label: string
    dailyLimitMinutes: number
    estimatedMinutes: number
    remainingMinutes: number
    exceeded: boolean
  }>
  attentionRoi: {
    estimatedMinutes: number
    informationGainedEstimate: number
    roiScore: number
  }
  weeklyReport: string
  monthlyReport: string
  personalTriggers: Array<{ label: string; count: number; averageIntensity: number }>
  habitInsights: string[]
  selfControlInsights: string[]
  echoChamber: {
    topicDiversity: number
    sourceDiversity: number
    politicalDiversity: number
    summary: string
  }
}
