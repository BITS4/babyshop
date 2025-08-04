"use client"
import { useState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registered, setRegistered] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // mock "register"
    setRegistered(true)
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      {registered ? (
        <p className="text-green-600 font-bold text-xl text-center">
          ✅ Registration successful! <br /> <Link href="/login" className="underline">Log in now</Link>
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-pink-600 text-center">Register</h1>
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
  )
}
