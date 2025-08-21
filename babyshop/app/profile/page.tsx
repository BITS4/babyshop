"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, ChangeEvent } from "react"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db, auth, storage } from "@/app/firebase"
import { updateProfile } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export default function ProfilePage() {
  const { user, logout, isLoading, isVerified } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [savedMsg, setSavedMsg] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [busy, setBusy] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

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
          if (data?.phone) setPhone(String(data.phone).replace(/\D/g, ""))
          else setPhone("")
          setAvatarUrl(data?.photoURL || user.photoURL || "")
        } else {
          setAvatarUrl(user.photoURL || "")
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      }
    }
    loadProfile()
  }, [user?.uid])

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
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          address: address.trim(),
          phone: digits,
          email: user.email,
          photoURL: avatarUrl || "",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
      setSavedMsg("Profile saved ✅")
      setTimeout(() => setSavedMsg(""), 1600)
    } catch (err) {
      console.error("[Profile] setDoc ERROR:", err)
      alert("Save failed. Check console for details.")
    }
  }

  const openFilePicker = () => fileInputRef.current?.click()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url })
      }
      setSavedMsg("Avatar updated ✅")
      setTimeout(() => setSavedMsg(""), 1600)
    } catch (err: any) {
      console.error("Avatar upload error:", err)
      alert(err?.message || "Upload failed.")
    } finally {
      setBusy(false)
      e.target.value = ""
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.uid) return
    if (!confirm("Remove your avatar?")) return
    try {
      setBusy(true)
      const storageRef = ref(storage, `avatars/${user.uid}`)
      try {
        await deleteObject(storageRef)
      } catch (_) {}
      await setDoc(doc(db, "users", user.uid), { photoURL: "", updatedAt: new Date().toISOString() }, { merge: true })
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: "" })
      }
      setAvatarUrl("")
      setSavedMsg("Avatar removed ✅")
      setTimeout(() => setSavedMsg(""), 1600)
    } catch (err: any) {
      console.error("Avatar remove error:", err)
      alert(err?.message || "Remove failed.")
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
              <div className="relative">
                <img
                  src={avatarUrl || "/images/avatar-placeholder.png"}
                  alt="User Avatar"
                  width={72}
                  height={72}
                  className="h-18 w-18 rounded-full border border-neutral-200 object-cover"
                />
                <button
                  onClick={openFilePicker}
                  disabled={busy}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-pink-500 text-white text-lg leading-none flex items-center justify-center shadow hover:bg-pink-600 active:scale-95 transition"
                  aria-label="Upload your photo"
                  title="Upload your photo"
                >
                  +
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
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
                    onClick={openFilePicker}
                    disabled={busy}
                    className="rounded-lg border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50 active:scale-95 transition"
                  >
                    Change
                  </button>
                  {avatarUrl ? (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={busy}
                      className="rounded-lg border border-red-300 text-red-700 px-3 py-1 text-sm hover:bg-red-50 active:scale-95 transition"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-xl bg-red-500 px-4 py-2 text-white shadow hover:bg-red-600 active:scale-[.98] transition"
            >
              Logout
            </button>
          </div>

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
