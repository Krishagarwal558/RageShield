import { useEffect, useState } from "react"
import {
  BarChart3,
  Brain,
  Clock3,
  Database,
  Library,
  Lock,
  Moon,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2
} from "lucide-react"
import "./style.css"
import { PROVIDER_DESCRIPTORS } from "~core/analysis/providers"
import { CATEGORY_DEFINITIONS } from "~core/feedguard/categories"
import { resetSettings } from "~core/storage/chromeStorage"
import type {
  AnalyticsSummary,
  AttentionBudget,
  CategoryId,
  CloudProviderId,
  CustomAiCategory,
  EmotionalFilter,
  FeedGuardMode,
  FocusSession,
  GoalRule,
  MentalStateMode,
  ScheduleRule
} from "~core/types"
import { useSettingsStore } from "~state/useSettingsStore"
import { CategorySearchList } from "~ui/CategorySearchList"
import { ChartBars } from "~ui/ChartBars"
import { Toggle } from "~ui/Toggle"

const LIBRARY_ROWS = [
  ["Ad Hominem", "Attacking a person or group instead of responding to the claim."],
  ["Strawman", "Replacing a claim with an easier version to attack."],
  ["False Dilemma", "Presenting two choices as if no other options exist."],
  ["Fear Appeal", "Using threat framing to push a decision or reaction."],
  ["Bandwagon Effect", "Suggesting a belief is correct because many people hold it."],
  ["Appeal to Authority", "Leaning on status or expertise without enough evidence."]
]

export default function Options() {
  const { settings, load, update, replace } = useSettingsStore()
  const [summary, setSummary] = useState<AnalyticsSummary>()

  useEffect(() => {
    void load()
    void requestSummary().then(setSummary)
  }, [load])

  return (
    <main className="min-h-screen bg-calm-50 text-ink-900 dark:bg-ink-950 dark:text-ink-100">
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-extrabold">RageShield + FeedGuard</h1>
            <p className="m-0 mt-1 text-sm text-ink-500 dark:text-ink-300">
              Privacy-first attention controls and media-literacy analytics.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 text-sm font-bold dark:border-ink-700 dark:bg-ink-900"
              type="button"
              onClick={() => void resetSettings().then(replace)}
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-calm-700 px-3 text-sm font-bold text-white"
              type="button"
              onClick={() => void clearAnalytics().then(() => requestSummary().then(setSummary))}
            >
              <Trash2 size={16} />
              Clear Data
            </button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <Metric icon={<ShieldCheck size={18} />} label="Items analyzed" value={`${summary?.totalItems ?? 0}`} />
          <Metric icon={<BarChart3 size={18} />} label="Average intensity" value={`${summary?.averageIntensity ?? 0}`} />
          <Metric icon={<Brain size={18} />} label="Feed purity" value={`${summary?.feedPurityScore ?? 100}`} />
          <Metric icon={<Clock3 size={18} />} label="Time saved" value={`${summary?.estimatedTimeSavedMinutes ?? 0}m`} />
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="grid gap-5">
            <Panel icon={<SlidersHorizontal size={18} />} title="FeedGuard Controls">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="Enable FeedGuard" checked={settings.enabled} onChange={(enabled) => void update({ enabled })} />
                <Toggle
                  label="Detailed Panels"
                  checked={settings.detailPanelEnabled}
                  onChange={(detailPanelEnabled) => void update({ detailPanelEnabled })}
                />
                <Toggle
                  label="Whitelist Mode"
                  checked={settings.whitelistMode}
                  onChange={(whitelistMode) => void update({ whitelistMode })}
                />
                <Toggle
                  label="Local Analytics"
                  checked={settings.analyticsEnabled}
                  onChange={(analyticsEnabled) => void update({ analyticsEnabled })}
                />
                <Toggle
                  label="Reply Checker"
                  checked={settings.replyCheckerEnabled}
                  onChange={(replyCheckerEnabled) => void update({ replyCheckerEnabled })}
                />
                <Toggle
                  label="Transparency Mode"
                  checked={settings.transparencyMode}
                  onChange={(transparencyMode) => void update({ transparencyMode })}
                />
                <Toggle
                  label="Attention Firewall"
                  checked={settings.attentionFirewallEnabled}
                  onChange={(attentionFirewallEnabled) => void update({ attentionFirewallEnabled })}
                />
                <Toggle
                  label="Cloud AI Opt-In"
                  checked={settings.allowCloudAnalysis}
                  onChange={(allowCloudAnalysis) =>
                    void update({ allowCloudAnalysis, cloudProvider: allowCloudAnalysis ? settings.cloudProvider : "none" })
                  }
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Select
                  label="Sensitivity"
                  value={settings.sensitivity}
                  options={[
                    ["relaxed", "Relaxed"],
                    ["balanced", "Balanced"],
                    ["strict", "Strict"]
                  ]}
                  onChange={(sensitivity) => void update({ sensitivity: sensitivity as typeof settings.sensitivity })}
                />
                <Select
                  label="Mode"
                  value={settings.mode}
                  options={[
                    ["blur", "Blur"],
                    ["softLock", "Soft Lock"],
                    ["hardLock", "Hard Lock"]
                  ]}
                  onChange={(mode) => void update({ mode: mode as FeedGuardMode })}
                />
                <Select
                  label="Impulse Delay"
                  value={`${settings.impulseDelaySeconds}`}
                  options={[
                    ["10", "10 seconds"],
                    ["30", "30 seconds"],
                    ["60", "60 seconds"]
                  ]}
                  onChange={(impulseDelaySeconds) =>
                    void update({ impulseDelaySeconds: Number(impulseDelaySeconds) as 10 | 30 | 60 })
                  }
                />
                <Select
                  label="Theme"
                  value={settings.theme}
                  options={[
                    ["system", "System"],
                    ["light", "Light"],
                    ["dark", "Dark"]
                  ]}
                  onChange={(theme) => void update({ theme: theme as typeof settings.theme })}
                />
                <Select
                  label="Mental Mode"
                  value={settings.mentalStateMode}
                  options={[
                    ["off", "Off"],
                    ["study", "Study"],
                    ["work", "Work"],
                    ["sleep", "Sleep"],
                    ["gym", "Gym"]
                  ]}
                  onChange={(mentalStateMode) => void update({ mentalStateMode: mentalStateMode as MentalStateMode })}
                />
                <Select
                  label="Cloud Provider"
                  value={settings.cloudProvider}
                  options={[
                    ["none", "None"],
                    ["openai", "OpenAI"],
                    ["gemini", "Gemini"],
                    ["ollama", "Ollama"],
                    ["anthropic", "Anthropic"]
                  ]}
                  onChange={(cloudProvider) =>
                    void update({
                      cloudProvider: cloudProvider as CloudProviderId,
                      allowCloudAnalysis: cloudProvider !== "none"
                    })
                  }
                />
              </div>
            </Panel>

            <Panel icon={<Lock size={18} />} title="Category Blocking">
              <CategorySearchList
                categories={CATEGORY_DEFINITIONS}
                selected={settings.blockedCategories}
                showDescriptions
                maxHeightClassName="max-h-96"
                onToggle={(category) =>
                  void update({ blockedCategories: toggleCategory(settings.blockedCategories, category) })
                }
              />
            </Panel>

            <Panel icon={<Brain size={18} />} title="Emotional Filters">
              <div className="grid gap-2 sm:grid-cols-2">
                {settings.emotionalFilters.map((filter) => (
                  <EmotionalFilterCard
                    key={filter.tone}
                    filter={filter}
                    onChange={(next) =>
                      void update({
                        emotionalFilters: settings.emotionalFilters.map((current) =>
                          current.tone === next.tone ? next : current
                        )
                      })
                    }
                  />
                ))}
              </div>
            </Panel>

            <Panel icon={<Brain size={18} />} title="Custom AI Categories">
              <div className="grid gap-2">
                {settings.customAiCategories.map((category) => (
                  <CustomCategoryCard
                    key={category.id}
                    category={category}
                    onChange={(next) =>
                      void update({
                        customAiCategories: settings.customAiCategories.map((current) =>
                          current.id === next.id ? next : current
                        )
                      })
                    }
                  />
                ))}
              </div>
            </Panel>

            <Panel icon={<ShieldCheck size={18} />} title="Goal-Based Filtering">
              <div className="grid gap-2">
                {settings.goalRules.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onChange={(next) =>
                      void update({
                        goalRules: settings.goalRules.map((current) => (current.id === next.id ? next : current))
                      })
                    }
                  />
                ))}
              </div>
            </Panel>

            <Panel icon={<Clock3 size={18} />} title="Attention Budgets">
              <div className="grid gap-2">
                {settings.attentionBudgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    usage={summary?.attentionBudgetUsage.find((item) => item.id === budget.id)}
                    onChange={(next) =>
                      void update({
                        attentionBudgets: settings.attentionBudgets.map((current) =>
                          current.id === next.id ? next : current
                        )
                      })
                    }
                  />
                ))}
              </div>
            </Panel>

            <Panel icon={<Moon size={18} />} title="Focus Mode">
              <div className="grid gap-2 sm:grid-cols-3">
                {settings.focusSessions.map((session) => (
                  <FocusCard
                    key={session.id}
                    session={session}
                    onChange={(next) =>
                      void update({
                        focusSessions: settings.focusSessions.map((current) =>
                          current.id === next.id ? next : { ...current, active: false }
                        )
                      })
                    }
                  />
                ))}
              </div>
            </Panel>

            <Panel icon={<Clock3 size={18} />} title="Time-Based Rules">
              <div className="grid gap-3">
                {settings.schedules.map((rule) => (
                  <ScheduleCard
                    key={rule.id}
                    rule={rule}
                    onChange={(next) =>
                      void update({
                        schedules: settings.schedules.map((current) => (current.id === next.id ? next : current))
                      })
                    }
                  />
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid gap-5">
            <Panel icon={<BarChart3 size={18} />} title="Weekly Analytics">
              <div className="grid gap-4">
                <ChartBars
                  rows={(summary?.weeklyTrend ?? []).map((day) => ({
                    label: day.day,
                    value: day.averageIntensity,
                    detail: `${day.averageIntensity} (${day.count})`
                  }))}
                  tone="signal"
                />
                <ChartBars
                  rows={(summary?.categoryBreakdown ?? []).slice(0, 6).map((row) => ({
                    label: row.label,
                    value: row.percentage,
                    detail: `${row.percentage}%`
                  }))}
                />
              </div>
            </Panel>

            <Panel icon={<ShieldCheck size={18} />} title="Feed Purity">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Useful" value={`${summary?.usefulContentPercentage ?? 0}%`} />
                <MiniMetric label="Noise" value={`${summary?.noisePercentage ?? 0}%`} />
                <MiniMetric label="Manipulative" value={`${summary?.manipulativeContentPercentage ?? 0}%`} />
              </div>
              <div className="mt-3 rounded-lg bg-calm-50 p-3 text-sm dark:bg-ink-950">
                {summary?.doomscroll.message ?? "No local exposure data yet."}
              </div>
            </Panel>

            <Panel icon={<Brain size={18} />} title="Behavioral Intelligence">
              <InsightList title="Personal Triggers" items={(summary?.personalTriggers ?? []).map((trigger) => `${trigger.label}: ${trigger.count} items, avg ${trigger.averageIntensity}`)} />
              <InsightList title="Habit Signals" items={summary?.habitInsights ?? []} />
              <InsightList title="Self-Control" items={summary?.selfControlInsights ?? []} />
            </Panel>

            <Panel icon={<BarChart3 size={18} />} title="Algorithm Loops">
              <ChartBars
                rows={(summary?.algorithmLoops ?? []).map((loop) => ({
                  label: loop.label,
                  value: loop.percentage,
                  detail: `${loop.count} items`
                }))}
                tone="signal"
              />
              {!summary?.algorithmLoops.length && <EmptyState />}
            </Panel>

            <Panel icon={<Database size={18} />} title="Attention ROI">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Minutes" value={`${summary?.attentionRoi.estimatedMinutes ?? 0}`} />
                <MiniMetric label="Info Gain" value={`${summary?.attentionRoi.informationGainedEstimate ?? 0}`} />
                <MiniMetric label="ROI" value={`${summary?.attentionRoi.roiScore ?? 0}`} />
              </div>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-lg bg-calm-50 p-3 dark:bg-ink-950">{summary?.weeklyReport ?? "No weekly report yet."}</div>
                <div className="rounded-lg bg-calm-50 p-3 dark:bg-ink-950">{summary?.monthlyReport ?? "No monthly report yet."}</div>
              </div>
            </Panel>

            <Panel icon={<Library size={18} />} title="Diversity">
              <ChartBars
                rows={[
                  { label: "Topic diversity", value: summary?.echoChamber.topicDiversity ?? 0, detail: `${summary?.echoChamber.topicDiversity ?? 0}` },
                  { label: "Source diversity", value: summary?.echoChamber.sourceDiversity ?? 0, detail: `${summary?.echoChamber.sourceDiversity ?? 0}` },
                  { label: "Political diversity", value: summary?.echoChamber.politicalDiversity ?? 0, detail: `${summary?.echoChamber.politicalDiversity ?? 0}` }
                ]}
              />
              <div className="mt-3 rounded-lg bg-calm-50 p-3 text-sm dark:bg-ink-950">
                {summary?.echoChamber.summary ?? "No diversity data yet."}
              </div>
            </Panel>

            <Panel icon={<Brain size={18} />} title="Technique Trends">
              <ChartBars
                rows={(summary?.mostCommonTechniques ?? []).map((row) => ({
                  label: readableKey(row.key),
                  value: row.average,
                  detail: `${row.count} items`
                }))}
                tone="signal"
              />
              {!summary?.mostCommonTechniques.length && <EmptyState />}
            </Panel>

            <Panel icon={<Database size={18} />} title="Privacy">
              <div className="grid gap-3 text-sm text-ink-600 dark:text-ink-300">
                <div className="rounded-lg bg-calm-50 p-3 dark:bg-ink-950">
                  Browsing analysis is stored locally in IndexedDB. Preferences are stored in Chrome Storage.
                </div>
                <div className="rounded-lg bg-calm-50 p-3 dark:bg-ink-950">
                  No telemetry or profiling leaves the device by default. External AI providers are architecture stubs only.
                </div>
                <label className="flex items-center justify-between gap-3 rounded-lg bg-calm-50 p-3 dark:bg-ink-950">
                  <span className="font-bold">YouTube Platform</span>
                  <input
                    className="h-5 w-5 accent-calm-700"
                    type="checkbox"
                    checked={settings.enabledPlatforms.includes("youtube")}
                    onChange={(event) =>
                      void update({
                        enabledPlatforms: event.currentTarget.checked
                          ? Array.from(new Set([...settings.enabledPlatforms, "youtube"]))
                          : settings.enabledPlatforms.filter((platform) => platform !== "youtube")
                      })
                    }
                  />
                </label>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-ink-100 bg-white px-3 text-sm font-bold text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
                  type="button"
                  onClick={() => void exportAnalytics()}
                >
                  <Database size={16} />
                  Export Analytics
                </button>
              </div>
            </Panel>

            <Panel icon={<Library size={18} />} title="Technique Library">
              <div className="grid gap-2">
                {LIBRARY_ROWS.map(([title, body]) => (
                  <div key={title} className="rounded-lg border border-ink-100 bg-calm-50 p-3 dark:border-ink-700 dark:bg-ink-950">
                    <div className="text-sm font-bold">{title}</div>
                    <div className="mt-1 text-xs leading-5 text-ink-500 dark:text-ink-300">{body}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={<Brain size={18} />} title="AI Provider Architecture">
              <div className="grid gap-2">
                {PROVIDER_DESCRIPTORS.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between rounded-lg bg-calm-50 p-3 text-sm dark:bg-ink-950">
                    <span className="font-medium">{provider.label}</span>
                    <span className="text-xs text-ink-500 dark:text-ink-300">
                      {provider.availableInMvp ? "MVP" : provider.localByDefault ? "Ready" : "Optional"}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        </div>
      </div>
    </main>
  )
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink-100 bg-white p-4 shadow-sm dark:border-ink-700 dark:bg-ink-900">
      <h2 className="m-0 mb-3 flex items-center gap-2 text-base font-extrabold">
        <span className="text-calm-700 dark:text-calm-300">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
      <div className="mb-3 text-calm-700 dark:text-calm-300">{icon}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-ink-500 dark:text-ink-300">{label}</div>
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: string
  options: Array<[string, string]>
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-xs font-bold text-ink-500 dark:text-ink-300">
      {label}
      <select
        className="h-10 rounded-lg border border-ink-100 bg-white px-3 text-sm font-medium text-ink-900 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function FocusCard({ session, onChange }: { session: FocusSession; onChange: (session: FocusSession) => void }) {
  return (
    <button
      className="rounded-lg border border-ink-100 bg-calm-50 p-3 text-left dark:border-ink-700 dark:bg-ink-950"
      type="button"
      onClick={() =>
        onChange({
          ...session,
          active: !session.active,
          endsAt: !session.active ? Date.now() + 90 * 60 * 1000 : undefined
        })
      }
    >
      <span className="block text-sm font-bold">{session.name}</span>
      <span className="mt-1 block text-xs text-ink-500 dark:text-ink-300">
        {session.active ? "Active for 90 minutes" : `${session.blockedCategories.length} category filters`}
      </span>
    </button>
  )
}

function ScheduleCard({ rule, onChange }: { rule: ScheduleRule; onChange: (rule: ScheduleRule) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 bg-calm-50 p-3 dark:border-ink-700 dark:bg-ink-950">
      <span>
        <span className="block text-sm font-bold">{rule.label}</span>
        <span className="block text-xs text-ink-500 dark:text-ink-300">
          {rule.startTime} to {rule.endTime}
        </span>
      </span>
      <input
        className="h-5 w-5 accent-calm-700"
        type="checkbox"
        checked={rule.enabled}
        onChange={(event) => onChange({ ...rule, enabled: event.currentTarget.checked })}
      />
    </label>
  )
}

function EmotionalFilterCard({
  filter,
  onChange
}: {
  filter: EmotionalFilter
  onChange: (filter: EmotionalFilter) => void
}) {
  return (
    <div className="rounded-lg border border-ink-100 bg-calm-50 p-3 dark:border-ink-700 dark:bg-ink-950">
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold capitalize">{readableKey(filter.tone)}</span>
        <input
          className="h-5 w-5 accent-calm-700"
          type="checkbox"
          checked={filter.enabled}
          onChange={(event) => onChange({ ...filter, enabled: event.currentTarget.checked })}
        />
      </label>
      <div className="mt-3 grid grid-cols-[1fr_42px] items-center gap-3">
        <input
          className="accent-calm-700"
          type="range"
          min={30}
          max={95}
          value={filter.threshold}
          onChange={(event) => onChange({ ...filter, threshold: Number(event.currentTarget.value) })}
        />
        <span className="text-right text-sm font-bold">{filter.threshold}</span>
      </div>
    </div>
  )
}

function CustomCategoryCard({
  category,
  onChange
}: {
  category: CustomAiCategory
  onChange: (category: CustomAiCategory) => void
}) {
  return (
    <div className="rounded-lg border border-ink-100 bg-calm-50 p-3 dark:border-ink-700 dark:bg-ink-950">
      <div className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-bold">{category.label}</span>
          <span className="mt-1 block text-xs leading-5 text-ink-500 dark:text-ink-300">{category.prompt}</span>
        </span>
        <input
          className="mt-1 h-5 w-5 accent-calm-700"
          type="checkbox"
          checked={category.enabled}
          onChange={(event) => onChange({ ...category, enabled: event.currentTarget.checked })}
        />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Select
          label="Action"
          value={category.action}
          options={[
            ["hide", "Hide"],
            ["approve", "Approve"],
            ["track", "Track"]
          ]}
          onChange={(action) => onChange({ ...category, action: action as CustomAiCategory["action"] })}
        />
        <label className="grid gap-1 text-xs font-bold text-ink-500 dark:text-ink-300">
          Score
          <input
            className="h-10 rounded-lg border border-ink-100 bg-white px-3 text-sm font-medium text-ink-900 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100"
            type="number"
            min={30}
            max={100}
            value={category.score}
            onChange={(event) => onChange({ ...category, score: Number(event.currentTarget.value) })}
          />
        </label>
      </div>
    </div>
  )
}

function GoalCard({ goal, onChange }: { goal: GoalRule; onChange: (goal: GoalRule) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 bg-calm-50 p-3 dark:border-ink-700 dark:bg-ink-950">
      <span>
        <span className="block text-sm font-bold">{goal.label}</span>
        <span className="mt-1 block text-xs text-ink-500 dark:text-ink-300">
          {goal.approvedCategories.length} approved · {goal.blockedCategories.length} blocked
        </span>
      </span>
      <input
        className="h-5 w-5 accent-calm-700"
        type="checkbox"
        checked={goal.enabled}
        onChange={(event) => onChange({ ...goal, enabled: event.currentTarget.checked })}
      />
    </label>
  )
}

function BudgetCard({
  budget,
  usage,
  onChange
}: {
  budget: AttentionBudget
  usage?: AnalyticsSummary["attentionBudgetUsage"][number]
  onChange: (budget: AttentionBudget) => void
}) {
  return (
    <div className="rounded-lg border border-ink-100 bg-calm-50 p-3 dark:border-ink-700 dark:bg-ink-950">
      <label className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-bold">{budget.label}</span>
          <span className="mt-1 block text-xs text-ink-500 dark:text-ink-300">
            {usage ? `${usage.estimatedMinutes}m used · ${usage.remainingMinutes}m left` : "No usage yet"}
          </span>
        </span>
        <input
          className="mt-1 h-5 w-5 accent-calm-700"
          type="checkbox"
          checked={budget.enabled}
          onChange={(event) => onChange({ ...budget, enabled: event.currentTarget.checked })}
        />
      </label>
      <label className="mt-3 grid gap-1 text-xs font-bold text-ink-500 dark:text-ink-300">
        Daily minutes
        <input
          className="h-10 rounded-lg border border-ink-100 bg-white px-3 text-sm font-medium text-ink-900 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100"
          type="number"
          min={5}
          max={240}
          value={budget.dailyLimitMinutes}
          onChange={(event) => onChange({ ...budget, dailyLimitMinutes: Number(event.currentTarget.value) })}
        />
      </label>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-calm-50 p-3 dark:bg-ink-950">
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-xs text-ink-500 dark:text-ink-300">{label}</div>
    </div>
  )
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-3 rounded-lg bg-calm-50 p-3 dark:bg-ink-950">
      <div className="mb-2 text-sm font-bold">{title}</div>
      {items.length > 0 ? (
        <ul className="m-0 grid gap-1 pl-4 text-xs leading-5 text-ink-500 dark:text-ink-300">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-xs text-ink-500 dark:text-ink-300">No local signal yet.</p>
      )}
    </div>
  )
}

function EmptyState() {
  return <p className="m-0 text-sm text-ink-500 dark:text-ink-300">No local analytics yet.</p>
}

function toggleCategory(categories: CategoryId[], category: CategoryId): CategoryId[] {
  return categories.includes(category)
    ? categories.filter((current) => current !== category)
    : [...categories, category]
}

function readableKey(value: string): string {
  return value.replace(/([A-Z])/g, " $1").replace(/-/g, " ").toLowerCase()
}

async function requestSummary(): Promise<AnalyticsSummary | undefined> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return undefined
  }

  const response = await chrome.runtime.sendMessage({ type: "RSFG_GET_ANALYTICS_SUMMARY", days: 7 })
  return response?.summary as AnalyticsSummary | undefined
}

async function clearAnalytics(): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return
  }

  await chrome.runtime.sendMessage({ type: "RSFG_CLEAR_ANALYTICS" })
}

async function exportAnalytics(): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return
  }

  const response = await chrome.runtime.sendMessage({ type: "RSFG_EXPORT_ANALYTICS", days: 30 })
  const events = response?.events ?? []
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), events }, null, 2)], {
    type: "application/json"
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `rageshield-analytics-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}
