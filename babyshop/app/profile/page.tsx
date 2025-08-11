"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"

export default function ProfilePage() {
  const { user, logout, isLoading, isVerified } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading])

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

        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center space-y-6">
          <Image
            src="/images/avatar-placeholder.png"
            alt="User Avatar"
            width={80}
            height={80}
            className="mx-auto rounded-full border border-gray-300"
          />
          <h1 className="text-2xl font-bold text-pink-600">👤 User Profile</h1>
          <p className="text-lg text-gray-800"><strong>Email:</strong> {user.email}</p>
          <p className="text-sm text-gray-600">
            Status: {isVerified ? "✅ Verified" : "❌ Not Verified"}
          </p>

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
