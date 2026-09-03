import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  clearCart: vi.fn(),
  loadProfile: vi.fn(),
  submitOrder: vi.fn(),
  confirmCardPayment: vi.fn(),
  reportClientError: vi.fn(),
  user: null as null | { uid: string; email: string; getIdToken: () => Promise<string> },
  clientSecret: null as string | null,
  paymentError: "",
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace, back: mocks.back }),
}))
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: mocks.user }),
}))
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({
    cart: [
      {
        id: 7,
        quantity: 2,
        name: "Socks",
        price: 5,
        image: "/socks",
        description: "Soft",
        category: "socks",
      },
    ],
    clearCart: mocks.clearCart,
  }),
}))
vi.mock("@/lib/profile/profile-repository", () => ({ loadProfile: mocks.loadProfile }))
vi.mock("@/lib/checkout/order-client", () => ({ submitOrder: mocks.submitOrder }))
vi.mock("@/lib/checkout/use-payment-intent", () => ({
  usePaymentIntent: () => ({
    clientSecret: mocks.clientSecret,
    error: mocks.paymentError,
    fingerprint: "7:2",
  }),
}))
vi.mock("@/lib/observability/client", () => ({ reportClientError: mocks.reportClientError }))
vi.mock("@stripe/react-stripe-js", () => ({
  CardElement: () => <div>Secure card field</div>,
  Elements: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => ({ confirmCardPayment: mocks.confirmCardPayment }),
  useElements: () => ({ getElement: () => ({}) }),
}))
vi.mock("@stripe/stripe-js", () => ({ loadStripe: vi.fn(() => null) }))

import CheckoutPage from "./page"

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.clientSecret = null
    mocks.paymentError = ""
    mocks.user = {
      uid: "user-1",
      email: "parent@example.com",
      getIdToken: vi.fn().mockResolvedValue("token"),
    }
    mocks.loadProfile.mockResolvedValue({
      name: "Parent",
      address: "12 Family Street",
      phone: "12345678",
      photoURL: "",
    })
    mocks.submitOrder.mockResolvedValue(undefined)
    mocks.confirmCardPayment.mockResolvedValue({
      paymentIntent: { id: "pi_1", status: "succeeded" },
    })
  })

  it("loads a profile and places a server-verified cash order", async () => {
    render(<CheckoutPage />)
    expect(await screen.findByDisplayValue("Parent")).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Place order" }))
    await waitFor(() => expect(mocks.submitOrder).toHaveBeenCalledOnce())
    expect(mocks.clearCart).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledWith("/thankyou")
  })

  it("disables card submission until the intent is ready", async () => {
    render(<CheckoutPage />)
    await screen.findByDisplayValue("Parent")
    fireEvent.click(screen.getByRole("radio", { name: "Card (Stripe)" }))
    expect(screen.getByRole("button", { name: "Pay & place order" })).toBeDisabled()
  })

  it("reports a card failure without writing an order", async () => {
    mocks.clientSecret = "secret"
    mocks.confirmCardPayment.mockResolvedValue({ error: { message: "Card declined" } })
    const alert = vi.spyOn(window, "alert").mockImplementation(() => undefined)
    render(<CheckoutPage />)
    await screen.findByDisplayValue("Parent")
    fireEvent.click(screen.getByRole("radio", { name: "Card (Stripe)" }))
    fireEvent.click(screen.getByRole("button", { name: "Pay & place order" }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Card declined"))
    expect(mocks.submitOrder).not.toHaveBeenCalled()
  })

  it("submits the verified payment intent after a successful card payment", async () => {
    mocks.clientSecret = "secret"
    render(<CheckoutPage />)
    await screen.findByDisplayValue("Parent")
    fireEvent.click(screen.getByRole("radio", { name: "Card (Stripe)" }))
    fireEvent.click(screen.getByRole("button", { name: "Pay & place order" }))
    await waitFor(() =>
      expect(mocks.confirmCardPayment).toHaveBeenCalledWith("secret", expect.anything())
    )
    expect(mocks.submitOrder).toHaveBeenCalledWith(
      expect.objectContaining({ paymentIntentId: "pi_1" })
    )
  })

  it("redirects an unauthenticated submission", async () => {
    mocks.user = null
    render(<CheckoutPage />)
    const button = await screen.findByRole("button", { name: "Place order" })
    fireEvent.click(button)
    expect(mocks.replace).toHaveBeenCalledWith("/login")
  })

  it("keeps the cart and reports a failed order request", async () => {
    mocks.submitOrder.mockRejectedValue(new Error("Order service unavailable"))
    const alert = vi.spyOn(window, "alert").mockImplementation(() => undefined)
    render(<CheckoutPage />)
    await screen.findByDisplayValue("Parent")
    fireEvent.click(screen.getByRole("button", { name: "Place order" }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Order service unavailable"))
    expect(mocks.clearCart).not.toHaveBeenCalled()
    expect(mocks.reportClientError).toHaveBeenCalled()
  })

  it("rejects incomplete checkout details before calling the order API", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => undefined)
    mocks.loadProfile.mockResolvedValue({ name: "", address: "", phone: "", photoURL: "" })
    render(<CheckoutPage />)
    await screen.findByRole("button", { name: "Place order" })
    fireEvent.click(screen.getByRole("button", { name: "Place order" }))
    expect(alert).toHaveBeenCalled()
    expect(mocks.submitOrder).not.toHaveBeenCalled()
  })

  it("renders an accessible payment-intent error", async () => {
    mocks.paymentError = "Payment provider unavailable"
    render(<CheckoutPage />)
    await screen.findByDisplayValue("Parent")
    fireEvent.click(screen.getByRole("radio", { name: "Card (Stripe)" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Payment provider unavailable")
  })
})
