import { clearAnalytics, getAnalyticsSummary, getEventsSince, recordAnalysisEvent } from "~core/storage/indexedDb"
import { getSettings } from "~core/storage/chromeStorage"
import type { AnalyticsEvent } from "~core/types"
import notificationIconUrl from "url:../assets/icon.png"

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "RSFG_RECORD_EVENT") {
    void handleRecordEvent(message.event as AnalyticsEvent)
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => sendResponse({ ok: false, error: errorMessage(error) }))
    return true
  }

  if (message?.type === "RSFG_GET_ANALYTICS_SUMMARY") {
    void getSettings()
      .then((settings) => getAnalyticsSummary(message.days ?? 7, settings))
      .then((summary) => sendResponse({ ok: true, summary }))
      .catch((error: unknown) => sendResponse({ ok: false, error: errorMessage(error) }))
    return true
  }

  if (message?.type === "RSFG_EXPORT_ANALYTICS") {
    const days = message.days ?? 30
    void getEventsSince(Date.now() - days * 24 * 60 * 60 * 1000)
      .then((events) => sendResponse({ ok: true, events }))
      .catch((error: unknown) => sendResponse({ ok: false, error: errorMessage(error) }))
    return true
  }

  if (message?.type === "RSFG_CLEAR_ANALYTICS") {
    void clearAnalytics()
      .then(() => sendResponse({ ok: true }))
      .catch((error: unknown) => sendResponse({ ok: false, error: errorMessage(error) }))
    return true
  }

  return false
})

async function handleRecordEvent(event: AnalyticsEvent): Promise<void> {
  await recordAnalysisEvent(event)

  if (event.emotionalIntensity >= 70) {
    await maybeNotifyDoomscroll()
  }
}

async function maybeNotifyDoomscroll(): Promise<void> {
  if (!chrome.notifications) {
    return
  }

  const oneHourAgo = Date.now() - 60 * 60 * 1000
  const events = await getEventsSince(oneHourAgo)
  const highIntensity = events.filter((event) => event.emotionalIntensity >= 70)

  if (highIntensity.length < 24) {
    return
  }

  chrome.notifications.create("rsfg-doomscroll-alert", {
    type: "basic",
    iconUrl: notificationIconUrl,
    title: "RageShield + FeedGuard",
    message: "You've viewed 24 high-intensity items in the last hour."
  })
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error"
}
