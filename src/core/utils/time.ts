export function isTimeInRange(now: Date, startTime: string, endTime: string): boolean {
  const current = now.getHours() * 60 + now.getMinutes()
  const start = parseClock(startTime)
  const end = parseClock(endTime)

  if (start <= end) {
    return current >= start && current <= end
  }

  return current >= start || current <= end
}

export function parseClock(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":")
  return Number(hours) * 60 + Number(minutes)
}

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function formatDay(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(new Date(timestamp))
}
