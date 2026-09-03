"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { useRouter } from "next/navigation"
import { validateCredentials } from "@/lib/auth/credentials"
import { errorMessage } from "@/lib/security/errors"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState("")

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validation = validateCredentials({ email, password })
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Enter valid account details.")
      return
    }

    try {
      await register(email, password) // sends verification email in AuthContext
      setRegistered(true)
    } catch (error: unknown) {
      setError(errorMessage(error, "Registration failed."))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pink-50">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-pink-600 hover:underline"
        >
          ← Back
        </button>

        {registered ? (
          <div className="space-y-4 rounded bg-white p-6 text-center shadow-md">
            <h1 className="text-2xl font-bold text-pink-600">✅ Registration successful</h1>
            <p className="text-gray-700">
              We sent a verification link to <span className="font-semibold">{email}</span>.
              <br />
              Please open your Gmail inbox and verify your email.
            </p>
            <p className="text-sm text-gray-500">
              After verifying, you can{" "}
              <Link href="/login" className="text-pink-600 underline">
                log in here
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-4 rounded bg-white p-6 shadow-md">
            <h1 className="text-center text-2xl font-bold text-pink-600">Register</h1>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
            <input
              type="password"
              placeholder="Password (8+ chars, upper/lower/number)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />

            <button
              type="submit"
              className="w-full rounded bg-pink-500 py-2 text-white hover:bg-pink-600"
            >
              Register
            </button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-pink-500 underline">
                Log In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
