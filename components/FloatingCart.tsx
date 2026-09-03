"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useCart } from "../context/CartContext"
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function FloatingCart() {
  const { cart } = useCart()
  const [open, setOpen] = useState(false)

  const itemCount = useMemo(() => cart.reduce((sum, it) => sum + (it.quantity || 0), 0), [cart])
  const total = useMemo(
    () => cart.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0),
    [cart]
  )

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-pink-500 px-4 py-3 text-white shadow-lg hover:bg-pink-600"
        aria-expanded={open}
        aria-controls="floating-cart"
        title={open ? "Close cart" : "Open cart"}
      >
        <ShoppingCartIcon className="h-6 w-6" />
        <span className="hidden text-sm font-semibold sm:inline">Cart</span>
        <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">{itemCount}</span>
      </button>

      {/* Panel */}
      <div
        id="floating-cart"
        className={`fixed right-4 bottom-20 z-50 w-[92vw] max-w-sm overflow-hidden rounded-xl border border-pink-100 bg-white shadow-2xl transition-all duration-200 sm:bottom-24 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"} `}
        role="dialog"
        aria-label="Cart preview"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-pink-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5 text-pink-600" />
            <h3 className="font-semibold text-pink-700">Your Cart</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 hover:bg-pink-100"
            aria-label="Close"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5 text-pink-700" />
          </button>
        </div>

        {/* Items */}
        <div className="max-h-64 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {cart.map((it) => (
                <li key={`${it.id}`} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                    {/* Safe square thumb */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800" title={it.name}>
                      {it.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty {it.quantity} · ${Number(it.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    ${(Number(it.price) * Number(it.quantity)).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-base font-semibold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex-1 rounded bg-pink-500 py-2 text-center text-white hover:bg-pink-600"
            >
              View Cart
            </Link>
            {/* If you have a checkout route, keep; otherwise feel free to remove */}
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="flex-1 rounded bg-gray-100 py-2 text-center text-gray-800 hover:bg-gray-200"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
