import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  back: vi.fn(),
  logout: vi.fn(),
  loadProfile: vi.fn(),
  saveProfile: vi.fn(),
  updateCurrentUserAvatar: vi.fn(),
  authState: {} as Record<string, unknown>,
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, back: mocks.back }),
}))
vi.mock("@/context/AuthContext", () => ({ useAuth: () => mocks.authState }))
vi.mock("@/lib/profile/profile-repository", () => ({
  loadProfile: mocks.loadProfile,
  saveProfile: mocks.saveProfile,
  updateCurrentUserAvatar: mocks.updateCurrentUserAvatar,
}))
vi.mock("@/lib/observability/client", () => ({ reportClientError: vi.fn() }))

import ProfilePage from "./page"

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.authState = {
      user: { uid: "user-1", email: "parent@example.com", photoURL: "" },
      logout: mocks.logout,
      isLoading: false,
      isVerified: true,
    }
    mocks.loadProfile.mockResolvedValue({
      name: "Parent",
      address: "12 Family Street",
      phone: "12345678",
      photoURL: "",
    })
    mocks.saveProfile.mockResolvedValue(undefined)
    mocks.updateCurrentUserAvatar.mockResolvedValue(undefined)
  })

  it("redirects an unauthenticated visitor", () => {
    mocks.authState = { user: null, logout: mocks.logout, isLoading: false, isVerified: false }
    render(<ProfilePage />)
    expect(mocks.replace).toHaveBeenCalledWith("/login")
  })

  it("loads persisted fields and saves validated changes", async () => {
    render(<ProfilePage />)
    expect(await screen.findByDisplayValue("Parent")).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Default shipping address"), {
      target: { value: "99 New Parent Avenue" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() =>
      expect(mocks.saveProfile).toHaveBeenCalledWith(
        "user-1",
        "parent@example.com",
        expect.objectContaining({ address: "99 New Parent Avenue" })
      )
    )
    expect(screen.getByRole("status")).toHaveTextContent("Profile saved")
  })

  it("selects a preset avatar and persists it", async () => {
    render(<ProfilePage />)
    await screen.findByDisplayValue("Parent")
    fireEvent.click(screen.getByRole("button", { name: "Choose avatar" }))
    fireEvent.click(screen.getByRole("button", { name: "Choose Mint Bear" }))
    await waitFor(() => expect(mocks.updateCurrentUserAvatar).toHaveBeenCalledOnce())
    expect(mocks.saveProfile).toHaveBeenCalledWith(
      "user-1",
      "parent@example.com",
      expect.objectContaining({ photoURL: expect.stringContaining("data:image/svg+xml") })
    )
  })
})
