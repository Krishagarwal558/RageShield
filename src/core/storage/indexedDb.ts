import { formatDay, startOfDay } from "~core/utils/time"
import type {
  AnalyticsEvent,
  AnalyticsSummary,
  CategoryId,
  EmotionalToneKey,
  FeedGuardSettings,
  PersuasionTechniqueKey
} from "~core/types"

const DB_NAME = "rageshield-feedguard"
const DB_VERSION = 1
const EVENTS_STORE = "analytics-events"

export async function recordAnalysisEvent(event: AnalyticsEvent): Promise<void> {
  const db = await openDatabase()
  await withStore(db, "readwrite", (store) => store.put(event))
}

export async function getEventsSince(since: number): Promise<AnalyticsEvent[]> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EVENTS_STORE, "readonly")
    const store = transaction.objectStore(EVENTS_STORE)
    const index = store.index("timestamp")
    const request = index.getAll(IDBKeyRange.lowerBound(since))

    request.onsuccess = () => resolve(request.result as AnalyticsEvent[])
    request.onerror = () => reject(request.error)
  })
}

export async function getAnalyticsSummary(days = 7, settings?: FeedGuardSettings): Promise<AnalyticsSummary> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const events = await getEventsSince(since)

  if (events.length === 0) {
    return buildEmptySummary(days, settings)
  }

  const averageIntensity = Math.round(
    events.reduce((sum, event) => sum + event.emotionalIntensity, 0) / events.length
  )
  const highIntensityCount = events.filter((event) => event.emotionalIntensity >= 70).length
  const mostCommonTechniques = summarizeTechniques(events)
  const categoryBreakdown = summarizeCategories(events)
  const toneBreakdown = summarizeTones(events)
  const weeklyTrend = summarizeTrend(events, days)
  const monthlyEvents = await getEventsSince(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const monthlyTrend = summarizeTrend(monthlyEvents, 30)
  const postsBlocked = events.filter(isBlockedEvent).length
  const purity = summarizePurity(events)
  const doomscroll = summarizeDoomscroll(events)
  const attentionBudgetUsage = summarizeAttentionBudgets(events, settings)
  const attentionRoi = summarizeAttentionRoi(events)
  const algorithmLoops = summarizeAlgorithmLoops(categoryBreakdown)
  const personalTriggers = summarizePersonalTriggers(events)
  const habitInsights = summarizeHabits(events)
  const selfControlInsights = summarizeSelfControl(events, categoryBreakdown, doomscroll)
  const echoChamber = summarizeEchoChamber(events)

  return {
    averageIntensity,
    highIntensityCount,
    totalItems: events.length,
    mostCommonTechniques,
    categoryBreakdown,
    toneBreakdown,
    estimatedTimeSavedMinutes: Math.round((postsBlocked + highIntensityCount * 0.35) * 1.8),
    postsBlocked,
    ...purity,
    weeklyTrend,
    monthlyTrend,
    doomscroll,
    algorithmLoops,
    attentionBudgetUsage,
    attentionRoi,
    weeklyReport: buildReport("week", events, averageIntensity, purity.feedPurityScore, postsBlocked),
    monthlyReport: buildReport("month", monthlyEvents, averageIntensityFor(monthlyEvents), summarizePurity(monthlyEvents).feedPurityScore, monthlyEvents.filter(isBlockedEvent).length),
    personalTriggers,
    habitInsights,
    selfControlInsights,
    echoChamber
  }
}

export async function clearAnalytics(): Promise<void> {
  const db = await openDatabase()
  await withStore(db, "readwrite", (store) => store.clear())
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const store = db.createObjectStore(EVENTS_STORE, { keyPath: "id" })
        store.createIndex("timestamp", "timestamp", { unique: false })
        store.createIndex("contentId", "contentId", { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function withStore(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(EVENTS_STORE, mode)
    const store = transaction.objectStore(EVENTS_STORE)
    operation(store)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

function summarizeTechniques(
  events: AnalyticsEvent[]
): Array<{ key: PersuasionTechniqueKey; count: number; average: number }> {
  const totals = new Map<PersuasionTechniqueKey, { count: number; sum: number }>()

  for (const event of events) {
    for (const [key, score] of Object.entries(event.techniques) as Array<[PersuasionTechniqueKey, number]>) {
      if (score <= 0) {
        continue
      }

      const current = totals.get(key) ?? { count: 0, sum: 0 }
      current.count += 1
      current.sum += score
      totals.set(key, current)
    }
  }

  return Array.from(totals.entries())
    .map(([key, value]) => ({ key, count: value.count, average: Math.round(value.sum / value.count) }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
}

function summarizeCategories(
  events: AnalyticsEvent[]
): Array<{ id: CategoryId; label: string; count: number; percentage: number }> {
  const totals = new Map<CategoryId, { label: string; count: number }>()

  for (const event of events) {
    const topCategory = event.categories[0]

    if (!topCategory) {
      continue
    }

    const current = totals.get(topCategory.id) ?? { label: topCategory.label, count: 0 }
    current.count += 1
    totals.set(topCategory.id, current)
  }

  return Array.from(totals.entries())
    .map(([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
      percentage: Math.round((value.count / events.length) * 100)
    }))
    .sort((left, right) => right.count - left.count)
}

function summarizeTones(events: AnalyticsEvent[]): Array<{ key: EmotionalToneKey; average: number }> {
  const keys: EmotionalToneKey[] = ["anger", "fear", "anxiety", "contempt", "excitement", "neutral", "informational"]

  return keys
    .map((key) => ({
      key,
      average: Math.round(events.reduce((sum, event) => sum + (event.tones[key] ?? 0), 0) / events.length)
    }))
    .sort((left, right) => right.average - left.average)
}

function summarizeTrend(events: AnalyticsEvent[], days: number): AnalyticsSummary["weeklyTrend"] {
  const buckets = new Map<number, AnalyticsEvent[]>()
  const today = startOfDay(Date.now())

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    buckets.set(today - offset * 24 * 60 * 60 * 1000, [])
  }

  for (const event of events) {
    const day = startOfDay(event.timestamp)
    buckets.get(day)?.push(event)
  }

  return Array.from(buckets.entries()).map(([day, dayEvents]) => ({
    day: formatDay(day),
    averageIntensity:
      dayEvents.length === 0
        ? 0
        : Math.round(dayEvents.reduce((sum, event) => sum + event.emotionalIntensity, 0) / dayEvents.length),
    count: dayEvents.length
  }))
}

function buildEmptyTrend(days: number): AnalyticsSummary["weeklyTrend"] {
  const today = startOfDay(Date.now())

  return Array.from({ length: days }).map((_, index) => {
    const day = today - (days - 1 - index) * 24 * 60 * 60 * 1000
    return { day: formatDay(day), averageIntensity: 0, count: 0 }
  })
}

function buildEmptySummary(days: number, settings?: FeedGuardSettings): AnalyticsSummary {
  return {
    averageIntensity: 0,
    highIntensityCount: 0,
    totalItems: 0,
    mostCommonTechniques: [],
    categoryBreakdown: [],
    toneBreakdown: [],
    estimatedTimeSavedMinutes: 0,
    postsBlocked: 0,
    usefulContentPercentage: 0,
    noisePercentage: 0,
    manipulativeContentPercentage: 0,
    feedPurityScore: 100,
    weeklyTrend: buildEmptyTrend(days),
    monthlyTrend: buildEmptyTrend(30),
    doomscroll: {
      detected: false,
      highIntensityLastHour: 0,
      message: "No local exposure data yet."
    },
    algorithmLoops: [],
    attentionBudgetUsage: summarizeAttentionBudgets([], settings),
    attentionRoi: {
      estimatedMinutes: 0,
      informationGainedEstimate: 0,
      roiScore: 0
    },
    weeklyReport: "No local events recorded this week yet.",
    monthlyReport: "No local events recorded this month yet.",
    personalTriggers: [],
    habitInsights: [],
    selfControlInsights: [],
    echoChamber: {
      topicDiversity: 0,
      sourceDiversity: 0,
      politicalDiversity: 0,
      summary: "No diversity data yet."
    }
  }
}

function summarizePurity(events: AnalyticsEvent[]): Pick<
  AnalyticsSummary,
  "usefulContentPercentage" | "noisePercentage" | "manipulativeContentPercentage" | "feedPurityScore"
> {
  if (events.length === 0) {
    return {
      usefulContentPercentage: 0,
      noisePercentage: 0,
      manipulativeContentPercentage: 0,
      feedPurityScore: 100
    }
  }

  const useful = events.filter((event) => nutritionValue(event, "informationValue") >= 58 && event.emotionalIntensity <= 62)
  const noise = events.filter(
    (event) => (event.contentDensity?.lowInformation ?? 0) >= 62 || nutritionValue(event, "informationValue") <= 32
  )
  const manipulative = events.filter((event) => nutritionValue(event, "manipulationRisk") >= 62)
  const usefulContentPercentage = percentage(useful.length, events.length)
  const noisePercentage = percentage(noise.length, events.length)
  const manipulativeContentPercentage = percentage(manipulative.length, events.length)

  return {
    usefulContentPercentage,
    noisePercentage,
    manipulativeContentPercentage,
    feedPurityScore: Math.max(0, Math.min(100, usefulContentPercentage + Math.round((100 - noisePercentage - manipulativeContentPercentage) * 0.4)))
  }
}

function summarizeDoomscroll(events: AnalyticsEvent[]): AnalyticsSummary["doomscroll"] {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const highIntensityLastHour = events.filter(
    (event) => event.timestamp >= oneHourAgo && event.emotionalIntensity >= 70
  ).length
  const detected = highIntensityLastHour >= 12

  return {
    detected,
    highIntensityLastHour,
    message: detected
      ? `${highIntensityLastHour} high-intensity items appeared in the last hour.`
      : "No prolonged high-intensity streak detected."
  }
}

function summarizeAlgorithmLoops(
  categoryBreakdown: AnalyticsSummary["categoryBreakdown"]
): AnalyticsSummary["algorithmLoops"] {
  return categoryBreakdown
    .filter((category) => category.count >= 3 && category.percentage >= 24)
    .map((category) => ({
      label: category.label,
      count: category.count,
      percentage: category.percentage
    }))
    .slice(0, 5)
}

function summarizeAttentionBudgets(
  events: AnalyticsEvent[],
  settings?: FeedGuardSettings
): AnalyticsSummary["attentionBudgetUsage"] {
  return (settings?.attentionBudgets ?? [])
    .filter((budget) => budget.enabled)
    .map((budget) => {
      const matchedEvents = events.filter((event) =>
        event.categories.some((category) => budget.categories.includes(category.id))
      )
      const estimatedMinutes = Math.round(matchedEvents.length * 1.8)
      const remainingMinutes = budget.dailyLimitMinutes - estimatedMinutes

      return {
        id: budget.id,
        label: budget.label,
        dailyLimitMinutes: budget.dailyLimitMinutes,
        estimatedMinutes,
        remainingMinutes,
        exceeded: remainingMinutes < 0
      }
    })
}

function summarizeAttentionRoi(events: AnalyticsEvent[]): AnalyticsSummary["attentionRoi"] {
  if (events.length === 0) {
    return {
      estimatedMinutes: 0,
      informationGainedEstimate: 0,
      roiScore: 0
    }
  }

  const estimatedMinutes = Math.round(events.length * 1.8)
  const averageInformation = Math.round(
    events.reduce((sum, event) => sum + nutritionValue(event, "informationValue"), 0) / events.length
  )
  const averageNoise = Math.round(
    events.reduce((sum, event) => sum + (event.contentDensity?.lowInformation ?? 0), 0) / events.length
  )

  return {
    estimatedMinutes,
    informationGainedEstimate: Math.round((averageInformation / 100) * estimatedMinutes),
    roiScore: Math.max(0, Math.min(100, averageInformation - Math.round(averageNoise * 0.25)))
  }
}

function summarizePersonalTriggers(events: AnalyticsEvent[]): AnalyticsSummary["personalTriggers"] {
  const highIntensityEvents = events.filter((event) => event.emotionalIntensity >= 65)
  const totals = new Map<string, { count: number; sum: number }>()

  for (const event of highIntensityEvents) {
    const label = event.categories[0]?.label ?? "Uncategorized"
    const current = totals.get(label) ?? { count: 0, sum: 0 }
    current.count += 1
    current.sum += event.emotionalIntensity
    totals.set(label, current)
  }

  return Array.from(totals.entries())
    .map(([label, value]) => ({
      label,
      count: value.count,
      averageIntensity: Math.round(value.sum / value.count)
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5)
}

function summarizeHabits(events: AnalyticsEvent[]): string[] {
  if (events.length === 0) {
    return []
  }

  const hourCounts = new Map<number, number>()

  for (const event of events) {
    const hour = new Date(event.timestamp).getHours()
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)
  }

  const peakHour = Array.from(hourCounts.entries()).sort(([, left], [, right]) => right - left)[0]
  const highIntensityShare = percentage(events.filter((event) => event.emotionalIntensity >= 70).length, events.length)
  const insights = [`Most browsing signals were recorded around ${formatHour(peakHour?.[0] ?? 0)}.`]

  if (highIntensityShare >= 30) {
    insights.push(`${highIntensityShare}% of analyzed items were high intensity.`)
  }

  return insights
}

function summarizeSelfControl(
  events: AnalyticsEvent[],
  categoryBreakdown: AnalyticsSummary["categoryBreakdown"],
  doomscroll: AnalyticsSummary["doomscroll"]
): string[] {
  const insights: string[] = []
  const topDistraction = categoryBreakdown.find((category) =>
    ["celebrity-drama", "gaming-drama", "memes", "shorts", "reaction-content", "political-outrage"].includes(category.id)
  )

  if (topDistraction) {
    insights.push(`${topDistraction.label} is the most common distraction source.`)
  }

  if (doomscroll.detected) {
    insights.push("Doomscroll risk was detected in the last hour.")
  }

  const blocked = events.filter(isBlockedEvent).length

  if (blocked > 0) {
    insights.push(`${blocked} items were intercepted by FeedGuard rules.`)
  }

  return insights
}

function summarizeEchoChamber(events: AnalyticsEvent[]): AnalyticsSummary["echoChamber"] {
  if (events.length === 0) {
    return {
      topicDiversity: 0,
      sourceDiversity: 0,
      politicalDiversity: 0,
      summary: "No diversity data yet."
    }
  }

  const topicIds = new Set(events.map((event) => event.categories[0]?.id).filter(Boolean))
  const sources = new Set(events.map((event) => event.sourceName).filter(Boolean))
  const politicalCategories = new Set(
    events
      .flatMap((event) => event.categories)
      .filter((category) => ["political-outrage", "political-news", "political-arguments", "culture-war"].includes(category.id))
      .map((category) => category.id)
  )
  const topicDiversity = Math.min(100, topicIds.size * 12)
  const sourceDiversity = Math.min(100, sources.size * 10)
  const politicalDiversity = Math.min(100, politicalCategories.size * 25)
  const summary =
    topicDiversity >= 60 && sourceDiversity >= 50
      ? "Your recent feed looks relatively varied."
      : "Your recent feed is clustering around a small set of topics or sources."

  return {
    topicDiversity,
    sourceDiversity,
    politicalDiversity,
    summary
  }
}

function buildReport(
  period: "week" | "month",
  events: AnalyticsEvent[],
  averageIntensity: number,
  feedPurityScore: number,
  postsBlocked: number
): string {
  if (events.length === 0) {
    return `No local events recorded this ${period} yet.`
  }

  return `${events.length} items analyzed this ${period}. Average rage score ${averageIntensity}/100, feed purity ${feedPurityScore}/100, ${postsBlocked} items intercepted.`
}

function averageIntensityFor(events: AnalyticsEvent[]): number {
  if (events.length === 0) {
    return 0
  }

  return Math.round(events.reduce((sum, event) => sum + event.emotionalIntensity, 0) / events.length)
}

function nutritionValue(
  event: AnalyticsEvent,
  key: "informationValue" | "manipulationRisk" | "clickbaitScore" | "noveltyScore"
): number {
  return event.nutritionLabel?.[key] ?? 0
}

function percentage(count: number, total: number): number {
  if (total === 0) {
    return 0
  }

  return Math.round((count / total) * 100)
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12

  return `${displayHour} ${suffix}`
}

function isBlockedEvent(event: AnalyticsEvent): boolean {
  return Boolean(event.blocked || (event.decisionAction && event.decisionAction !== "allow"))
}
