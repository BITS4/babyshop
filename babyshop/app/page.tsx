import Navbar from "@/components/Navbar"
import HeroSection from "../components/HeroSection"
import ProductCard from "../components/ProductCard"
import CartPreview from "../components/CartPreview"

const products = [
  {
    id: 1,
    name: "Fluffy Onesie",
    price: "$29.99",
    image: "/images/onesie.jpeg"
  },
  {
    id: 2,
    name: "Tiny Socks Pack",
    price: "$9.99",
    image: "/images/socks.jpeg"
  },
  {
    id: 3,
    name: "Mini Hoodie",
    price: "$34.99",
    image: "/images/hoodie.jpeg"
  },
  {
    id: 4,
    name: "Cute Pajamas",
    price: "$24.99",
    image: "/images/pajamas.jpeg"
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Navbar />
      <HeroSection />
      <section className="py-10 px-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Cart display */}
      <CartPreview />
    </main>
  )
}

