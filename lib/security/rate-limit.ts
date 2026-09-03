type Entry = { count: number; resetsAt: number }

export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, Entry>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now
  ) {
    if (!Number.isInteger(limit) || limit < 1 || windowMs < 1) {
      throw new Error("Rate limit and window must be positive")
    }
  }

  consume(key: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = this.now()
    const existing = this.entries.get(key)
    const entry =
      !existing || existing.resetsAt <= now ? { count: 0, resetsAt: now + this.windowMs } : existing
    entry.count += 1
    this.entries.set(key, entry)

    return {
      allowed: entry.count <= this.limit,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetsAt - now) / 1_000)),
    }
  }
}
