export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 text-center p-8">
      <h1 className="text-5xl font-bold text-pink-600 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Oops! This page doesn’t exist.</p>
      <a href="/" className="text-pink-500 underline">Back to Home</a>
    </div>
  )
}
