"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function ProfilePage() {
  const { user, logout, isLoading, changePassword } = useAuth()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState("")
  const [showChange, setShowChange] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading])

  if (isLoading || !user) return null

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <Image
          src="/images/avatar-placeholder.png"
          alt="User Avatar"
          width={80}
          height={80}
          className="mx-auto rounded-full border border-gray-300"
        />
        <h1 className="text-2xl font-bold text-pink-600">👤 User Profile</h1>
        <p className="text-lg text-gray-800"><strong>Email:</strong> {user}</p>

        {showChange ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              if (newPassword.length < 4) {
                alert("❌ Password must be at least 4 characters.")
                return
              }
              changePassword(newPassword)
              alert("✅ Password changed successfully!")
              setShowChange(false)
              setNewPassword("")
            }}
            className="space-y-3"
          >
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full px-3 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Save New Password
            </button>
          </form>
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => setShowChange(true)}
          >
            Change Password
          </button>
        )}

        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
