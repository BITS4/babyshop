"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useCart } from "../context/CartContext"
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function FloatingCart() {
  const { cart } = useCart()
  const [open, setOpen] = useState(false)

  const itemCount = useMemo(
    () => cart.reduce((sum, it) => sum + (it.quantity || 0), 0),
    [cart]
  )
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
        className="
          fixed bottom-4 right-4 z-50
          flex items-center gap-2
          rounded-full shadow-lg
          bg-pink-500 hover:bg-pink-600 text-white
          px-4 py-3
        "
        aria-expanded={open}
        aria-controls="floating-cart"
        title={open ? "Close cart" : "Open cart"}
      >
        <ShoppingCartIcon className="h-6 w-6" />
        <span className="text-sm font-semibold hidden sm:inline">Cart</span>
        <span className="ml-1 text-xs bg-white/20 rounded-full px-2 py-0.5">
          {itemCount}
        </span>
      </button>

      {/* Panel */}
      <div
        id="floating-cart"
        className={`
          fixed z-50 right-4 bottom-20 sm:bottom-24
          w-[92vw] max-w-sm
          rounded-xl shadow-2xl border border-pink-100
          bg-white overflow-hidden
          transition-all duration-200
          ${open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"}
        `}
        role="dialog"
        aria-label="Cart preview"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-pink-50">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5 text-pink-600" />
            <h3 className="font-semibold text-pink-700">Your Cart</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-pink-100"
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
                  <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                    {/* Safe square thumb */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate" title={it.name}>
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
        <div className="border-t border-gray-100 px-4 py-3 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-base font-semibold text-gray-900">
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex-1 text-center bg-pink-500 hover:bg-pink-600 text-white py-2 rounded"
            >
              View Cart
            </Link>
            {/* If you have a checkout route, keep; otherwise feel free to remove */}
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
