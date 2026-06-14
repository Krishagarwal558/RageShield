import { useEffect, useState } from "react"
import { Clock, EyeOff, Gauge, Moon, ShieldCheck } from "lucide-react"
import "./style.css"
import { CATEGORY_DEFINITIONS } from "~core/feedguard/categories"
import type { AnalyticsSummary, CategoryId, FeedGuardMode } from "~core/types"
import { useSettingsStore } from "~state/useSettingsStore"
import { CategorySearchList } from "~ui/CategorySearchList"
import { ChartBars } from "~ui/ChartBars"
import { Toggle } from "~ui/Toggle"

export default function Popup() {
  const { settings, loaded, load, update } = useSettingsStore()
  const [summary, setSummary] = useState<AnalyticsSummary>()

  useEffect(() => {
    void load()
    void requestSummary().then(setSummary)
  }, [load])

  return (
    <main className="w-[380px] bg-calm-50 p-4 text-ink-900 dark:bg-ink-950 dark:text-ink-100">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-lg font-extrabold">RageShield + FeedGuard</h1>
          <p className="m-0 mt-1 text-xs text-ink-500 dark:text-ink-300">Local analysis for calmer feeds.</p>
        </div>
        <div className="rounded-lg bg-white p-2 text-calm-700 shadow-sm dark:bg-ink-900 dark:text-calm-300">
          <ShieldCheck size={20} />
        </div>
      </header>

      <section className="mb-3 grid grid-cols-3 gap-2">
        <Metric icon={<Gauge size={16} />} label="Average" value={`${summary?.averageIntensity ?? 0}`} />
        <Metric icon={<EyeOff size={16} />} label="Blocked" value={`${summary?.postsBlocked ?? 0}`} />
        <Metric icon={<Clock size={16} />} label="Saved" value={`${summary?.estimatedTimeSavedMinutes ?? 0}m`} />
      </section>
      <section className="mb-3 grid grid-cols-2 gap-2">
        <Metric icon={<Gauge size={16} />} label="Purity" value={`${summary?.feedPurityScore ?? 100}`} />
        <Metric icon={<EyeOff size={16} />} label="Loops" value={`${summary?.algorithmLoops.length ?? 0}`} />
      </section>

      <section className="mb-3 grid gap-2">
        <Toggle label="Enable FeedGuard" checked={settings.enabled} onChange={(enabled) => void update({ enabled })} />
        <Toggle
          label="Show Feed Badges"
          checked={settings.badgeEnabled}
          onChange={(badgeEnabled) => void update({ badgeEnabled })}
        />
        <Toggle
          label="Reply Checker"
          checked={settings.replyCheckerEnabled}
          onChange={(replyCheckerEnabled) => void update({ replyCheckerEnabled })}
        />
      </section>

      <section className="mb-3 rounded-lg border border-ink-100 bg-white p-3 dark:border-ink-700 dark:bg-ink-900">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="m-0 text-sm font-bold">Blocked Categories</h2>
          <select
            className="rounded-md border border-ink-100 bg-calm-50 px-2 py-1 text-xs dark:border-ink-700 dark:bg-ink-950"
            value={settings.mode}
            onChange={(event) => void update({ mode: event.currentTarget.value as FeedGuardMode })}
          >
            <option value="blur">Blur</option>
            <option value="softLock">Soft Lock</option>
            <option value="hardLock">Hard Lock</option>
          </select>
        </div>
        <CategorySearchList
          categories={CATEGORY_DEFINITIONS}
          selected={settings.blockedCategories}
          maxHeightClassName="max-h-56"
          onToggle={(category) =>
            void update({ blockedCategories: toggleCategory(settings.blockedCategories, category) })
          }
        />
      </section>

      <section className="mb-3 rounded-lg border border-ink-100 bg-white p-3 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="m-0 mb-2 text-sm font-bold">Exposure Breakdown</h2>
        <ChartBars
          rows={(summary?.categoryBreakdown ?? []).slice(0, 5).map((row) => ({
            label: row.label,
            value: row.percentage,
            detail: `${row.percentage}%`
          }))}
        />
        {!summary?.categoryBreakdown.length && <p className="m-0 text-xs text-ink-500">No local analytics yet.</p>}
      </section>

      <button
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-ink-100 bg-white text-sm font-bold dark:border-ink-700 dark:bg-ink-900"
        type="button"
        onClick={() => chrome.runtime.openOptionsPage()}
        disabled={!loaded}
      >
        <Moon size={16} />
        Open Dashboard
      </button>
    </main>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white p-3 dark:border-ink-700 dark:bg-ink-900">
      <div className="mb-2 text-calm-700 dark:text-calm-300">{icon}</div>
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-xs text-ink-500 dark:text-ink-300">{label}</div>
    </div>
  )
}

function toggleCategory(categories: CategoryId[], category: CategoryId): CategoryId[] {
  return categories.includes(category)
    ? categories.filter((current) => current !== category)
    : [...categories, category]
}

async function requestSummary(): Promise<AnalyticsSummary | undefined> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return undefined
  }

  const response = await chrome.runtime.sendMessage({ type: "RSFG_GET_ANALYTICS_SUMMARY", days: 7 })
  return response?.summary as AnalyticsSummary | undefined
}
