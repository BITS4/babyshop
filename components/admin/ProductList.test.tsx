import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProductList } from "./ProductList"

vi.mock("@/components/DriveImage", () => ({
  DriveImage: ({ alt }: { alt: string }) => <span>{alt}</span>,
}))

const product = {
  id: 4,
  name: "Baby Hat",
  price: 9,
  description: "A warm hat",
  image: "/hat.jpg",
  category: "hats",
}

describe("ProductList", () => {
  it("renders an explicit empty state", () => {
    render(<ProductList products={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText("No products yet.")).toBeInTheDocument()
  })

  it("delegates edits and honors deletion cancellation", () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    vi.spyOn(window, "confirm").mockReturnValue(false)
    render(<ProductList products={[product]} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    expect(onEdit).toHaveBeenCalledWith(product)
    expect(onDelete).not.toHaveBeenCalled()
  })
})
