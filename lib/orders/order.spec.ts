import { describe, expect, it } from "vitest"
import { orderTime, parseOrderDocument, sortOrdersNewestFirst, type Order } from "./order"

describe("order document parsing", () => {
  it("normalizes a valid legacy order", () => {
    expect(
      parseOrderDocument("order-1", {
        name: "Parent",
        email: "p@example.com",
        address: "Main Street",
        phone: 12345678,
        items: [{ name: "Hat", quantity: "2" }],
      })
    ).toMatchObject({ id: "order-1", phone: "12345678", status: "pending" })
  })

  it("rejects malformed order items and statuses", () => {
    expect(parseOrderDocument("x", { items: [{ name: "Hat", quantity: 0 }] })).toBeNull()
    expect(parseOrderDocument("x", { items: [], status: "hacked" })).toBeNull()
  })

  it("sorts Firestore and ISO timestamps without mutation", () => {
    const older: Order = {
      id: "old",
      name: "",
      email: "",
      address: "",
      items: [],
      status: "pending",
      timestamp: "2025-01-01T00:00:00.000Z",
    }
    const newer: Order = {
      ...older,
      id: "new",
      createdAt: { toMillis: () => 2_000_000_000_000, toDate: () => new Date(2_000_000_000_000) },
    }
    const input = [older, newer]
    expect(sortOrdersNewestFirst(input).map(({ id }) => id)).toEqual(["new", "old"])
    expect(input.map(({ id }) => id)).toEqual(["old", "new"])
  })

  it("returns zero for absent or invalid legacy timestamps", () => {
    const base: Order = { id: "x", name: "", email: "", address: "", items: [], status: "pending" }
    expect(orderTime(base)).toBe(0)
    expect(orderTime({ ...base, timestamp: "invalid" })).toBe(0)
  })
})
