"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db, auth } from "@/app/firebase"
import { updateProfile } from "firebase/auth"

// ------- Cute avatar presets (SVG -> data URL) -------
const svg = (body: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>${body}</svg>`
  )

const AVATARS = [
  {
    id: "peach-bunny",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#FFE4E6'/>
      <circle cx='40' cy='42' r='18' fill='#FFD1D9'/>
      <ellipse cx='32' cy='20' rx='6' ry='10' fill='#FFD1D9'/>
      <ellipse cx='48' cy='20' rx='6' ry='10' fill='#FFD1D9'/>
      <circle cx='34' cy='42' r='3' fill='#773344'/>
      <circle cx='46' cy='42' r='3' fill='#773344'/>
      <path d='M34 50 Q40 56 46 50' stroke='#773344' stroke-width='2' fill='none' stroke-linecap='round'/>
    `),
    label: "Peach Bunny",
  },
  {
    id: "mint-bear",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#D1FAE5'/>
      <circle cx='40' cy='40' r='20' fill='#A7F3D0'/>
      <circle cx='28' cy='26' r='6' fill='#A7F3D0'/>
      <circle cx='52' cy='26' r='6' fill='#A7F3D0'/>
      <circle cx='34' cy='40' r='3' fill='#1F2937'/>
      <circle cx='46' cy='40' r='3' fill='#1F2937'/>
      <circle cx='40' cy='46' r='3' fill='#F472B6'/>
    `),
    label: "Mint Bear",
  },
  {
    id: "sky-kitty",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#DBEAFE'/>
      <rect x='22' y='28' width='36' height='26' rx='12' fill='#BFDBFE'/>
      <polygon points='28,28 22,24 22,34' fill='#BFDBFE'/>
      <polygon points='52,28 58,24 58,34' fill='#BFDBFE'/>
      <circle cx='34' cy='40' r='3' fill='#1F2937'/>
      <circle cx='46' cy='40' r='3' fill='#1F2937'/>
      <path d='M34 48 Q40 52 46 48' stroke='#1F2937' stroke-width='2' fill='none' stroke-linecap='round'/>
    `),
    label: "Sky Kitty",
  },
  {
    id: "sunny-chick",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#FEF3C7'/>
      <circle cx='40' cy='40' r='18' fill='#FDE68A'/>
      <circle cx='34' cy='38' r='3' fill='#1F2937'/>
      <circle cx='46' cy='38' r='3' fill='#1F2937'/>
      <polygon points='40,42 36,46 44,46' fill='#F59E0B'/>
    `),
    label: "Sunny Chick",
  },
  {
    id: "lav-fox",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#EDE9FE'/>
      <path d='M24 48 Q40 28 56 48 Q48 56 32 56 Z' fill='#C4B5FD'/>
      <circle cx='34' cy='44' r='2.5' fill='#111827'/>
      <circle cx='46' cy='44' r='2.5' fill='#111827'/>
      <path d='M36 50 Q40 52 44 50' stroke='#111827' stroke-width='2' fill='none' stroke-linecap='round'/>
    `),
    label: "Lavender Fox",
  },
  {
    id: "sea-panda",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#CCFBF1'/>
      <circle cx='40' cy='42' r='16' fill='white'/>
      <circle cx='32' cy='38' r='4' fill='#0F172A'/>
      <circle cx='48' cy='38' r='4' fill='#0F172A'/>
      <circle cx='36' cy='42' r='2' fill='#0F172A'/>
      <circle cx='44' cy='42' r='2' fill='#0F172A'/>
      <rect x='34' y='48' width='12' height='3' rx='1.5' fill='#0F172A'/>
    `),
    label: "Sea Panda",
  },
  {
    id: "rose-bear",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#FFE4E6'/>
      <circle cx='40' cy='40' r='19' fill='#FDA4AF'/>
      <circle cx='30' cy='28' r='6' fill='#FDA4AF'/>
      <circle cx='50' cy='28' r='6' fill='#FDA4AF'/>
      <circle cx='35' cy='40' r='3' fill='#331B3F'/>
      <circle cx='45' cy='40' r='3' fill='#331B3F'/>
      <path d='M34 48 Q40 52 46 48' stroke='#331B3F' stroke-width='2' fill='none' stroke-linecap='round'/>
    `),
    label: "Rose Bear",
  },
  {
    id: "lime-frog",
    url: svg(`
      <rect width='100%' height='100%' rx='16' fill='#ECFCCB'/>
      <circle cx='40' cy='42' r='18' fill='#D9F99D'/>
      <circle cx='32' cy='32' r='5' fill='#D9F99D'/>
      <circle cx='48' cy='32' r='5' fill='#D9F99D'/>
      <circle cx='32' cy='32' r='2' fill='#111827'/>
      <circle cx='48' cy='32' r='2' fill='#111827'/>
      <path d='M34 48 Q40 50 46 48' stroke='#111827' stroke-width='2' fill='none' stroke-linecap='round'/>
    `),
    label: "Lime Frog",
  },
]

// fallback if none selected
const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>
       <rect width='100%' height='100%' fill='#f3f4f6'/>
       <circle cx='40' cy='30' r='14' fill='#d1d5db'/>
       <rect x='18' y='48' width='44' height='18' rx='9' fill='#d1d5db'/>
     </svg>`
  )

export default function ProfilePage() {
  const { user, logout, isLoading, isVerified } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("") // digits only
  const [savedMsg, setSavedMsg] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        if (snap.exists()) {
          const data = snap.data() as { name?: string; address?: string; phone?: string; photoURL?: string }
          setName(data?.name || "")
          setAddress(data?.address || "")
          setPhone(data?.phone ? String(data.phone).replace(/\D/g, "") : "")
          setAvatarUrl(data?.photoURL || user.photoURL || "")
        } else {
          setAvatarUrl(user.photoURL || "")
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      }
    }
    loadProfile()
  }, [user?.uid, user?.photoURL])

  const saveProfileCore = async (partial: Record<string, any>) => {
    if (!user?.uid) return
    await setDoc(
      doc(db, "users", user.uid),
      { ...partial, email: user.email, updatedAt: new Date().toISOString() },
      { merge: true }
    )
  }

  const handleSave = async () => {
    if (!user?.uid) {
      alert("Not logged in — no UID. Try reloading and logging in again.")
      return
    }
    const digits = phone.replace(/\D/g, "")
    if (digits && (digits.length < 8 || digits.length > 15)) {
      alert("Phone must be 8–15 digits (numbers only).")
      return
    }
    try {
      await saveProfileCore({
        name: name.trim(),
        address: address.trim(),
        phone: digits,
        photoURL: avatarUrl || "",
      })
      setSavedMsg("Profile saved ✅")
      setTimeout(() => setSavedMsg(""), 1600)
    } catch (err) {
      console.error("[Profile] setDoc ERROR:", err)
      alert("Save failed. Check console for details.")
    }
  }

  const chooseAvatar = async (url: string) => {
    if (!user?.uid) return
    try {
      setBusy(true)
      setAvatarUrl(url)
      await saveProfileCore({ photoURL: url })
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url })
      }
      setPickerOpen(false)
      setSavedMsg("Avatar updated ✅")
      setTimeout(() => setSavedMsg(""), 1600)
    } catch (e) {
      alert("Could not update avatar.")
    } finally {
      setBusy(false)
    }
  }

  const removeAvatar = async () => {
    if (!user?.uid) return
    if (!confirm("Remove your avatar?")) return
    try {
      setBusy(true)
      setAvatarUrl("")
      await saveProfileCore({ photoURL: "" })
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: "" })
      }
      setSavedMsg("Avatar removed ✅")
      setTimeout(() => setSavedMsg(""), 1600)
    } catch (e) {
      alert("Could not remove avatar.")
    } finally {
      setBusy(false)
    }
  }

  if (isLoading || !user) return null

  return (
    <div className="min-h-screen bg-pink-50">
      <header className="mx-auto max-w-3xl px-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-pink-600 hover:text-pink-700 transition"
        >
          ← Back
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex flex-col items-center gap-3 border-b border-neutral-200 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar (no upload, pick from presets) */}
              <div className="relative">
                <img
                  src={avatarUrl || FALLBACK_AVATAR}
                  alt="User Avatar"
                  width={72}
                  height={72}
                  className="h-18 w-18 rounded-full border border-neutral-200 object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-neutral-900">User Profile</h1>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="text-neutral-600">{user?.email}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isVerified ? "Verified" : "Not verified"}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setPickerOpen(v => !v)}
                    disabled={busy}
                    className="rounded-lg border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50 active:scale-95 transition"
                  >
                    {pickerOpen ? "Close Picker" : "Choose Avatar"}
                  </button>
                  {avatarUrl ? (
                    <button
                      onClick={removeAvatar}
                      disabled={busy}
                      className="rounded-lg border border-red-300 text-red-700 px-3 py-1 text-sm hover:bg-red-50 active:scale-95 transition"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                {savedMsg && (
                  <p className="mt-2 text-sm text-green-700">{savedMsg}</p>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-xl bg-red-500 px-4 py-2 text-white shadow hover:bg-red-600 active:scale-[.98] transition"
            >
              Logout
            </button>
          </div>

          {/* Avatar picker */}
          {pickerOpen && (
            <div className="px-6 pb-2">
              <h3 className="mt-4 mb-2 text-sm font-semibold tracking-wide text-neutral-600 uppercase">
                Pick your character
              </h3>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {AVATARS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => chooseAvatar(a.url)}
                    disabled={busy}
                    className={`relative rounded-xl p-1 border ${
                      avatarUrl === a.url ? "border-pink-500 ring-2 ring-pink-300" : "border-neutral-200"
                    } hover:shadow-sm active:scale-95 transition`}
                    title={a.label}
                    aria-label={`Choose ${a.label}`}
                  >
                    <img
                      src={a.url}
                      alt={a.label}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    {avatarUrl === a.url && (
                      <span className="absolute -top-2 -right-2 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-8 px-6 py-8 sm:grid-cols-5">
            <section className="sm:col-span-2">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
                Account
              </h2>

              <div className="space-y-3 rounded-xl border border-neutral-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Email</span>
                  <span className="text-sm font-medium text-neutral-900 truncate max-w-[60%] text-right">
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Password</span>
                  <span className="text-sm font-medium text-neutral-900">*****</span>
                </div>
              </div>
            </section>

            <section className="sm:col-span-3">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
                Profile details
              </h2>

              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <label className="block text-sm font-medium text-neutral-800">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Kim"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />

                <label className="mt-4 block text-sm font-medium text-neutral-800">
                  Default Shipping Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, district, street, building…"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />

                <label className="mt-4 block text-sm font-medium text-neutral-800">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Numbers only (8–15 digits)"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  We store digits only (no spaces or symbols).
                </p>
                {savedMsg && (
                  <p className="mt-3 text-sm text-green-700">{savedMsg}</p>
                )}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={busy}
                    className="inline-flex items-center justify-center rounded-xl bg-pink-500 px-4 py-2 text-white shadow hover:bg-pink-600 active:scale-[.98] transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
