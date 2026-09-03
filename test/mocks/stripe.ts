import { vi } from "vitest"

export function createStripeMock(status: "succeeded" | "failed" = "succeeded") {
  return {
    confirmCardPayment: vi
      .fn()
      .mockResolvedValue(
        status === "succeeded"
          ? { paymentIntent: { id: "pi_test", status: "succeeded" } }
          : { error: { message: "Test card declined" } }
      ),
  }
}

export function createStripeElementsMock() {
  return { getElement: vi.fn(() => ({ id: "test-card-element" })) }
}
