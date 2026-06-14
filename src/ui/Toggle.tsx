interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900">
      <span className="font-medium">{label}</span>
      <input
        className="h-5 w-5 accent-calm-700"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
  )
}
