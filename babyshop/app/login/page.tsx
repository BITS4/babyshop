"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(email, password)
    if (success) {
      router.push("/")
    } else {
      setError("Invalid email or password")
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

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-4">
          <h1 className="text-2xl font-bold text-pink-600 text-center">Login</h1>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
            Log In
          </button>
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-pink-500 underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
