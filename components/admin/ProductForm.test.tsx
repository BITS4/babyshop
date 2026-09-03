import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProductForm } from "./ProductForm"

describe("ProductForm", () => {
  it("validates and submits a new product", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ProductForm onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("Product name"), { target: { value: "Baby Hat" } })
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "12.50" } })
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "A warm hat" } })
    fireEvent.change(screen.getByLabelText("Image URL"), {
      target: { value: "https://example.com/hat.jpg" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Add product" }))
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Baby Hat", price: 12.5 }),
        undefined
      )
    )
    expect(screen.getByLabelText("Product name")).toHaveValue("")
  })

  it("preserves the product ID during an edit", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const product = {
      id: 4,
      name: "Old Hat",
      price: 9,
      description: "Warm hat",
      image: "/hat.jpg",
      category: "hats",
    }
    render(<ProductForm product={product} onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("Product name"), { target: { value: "New Hat" } })
    fireEvent.click(screen.getByRole("button", { name: "Update product" }))
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: "New Hat" }), 4)
    )
  })

  it("rejects an invalid upload without calling the save handler", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => undefined)
    const onSave = vi.fn()
    render(<ProductForm onSave={onSave} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText("Upload image file"), {
      target: { files: [new File(["x"], "x.txt", { type: "text/plain" })] },
    })
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(expect.stringMatching(/JPEG, PNG, or WebP/))
    )
    expect(screen.getByRole("status")).toHaveTextContent("Image rejected")
    expect(onSave).not.toHaveBeenCalled()
  })

  it("shows validation errors and supports edit cancellation", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => undefined)
    const onCancel = vi.fn()
    const product = {
      id: 4,
      name: "Old Hat",
      price: 9,
      description: "Warm hat",
      image: "/hat.jpg",
      category: "hats",
    }
    const { unmount } = render(<ProductForm onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole("button", { name: "Add product" }))
    expect(alert).toHaveBeenCalled()
    unmount()
    render(<ProductForm product={product} onSave={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
