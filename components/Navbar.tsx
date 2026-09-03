"use client"

import Link from "next/link"
import { useCart } from "../context/CartContext"
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline"
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
  const [mobileOpen, setMobileOpen] = useState(false)

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
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: url, updatedAt: new Date().toISOString() },
        { merge: true }
      )
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url })
    } catch (err: any) {
      alert(err?.message || "Upload failed.")
    } finally {
      setBusy(false)
      e.target.value = ""
    }
  }

  const isAdmin = (user?.email || "").toLowerCase() === "vazirpirov15@gmail.com"

  const NavLinks = () => (
    <>
      <Link href="/" className="hover:text-pink-500 flex items-center gap-1.5 flex-none">
        <HomeIcon className="h-5 w-5" />
        <span>Home</span>
      </Link>

      <Link href="/cart" className="relative hover:text-pink-500 flex items-center gap-1.5 flex-none">
        <ShoppingCartIcon className="h-5 w-5" />
        <span>Cart</span>
        {itemCount > 0 && (
          <span className="absolute -top-2 right-0 translate-x-1/2 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
            {itemCount}
          </span>
        )}
      </Link>

      {user && isAdmin && (
        <Link href="/admin" className="hover:text-pink-500 flex items-center gap-1.5 flex-none">
          <ShieldCheckIcon className="h-5 w-5" />
          <span>Admin</span>
        </Link>
      )}

      {user && (
        <>
          <Link href="/admin/orders" className="hover:text-pink-500 flex items-center gap-1.5 flex-none">
            <ClipboardDocumentListIcon className="h-5 w-5" />
            <span>Orders</span>
          </Link>
          <Link href="/profile" className="hover:text-pink-500 flex items-center gap-1.5 flex-none">
            <UserIcon className="h-5 w-5" />
            <span>My Page</span>
          </Link>
        </>
      )}
    </>
  )

  return (
    <header className="w-full bg-white shadow-md">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-4 flex items-center gap-3">
        {/* LEFT: Hamburger BEFORE brand (left-side drawer) */}
        <button
          type="button"
          className="md:hidden rounded p-2 hover:bg-pink-50"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          title="Open menu"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>

        {/* Brand */}
        <Link href="/" className="shrink-0">
          <h1 className="text-2xl font-bold text-pink-500">BabyShop</h1>
        </Link>

        {/* Desktop nav (middle) */}
        <nav
          className="
            hidden md:block
            flex-1 min-w-0 overflow-x-auto overscroll-x-contain
            whitespace-nowrap
            [-ms-overflow-style:'none'] [scrollbar-width:'none']
            [&::-webkit-scrollbar]:hidden
          "
          role="navigation"
          aria-label="Main"
        >
          <div className="inline-flex items-center gap-6 text-gray-700">
            <NavLinks />
          </div>
        </nav>

        {/* RIGHT: Auth actions (STICK TO RIGHT) */}
        <div className="ml-auto flex items-center gap-3 shrink-0 text-gray-700">
          {user ? (
            <>
              {/* 👋 + email */}
              <span
                className="text-sm text-pink-600 max-w-[140px] sm:max-w-[220px] truncate"
                title={user.email || "User"}
              >
                👋 {user.email ?? "User"}
              </span>

              {/* Avatar (click to upload) */}
              <button
                type="button"
                onClick={() => !busy && fileRef.current?.click()}
                className="relative h-8 w-8 rounded-full border border-neutral-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-300"
                title={busy ? "Uploading…" : "Change avatar"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || FALLBACK_AVATAR}
                  alt="avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(ev) => { (ev.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR }}
                />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPick}
              />

              <button
                onClick={() => {
                  logout()
                  location.href = "/"
                }}
                className="text-sm hover:text-pink-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-pink-500">Login</Link>
              <Link href="/register" className="hover:text-pink-500">Sign up</Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER (LEFT SIDE) */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        {/* panel from LEFT */}
        <div
          className={`
            absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col
            transform transition-transform duration-200
            ${mobileOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full"}
          `}
          role="dialog"
          aria-label="Mobile menu"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-800">Menu</h2>
            <button
              className="p-2 rounded hover:bg-pink-50"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              title="Close menu"
            >
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* links */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3 text-gray-800">
              <Link href="/" onClick={() => setMobileOpen(false)} className="hover:text-pink-500 flex items-center gap-2">
                <HomeIcon className="h-5 w-5" /> <span>Home</span>
              </Link>
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="hover:text-pink-500 flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5" /> <span>Cart</span>
              </Link>

              {user && isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="hover:text-pink-500 flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5" /> <span>Admin</span>
                </Link>
              )}

              {user && (
                <>
                  <Link href="/admin/orders" onClick={() => setMobileOpen(false)} className="hover:text-pink-500 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="h-5 w-5" /> <span>Orders</span>
                  </Link>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="hover:text-pink-500 flex items-center gap-2">
                    <UserIcon className="h-5 w-5" /> <span>My Page</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* footer auth actions */}
          <div className="px-4 py-3 border-t bg-pink-50">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-pink-700 truncate" title={user.email || "User"}>
                  👋 {user.email ?? "User"}
                </span>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    logout()
                    location.href = "/"
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-pink-600 hover:text-pink-700">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="text-pink-600 hover:text-pink-700">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
