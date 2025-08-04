// src/components/ProductCard.tsx
type Product = {
  id: number
  name: string
  price: string
  image: string
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded" />
      <h3 className="mt-2 font-semibold text-lg text-gray-800">{product.name}</h3>
      <p className="text-pink-600 font-bold">{product.price}</p>
      <button className="mt-3 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition">
        Add to Cart
      </button>
    </div>
  )
}
