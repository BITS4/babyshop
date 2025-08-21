"use client"

import Link from "next/link"
import { useCart } from "../context/CartContext"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import { useAuth } from "../context/AuthContext"
import { useEffect, useRef, useState, ChangeEvent } from "react"
import { db, auth, storage } from "@/app/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"

export default function Navbar() {
  const { cart } = useCart()
  const { user, logout } = useAuth()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const FALLBACK_AVATAR =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>
        <rect width='100%' height='100%' fill='#f3f4f6'/>
        <circle cx='40' cy='30' r='14' fill='#d1d5db'/>
        <rect x='18' y='48' width='44' height='18' rx='9' fill='#d1d5db'/>
      </svg>`
    )

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) { setAvatarUrl(""); return }
      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        const url = (snap.exists() && (snap.data() as any).photoURL) || user.photoURL || ""
        setAvatarUrl(url)
      } catch {
        setAvatarUrl(user?.photoURL || "")
      }
    }
    load()
  }, [user?.uid, user?.photoURL])

  const openPicker = () => fileRef.current?.click()

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB.")
      e.target.value = ""
      return
    }
    try {
      setBusy(true)
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, file, { contentType: file.type })
      const url = await getDownloadURL(storageRef)
      setAvatarUrl(url)
      await setDoc(doc(db, "users", user.uid), { photoURL: url, updatedAt: new Date().toISOString() }, { merge: true })
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url })
    } catch (err: any) {
      alert(err?.message || "Upload failed.")
    } finally {
      setBusy(false)
      e.target.value = ""
    }
  }

  const isAdmin = (user?.email || "").toLowerCase() === "vazirpirov15@gmail.com"

  return (
    <header className="w-full bg-white shadow-md">
      <div className="mx-auto max-w-screen-xl px-6 py-4 flex items-center gap-4">
        <Link href="/" className="shrink-0">
          <h1 className="text-2xl font-bold text-pink-500">BabyShop</h1>
        </Link>

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

            {user && isAdmin && (
              <Link href="/admin" className="hover:text-pink-500 flex-none">Admin</Link>
            )}

            {user && (
              <>
                <Link href="/admin/orders" className="hover:text-pink-500 flex-none">Orders</Link>
                <Link href="/profile" className="hover:text-pink-500 flex-none">My Page</Link>

                <div className="relative h-8 w-8 rounded-full border border-neutral-200 overflow-hidden flex-none">
                  <img
                    src={avatarUrl || FALLBACK_AVATAR}
                    alt="avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(ev) => { (ev.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR }}
                  />
                  <button
                    type="button"
                    onClick={(ev) => { ev.stopPropagation(); if (!busy) openPicker() }}
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-white text-sm leading-none flex items-center justify-center shadow hover:bg-pink-600 active:scale-95"
                    title="Upload your photo"
                    aria-label="Upload your photo"
                  >
                    +
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPick}
                  />
                </div>
              </>
            )}

            {user ? (
              <>
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
