import { describe, expect, it } from "vitest"
import { parseLastOrder } from "./last-order"

const valid = {
  name: "Parent",
  email: "parent@example.com",
  address: "Main Street",
  paymentMethod: "cod",
  items: [{ id: 1, name: "Hat", quantity: 1, price: 9 }],
}

describe("last-order persistence", () => {
  it("parses a valid receipt", () => {
    expect(parseLastOrder(JSON.stringify(valid))).toMatchObject(valid)
  })

  it.each([
    null,
    "",
    "broken",
    JSON.stringify({ ...valid, email: "bad" }),
    JSON.stringify({ ...valid, items: [], paymentMethod: "wire" }),
  ])("fails closed for malformed receipt %s", (stored) => expect(parseLastOrder(stored)).toBeNull())
})
