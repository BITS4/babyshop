"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../../context/AuthContext"
import { useRouter } from "next/navigation"

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

    if (!email.endsWith("@gmail.com")) {
      setError("Only Gmail addresses are allowed.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    try {
      await register(email, password) // sends verification email in AuthContext
      setRegistered(true)
    } catch (err: any) {
      setError(err.message || "Registration failed.")
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-pink-600 hover:underline flex items-center"
        >
          ← Back
        </button>

        {registered ? (
          <div className="bg-white p-6 rounded shadow-md space-y-4 text-center">
            <h1 className="text-2xl font-bold text-pink-600">✅ Registration successful</h1>
            <p className="text-gray-700">
              We sent a verification link to <span className="font-semibold">{email}</span>.
              <br />Please open your Gmail inbox and verify your email.
            </p>
            <p className="text-sm text-gray-500">
              After verifying, you can{" "}
              <Link href="/login" className="underline text-pink-600">
                log in here
              </Link>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full space-y-4">
            <h1 className="text-2xl font-bold text-pink-600 text-center">Register</h1>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <input
              type="email"
              placeholder="Email (Gmail only)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />

            <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
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
