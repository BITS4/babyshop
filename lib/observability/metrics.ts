const startedAt = Date.now()
const counters = new Map<string, number>()

function safeMetricName(name: string) {
  if (!/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(name)) throw new Error("Invalid metric name")
  return name
}

export function incrementCounter(name: string, amount = 1) {
  const safeName = safeMetricName(name)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Counter increment must be positive")
  counters.set(safeName, (counters.get(safeName) ?? 0) + amount)
}

export function renderMetrics(now = Date.now()) {
  const uptime = Math.max(0, (now - startedAt) / 1_000)
  const lines = [
    "# HELP babyshop_uptime_seconds Process uptime in seconds.",
    "# TYPE babyshop_uptime_seconds gauge",
    `babyshop_uptime_seconds ${uptime}`,
  ]
  Array.from(counters.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([name, value]) => lines.push(`# TYPE ${name} counter`, `${name} ${value}`))
  return `${lines.join("\n")}\n`
}

export function resetMetricsForTest() {
  counters.clear()
}
