import { DriveImage } from "@/components/DriveImage"
import type { Product } from "@/lib/catalog/product"

type ProductListProps = {
  products: readonly Product[]
  onEdit: (product: Product) => void
  onDelete: (id: number) => Promise<void>
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (!products.length) return <p className="text-center text-gray-500">No products yet.</p>
  return (
    <section
      aria-label="Product list"
      className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
    >
      {products.map((product) => (
        <article key={product.id} className="relative rounded bg-white p-4 text-center shadow">
          <span className="absolute top-2 left-2 rounded-full bg-pink-100 px-2 text-xs text-pink-700">
            {product.category}
          </span>
          <div className="mx-auto h-40 w-40 overflow-hidden rounded bg-gray-50">
            <DriveImage
              url={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
          <p className="text-sm text-gray-500">{product.description}</p>
          <p className="font-bold text-pink-600">${product.price.toFixed(2)}</p>
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="mr-4 text-sm text-blue-600 underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete ${product.name}?`)) void onDelete(product.id)
            }}
            className="text-sm text-red-600 underline"
          >
            Delete
          </button>
        </article>
      ))}
    </section>
  )
}
