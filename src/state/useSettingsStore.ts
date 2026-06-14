import { create } from "zustand"
import { getSettings, saveSettings } from "~core/storage/chromeStorage"
import { DEFAULT_SETTINGS } from "~core/storage/defaults"
import type { FeedGuardSettings } from "~core/types"

interface SettingsState {
  settings: FeedGuardSettings
  loaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<FeedGuardSettings>) => Promise<void>
  replace: (settings: FeedGuardSettings) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const settings = await getSettings()
    set({ settings, loaded: true })
  },
  update: async (patch) => {
    const next = { ...get().settings, ...patch }
    set({ settings: next })
    await saveSettings(next)
  },
  replace: async (settings) => {
    set({ settings })
    await saveSettings(settings)
  }
}))
