"use client"

import { AvatarPicker } from "@/components/profile/AvatarPicker"
import { useAuth } from "@/context/AuthContext"
import { reportClientError } from "@/lib/observability/client"
import { loadProfile, saveProfile, updateCurrentUserAvatar } from "@/lib/profile/profile-repository"
import { validateProfile } from "@/lib/profile/profile"
import { errorMessage } from "@/lib/security/errors"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { user, logout, isLoading, isVerified } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [isLoading, router, user])

  useEffect(() => {
    if (!user?.uid) return
    void loadProfile(user.uid, user.photoURL ?? "")
      .then((profile) => {
        setName(profile.name)
        setAddress(profile.address)
        setPhone(profile.phone)
        setAvatarUrl(profile.photoURL)
      })
      .catch((error: unknown) => reportClientError(error, { operation: "load_profile" }))
  }, [user])

  const persistAvatar = async (photoURL: string) => {
    if (!user) return
    setBusy(true)
    try {
      await saveProfile(user.uid, user.email, { photoURL })
      await updateCurrentUserAvatar(photoURL)
      setAvatarUrl(photoURL)
      setPickerOpen(false)
      setMessage(photoURL ? "Avatar updated" : "Avatar removed")
    } catch (error: unknown) {
      reportClientError(error, { operation: "save_avatar" })
      alert(errorMessage(error, "Could not update avatar."))
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    const result = validateProfile({ name, address, phone, photoURL: avatarUrl })
    if (!result.success) {
      alert(result.error.issues[0]?.message ?? "Check your profile details.")
      return
    }
    setBusy(true)
    try {
      await saveProfile(user.uid, user.email, result.data)
      setMessage("Profile saved")
    } catch (error: unknown) {
      reportClientError(error, { operation: "save_profile" })
      alert(errorMessage(error, "Save failed."))
    } finally {
      setBusy(false)
    }
  }

  if (isLoading || !user) return null

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-8 text-neutral-900">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <button type="button" onClick={() => router.back()} className="mb-5 text-sm text-pink-600">
          ← Back
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-sm text-neutral-600">{user.email}</p>
            <p className={isVerified ? "text-sm text-green-700" : "text-sm text-red-700"}>
              {isVerified ? "Verified" : "Not verified"}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl bg-red-500 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>

        <div className="py-6">
          <AvatarPicker
            currentUrl={avatarUrl}
            open={pickerOpen}
            busy={busy}
            onToggle={() => setPickerOpen((open) => !open)}
            onChoose={(url) => void persistAvatar(url)}
            onRemove={() => {
              if (confirm("Remove your avatar?")) void persistAvatar("")
            }}
          />
        </div>

        <div className="grid gap-4">
          <label className="text-sm font-medium">
            Full name
            <input
              aria-label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 block w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Default shipping address
            <textarea
              aria-label="Default shipping address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium">
            Phone number
            <input
              aria-label="Phone number"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
              className="mt-1 block w-full rounded-lg border px-3 py-2"
            />
          </label>
          {message ? (
            <p role="status" className="text-sm text-green-700">
              {message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={busy}
            className="w-fit rounded-xl bg-pink-500 px-4 py-2 text-white disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </section>
    </main>
  )
}
