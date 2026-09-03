import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  back: vi.fn(),
  addProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  auth: {} as Record<string, unknown>,
}))
const product = {
  id: 4,
  name: "Baby Hat",
  price: 9,
  description: "A warm hat",
  image: "/hat.jpg",
  category: "hats",
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, back: mocks.back }),
}))
vi.mock("@/context/AuthContext", () => ({ useAuth: () => mocks.auth }))
vi.mock("@/context/ProductContext", () => ({
  useProducts: () => ({
    products: [product],
    addProduct: mocks.addProduct,
    updateProduct: mocks.updateProduct,
    deleteProduct: mocks.deleteProduct,
  }),
}))
vi.mock("@/components/DriveImage", () => ({
  DriveImage: ({ alt }: { alt: string }) => <span>{alt}</span>,
}))

import AdminPage from "./page"

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth = { user: { uid: "admin" }, isLoading: false, isClaimsLoading: false, isAdmin: true }
    mocks.addProduct.mockResolvedValue(undefined)
    mocks.updateProduct.mockResolvedValue(undefined)
    mocks.deleteProduct.mockResolvedValue(undefined)
  })

  it("redirects signed-out and non-admin visitors", () => {
    mocks.auth = { user: null, isLoading: false, isClaimsLoading: false, isAdmin: false }
    const { unmount } = render(<AdminPage />)
    expect(mocks.replace).toHaveBeenCalledWith("/login")
    unmount()
    mocks.auth = { user: { uid: "user" }, isLoading: false, isClaimsLoading: false, isAdmin: false }
    render(<AdminPage />)
    expect(mocks.replace).toHaveBeenCalledWith("/")
  })

  it("adds a validated product", async () => {
    render(<AdminPage />)
    fireEvent.change(screen.getByLabelText("Product name"), { target: { value: "Baby Socks" } })
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "5.25" } })
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Very soft socks" } })
    fireEvent.change(screen.getByLabelText("Image URL"), {
      target: { value: "https://example.com/socks.jpg" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Add product" }))
    await waitFor(() =>
      expect(mocks.addProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Baby Socks", price: 5.25 })
      )
    )
  })

  it("loads and updates an existing product", async () => {
    render(<AdminPage />)
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))
    expect(screen.getByLabelText("Product name")).toHaveValue("Baby Hat")
    fireEvent.change(screen.getByLabelText("Product name"), { target: { value: "Winter Hat" } })
    fireEvent.click(screen.getByRole("button", { name: "Update product" }))
    await waitFor(() =>
      expect(mocks.updateProduct).toHaveBeenCalledWith(
        expect.objectContaining({ id: 4, name: "Winter Hat" })
      )
    )
  })

  it("requires confirmation before deletion", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true)
    render(<AdminPage />)
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    expect(mocks.deleteProduct).toHaveBeenCalledWith(4)
  })

  it("supports back navigation and canceling an edit", () => {
    render(<AdminPage />)
    fireEvent.click(screen.getByRole("button", { name: "← Back" }))
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(mocks.back).toHaveBeenCalledOnce()
    expect(screen.getByRole("button", { name: "Add product" })).toBeInTheDocument()
  })
})
