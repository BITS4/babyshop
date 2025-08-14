"use client"

import Link from "next/link"
import { useCart } from "../context/CartContext"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="w-full bg-white shadow-md">
      <div className="mx-auto max-w-screen-xl px-6 py-4 flex items-center gap-4">
        {/* Brand (fixed, never scrolls) */}
        <Link href="/" className="shrink-0">
          <h1 className="text-2xl font-bold text-pink-500">BabyShop</h1>
        </Link>

        {/* NAV: single line, scrolls horizontally when needed */}
        <nav
          className="
            flex-1 min-w-0 overflow-x-auto overscroll-x-contain
            whitespace-nowrap
            [-ms-overflow-style:'none'] [scrollbar-width:'none']
            [&::-webkit-scrollbar]:hidden
          "
          role="navigation"
          aria-label="Main"
        >
          <div className="inline-flex items-center gap-6 text-gray-700">
            <Link href="/" className="hover:text-pink-500 flex-none">Home</Link>

            <Link href="/cart" className="relative hover:text-pink-500 flex items-center flex-none">
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 right-0 translate-x-1/2 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {user && (
              <>
                <Link href="/admin" className="hover:text-pink-500 flex-none">Admin</Link>
                <Link href="/profile" className="hover:text-pink-500 flex-none">My Page</Link>
                <Link href="/admin/orders" className="hover:text-pink-500 flex-none">Orders</Link>
              </>
            )}

            {user ? (
              <>
                {/* keep on one line; allow long emails without wrapping */}
                <span className="text-sm text-pink-600 flex-none">
                  👋 {user.email ?? "User"}
                </span>
                <button
                  onClick={() => {
                    logout()
                    location.href = "/"
                  }}
                  className="text-sm text-red-500 hover:underline flex-none"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-pink-500 flex-none">Login</Link>
                <Link href="/register" className="hover:text-pink-500 flex-none">Register</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
