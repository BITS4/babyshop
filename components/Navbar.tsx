"use client"

import {
  Bars3Icon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { updateProfile } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { auth, db, storage } from "@/app/firebase"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { errorMessage } from "@/lib/security/errors"
import { validateImageUpload } from "@/lib/security/image-upload"

const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='100%' height='100%' fill='#f3f4f6'/><circle cx='40' cy='30' r='14' fill='#d1d5db'/><rect x='18' y='48' width='44' height='18' rx='9' fill='#d1d5db'/></svg>"
  )

type NavigationLinksProps = {
  isAuthenticated: boolean
  isAdmin: boolean
  itemCount: number
  onNavigate?: () => void
}

function NavigationLinks({
  isAuthenticated,
  isAdmin,
  itemCount,
  onNavigate = () => undefined,
}: NavigationLinksProps) {
  const links = [
    { href: "/", label: "Home", icon: HomeIcon, visible: true },
    { href: "/cart", label: "Cart", icon: ShoppingCartIcon, visible: true },
    { href: "/admin", label: "Admin", icon: ShieldCheckIcon, visible: isAuthenticated && isAdmin },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ClipboardDocumentListIcon,
      visible: isAuthenticated,
    },
    { href: "/profile", label: "My Page", icon: UserIcon, visible: isAuthenticated },
  ]

  return links
    .filter(({ visible }) => visible)
    .map(({ href, label, icon: Icon }) => (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className="relative flex flex-none items-center gap-1.5 hover:text-pink-500"
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
        {href === "/cart" && itemCount > 0 && (
          <span className="absolute -top-2 -right-2 rounded-full bg-pink-500 px-1.5 py-0.5 text-xs text-white">
            {itemCount}
          </span>
        )}
      </Link>
    ))
}

export default function Navbar() {
  const { cart } = useCart()
  const { user, logout, isAdmin } = useAuth()
  const router = useRouter()
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [busy, setBusy] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true
    if (!user) {
      queueMicrotask(() => active && setAvatarUrl(""))
      return () => {
        active = false
      }
    }

    void getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        const photoURL = snapshot.data()?.photoURL
        if (active) setAvatarUrl(typeof photoURL === "string" ? photoURL : (user.photoURL ?? ""))
      })
      .catch(() => {
        if (active) setAvatarUrl(user.photoURL ?? "")
      })

    return () => {
      active = false
    }
  }, [user])

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return
    const validation = validateImageUpload(file)
    if (!validation.valid) {
      alert(validation.message)
      event.target.value = ""
      return
    }

    try {
      setBusy(true)
      const storageReference = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageReference, file, { contentType: file.type })
      const url = await getDownloadURL(storageReference)
      setAvatarUrl(url)
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: url, updatedAt: new Date().toISOString() },
        { merge: true }
      )
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: url })
    } catch (error: unknown) {
      alert(errorMessage(error, "Upload failed."))
    } finally {
      setBusy(false)
      event.target.value = ""
    }
  }

  const handleLogout = async () => {
    setMobileOpen(false)
    await logout()
    router.push("/")
  }

  return (
    <header className="w-full bg-white shadow-md">
      <div className="mx-auto flex max-w-screen-xl items-center gap-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          className="rounded p-2 hover:bg-pink-50 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
        <Link href="/" className="shrink-0 text-2xl font-bold text-pink-500">
          BabyShop
        </Link>

        <nav
          className="hidden min-w-0 flex-1 overflow-x-auto whitespace-nowrap md:block"
          aria-label="Main"
        >
          <div className="inline-flex items-center gap-6 text-gray-700">
            <NavigationLinks
              isAuthenticated={Boolean(user)}
              isAdmin={isAdmin}
              itemCount={itemCount}
            />
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-gray-700">
          {user ? (
            <>
              <span
                className="max-w-[140px] truncate text-sm text-pink-600 sm:max-w-[220px]"
                title={user.email ?? "User"}
              >
                {user.email ?? "User"}
              </span>
              <button
                type="button"
                onClick={() => !busy && fileRef.current?.click()}
                className="relative h-8 w-8 overflow-hidden rounded-full border border-neutral-200 focus:ring-2 focus:ring-pink-300"
                title={busy ? "Uploading…" : "Change avatar"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl || FALLBACK_AVATAR}
                  alt="Account avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_AVATAR
                  }}
                />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onPick}
              />
              <button onClick={() => void handleLogout()} className="text-sm hover:text-pink-500">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-pink-500">
                Login
              </Link>
              <Link href="/register" className="hover:text-pink-500">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu overlay"
        />
        <aside
          className={`absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Mobile menu"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold text-gray-800">Menu</h2>
            <button
              className="rounded p-2 hover:bg-pink-50"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 text-gray-800">
            <NavigationLinks
              isAuthenticated={Boolean(user)}
              isAdmin={isAdmin}
              itemCount={itemCount}
              onNavigate={() => setMobileOpen(false)}
            />
          </nav>
          <div className="border-t bg-pink-50 px-4 py-3">
            {user ? (
              <button
                onClick={() => void handleLogout()}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            ) : (
              <div className="flex justify-between">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-pink-600">
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-pink-600"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  )
}
