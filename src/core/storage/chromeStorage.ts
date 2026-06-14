import { DEFAULT_SETTINGS, mergeSettings } from "~core/storage/defaults"
import type { FeedGuardSettings } from "~core/types"

const SETTINGS_KEY = "rageshield.feedguard.settings"

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local)
}

export async function getSettings(): Promise<FeedGuardSettings> {
  if (!hasChromeStorage()) {
    const localValue = globalThis.localStorage?.getItem(SETTINGS_KEY)
    return mergeSettings(localValue ? JSON.parse(localValue) : undefined)
  }

  const result = await chrome.storage.local.get(SETTINGS_KEY)
  return mergeSettings(result[SETTINGS_KEY] as Partial<FeedGuardSettings> | undefined)
}

export async function saveSettings(settings: FeedGuardSettings): Promise<void> {
  if (!hasChromeStorage()) {
    globalThis.localStorage?.setItem(SETTINGS_KEY, JSON.stringify(settings))
    return
  }

  await chrome.storage.local.set({ [SETTINGS_KEY]: settings })
}

export async function resetSettings(): Promise<FeedGuardSettings> {
  await saveSettings(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export function subscribeToSettings(callback: (settings: FeedGuardSettings) => void): () => void {
  if (!hasChromeStorage()) {
    return () => undefined
  }

  const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName !== "local" || !changes[SETTINGS_KEY]) {
      return
    }

    callback(mergeSettings(changes[SETTINGS_KEY].newValue as Partial<FeedGuardSettings>))
  }

  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
