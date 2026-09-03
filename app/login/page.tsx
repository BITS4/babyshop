"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"
import { errorMessage } from "@/lib/security/errors"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { login, loginWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await login(email, password)
      router.push("/")
    } catch (error: unknown) {
      setError(errorMessage(error, "Login failed"))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError("")
    try {
      await loginWithGoogle()
      router.push("/")
    } catch (error: unknown) {
      setError(errorMessage(error, "Google login failed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pink-50">
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-pink-600 hover:underline"
        >
          ← Back
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 rounded bg-white p-6 shadow-md">
          <h1 className="text-center text-2xl font-bold text-pink-600">Login</h1>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-pink-500 py-2 text-white hover:bg-pink-600 disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Log In"}
          </button>

          <div className="my-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full rounded border border-gray-300 bg-white py-2 hover:bg-gray-50 disabled:opacity-60"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-pink-500 underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
