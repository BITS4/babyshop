import type { PaymentRequest } from "./payment-request"

export class OrderPricingError extends Error {
  constructor(
    message: string,
    public readonly code: "PRODUCT_NOT_FOUND" | "AMOUNT_OUT_OF_RANGE"
  ) {
    super(message)
    this.name = "OrderPricingError"
  }
}

export type CatalogPrice = { id: number; price: number }

export function priceOrder(request: PaymentRequest, catalog: readonly CatalogPrice[]): number {
  const priceById = new Map(catalog.map((product) => [product.id, product.price]))

  const amount = request.items.reduce((total, item) => {
    const price = priceById.get(item.productId)
    if (price === undefined || !Number.isFinite(price) || price < 0) {
      throw new OrderPricingError(`Product ${item.productId} is unavailable`, "PRODUCT_NOT_FOUND")
    }
    return total + Math.round(price * 100) * item.quantity
  }, 0)

  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 1_000_000) {
    throw new OrderPricingError(
      "Order total must be between $0.50 and $10,000",
      "AMOUNT_OUT_OF_RANGE"
    )
  }

  return amount
}
