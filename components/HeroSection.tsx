// src/components/HeroSection.tsx
export default function HeroSection() {
  return (
    <section className="bg-pink-100 px-4 py-20 text-center">
      <h2 className="mb-4 text-4xl font-extrabold text-pink-600">
        Adorable Clothes for Your Little Ones
      </h2>
      <p className="mx-auto mb-6 max-w-xl text-gray-700">
        Discover the cutest collection of baby apparel — soft, stylish, and made with love.
      </p>
      <button className="rounded-full bg-pink-500 px-6 py-3 text-lg text-white transition hover:bg-pink-600">
        Shop Now
      </button>
    </section>
  )
}
