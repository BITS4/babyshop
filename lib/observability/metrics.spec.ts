import { beforeEach, describe, expect, it } from "vitest"
import { incrementCounter, renderMetrics, resetMetricsForTest } from "./metrics"

describe("Prometheus metrics", () => {
  beforeEach(resetMetricsForTest)

  it("renders uptime and sorted counters", () => {
    incrementCounter("requests_total")
    incrementCounter("payments_total", 2)
    const output = renderMetrics()
    expect(output).toContain("babyshop_uptime_seconds")
    expect(output).toContain("payments_total 2")
    expect(output.indexOf("payments_total")).toBeLessThan(output.indexOf("requests_total"))
  })

  it("accumulates counter values", () => {
    incrementCounter("requests_total", 2)
    incrementCounter("requests_total", 3)
    expect(renderMetrics()).toContain("requests_total 5")
  })

  it.each(["bad-name", "0starts_wrong", "has space"])("rejects invalid name %s", (name) => {
    expect(() => incrementCounter(name)).toThrow()
  })

  it.each([0, -1, Number.NaN])("rejects invalid increment %s", (amount) => {
    expect(() => incrementCounter("requests_total", amount)).toThrow()
  })
})
