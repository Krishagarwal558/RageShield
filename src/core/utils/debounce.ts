export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  waitMs: number
): (...args: TArgs) => void {
  let timeoutId: number | undefined

  return (...args: TArgs) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => callback(...args), waitMs)
  }
}

export function throttle<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  waitMs: number
): (...args: TArgs) => void {
  let lastRun = 0
  let timeoutId: number | undefined

  return (...args: TArgs) => {
    const now = Date.now()
    const remaining = waitMs - (now - lastRun)

    if (remaining <= 0) {
      window.clearTimeout(timeoutId)
      timeoutId = undefined
      lastRun = now
      callback(...args)
      return
    }

    if (timeoutId === undefined) {
      timeoutId = window.setTimeout(() => {
        lastRun = Date.now()
        timeoutId = undefined
        callback(...args)
      }, remaining)
    }
  }
}
