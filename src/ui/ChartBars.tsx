import clsx from "clsx"

interface ChartBarsProps {
  rows: Array<{ label: string; value: number; detail?: string }>
  tone?: "calm" | "signal"
}

export function ChartBars({ rows, tone = "calm" }: ChartBarsProps) {
  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium text-ink-700 dark:text-ink-100">{row.label}</span>
            <span className="shrink-0 text-ink-500 dark:text-ink-300">{row.detail ?? row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-700">
            <div
              className={clsx("h-full rounded-full", tone === "signal" ? "bg-signal-mid" : "bg-calm-500")}
              style={{ width: `${Math.max(3, Math.min(100, row.value))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
