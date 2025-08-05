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
    <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-2xl font-bold text-pink-500">BabyShop</h1>
      </Link>
      <nav className="flex items-center space-x-6 text-gray-700">
        <Link href="/" className="hover:text-pink-500">Home</Link>
        <Link href="/cart" className="relative hover:text-pink-500 flex items-center">
          <ShoppingCartIcon className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-3 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </Link>
        {user && (
          <>
            <Link href="/admin" className="hover:text-pink-500">Admin</Link>
            <Link href="/profile" className="hover:text-pink-500">My Page</Link>
            <Link href="/admin/orders" className="hover:text-pink-500">Orders</Link>
          </>
        )}
        {user ? (
        <>
            <span className="text-sm text-pink-600">👋 {user}</span>
            <button
            onClick={() => {
              logout()
              location.href = "/"
            }}
            className="text-sm text-red-500 hover:underline"
            >
            Logout
            </button>
        </>
        ) : (
        <>
            <Link href="/login" className="hover:text-pink-500">Login</Link>
            <Link href="/register" className="hover:text-pink-500">Register</Link>
        </>
        )}
      </nav>
    </header>
  )
}
