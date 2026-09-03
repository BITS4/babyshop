// src/components/HeroSection.tsx
export default function HeroSection() {
  return (
    <section className="bg-pink-100 text-center py-20 px-4">
      <h2 className="text-4xl font-extrabold text-pink-600 mb-4">
        Adorable Clothes for Your Little Ones
      </h2>
      <p className="text-gray-700 mb-6 max-w-xl mx-auto">
        Discover the cutest collection of baby apparel — soft, stylish, and made with love.
      </p>
      <button className="bg-pink-500 text-white px-6 py-3 rounded-full text-lg hover:bg-pink-600 transition">
        Shop Now
      </button>
    </section>
  )
}
