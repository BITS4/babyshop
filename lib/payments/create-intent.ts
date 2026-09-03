import { parsePaymentRequest, type PaymentRequest } from "./payment-request"
import { parseIdempotencyKey } from "./idempotency"
import { priceOrder, type CatalogPrice } from "./price-order"

export type PaymentIntentResult = { id: string; clientSecret: string }

export type PaymentDependencies = {
  verifyUser: (token: string) => Promise<{ uid: string }>
  loadCatalog: (productIds: number[]) => Promise<CatalogPrice[]>
  createIntent: (input: {
    amount: number
    currency: "usd"
    userId: string
    idempotencyKey: string
  }) => Promise<PaymentIntentResult>
}

export async function createTrustedPaymentIntent(
  input: unknown,
  token: string,
  idempotencyKey: string,
  dependencies: PaymentDependencies
): Promise<PaymentIntentResult> {
  const request: PaymentRequest = parsePaymentRequest(input)
  const safeKey = parseIdempotencyKey(idempotencyKey)
  const user = await dependencies.verifyUser(token)
  const productIds = Array.from(new Set(request.items.map((item) => item.productId)))
  const catalog = await dependencies.loadCatalog(productIds)
  const amount = priceOrder(request, catalog)

  return dependencies.createIntent({
    amount,
    currency: request.currency,
    userId: user.uid,
    idempotencyKey: safeKey,
  })
}
