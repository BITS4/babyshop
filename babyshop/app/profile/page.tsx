"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/app/firebase"

export default function ProfilePage() {
  const { user, logout, isLoading, isVerified } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [savedMsg, setSavedMsg] = useState("")

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Load profile from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        if (snap.exists()) {
          const data = snap.data()
          setName(data.name || "")
          setAddress(data.address || "")
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      }
    }
    loadProfile()
  }, [user?.uid])

  // Save profile to Firestore
  const handleSave = async () => {
    console.log("[Profile] handleSave clicked. uid=", user?.uid, "email=", user?.email)
    if (!user?.uid) {
      alert("Not logged in — no UID. Try reloading and logging in again.")
      return
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name: name.trim(), address: address.trim(), email: user.email },
        { merge: true }
      )
      console.log("[Profile] setDoc OK")
      setSavedMsg("✅ Profile saved to Firestore")
      setTimeout(() => setSavedMsg(""), 1500)
    } catch (err) {
      console.error("[Profile] setDoc ERROR:", err)
      alert("Save failed. Check console for details.")
    }
  }


  if (isLoading || !user) return null

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 flex justify-center items-center">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-pink-600 hover:underline flex items-center"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 w-full text-center space-y-6">
          <Image
            src="/images/avatar-placeholder.png"
            alt="User Avatar"
            width={80}
            height={80}
            className="mx-auto rounded-full border border-gray-300"
          />
          <h1 className="text-2xl font-bold text-pink-600">👤 User Profile</h1>

          <div className="text-left space-y-3">
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-xs text-gray-600">
              Status: {isVerified ? "✅ Verified" : "❌ Not Verified"}
            </p>

            <label className="block text-sm font-semibold">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., John Kim"
              className="w-full border px-3 py-2 rounded"
            />

            <label className="block text-sm font-semibold mt-2">Default Shipping Address</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="City, district, street, building..."
              className="w-full border px-3 py-2 rounded"
              rows={3}
            />

            {savedMsg && <p className="text-xs text-center text-green-600">{savedMsg}</p>}

            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition"
            >
              Save Profile
            </button>
          </div>

          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
