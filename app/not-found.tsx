import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-50 p-8 text-center">
      <h1 className="mb-4 text-5xl font-bold text-pink-600">404</h1>
      <p className="mb-6 text-xl text-gray-700">Oops! This page doesn’t exist.</p>
      <Link href="/" className="text-pink-500 underline">
        Back to Home
      </Link>
    </div>
  )
}
