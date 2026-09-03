import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AvatarPicker, AVATARS, FALLBACK_AVATAR } from "./AvatarPicker"

describe("AvatarPicker", () => {
  it("shows the fallback and delegates opening the preset list", () => {
    const onToggle = vi.fn()
    const { container } = render(
      <AvatarPicker
        currentUrl=""
        open={false}
        busy={false}
        onToggle={onToggle}
        onChoose={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    expect(container.querySelector("img")).toHaveAttribute("src", FALLBACK_AVATAR)
    fireEvent.click(screen.getByRole("button", { name: "Choose avatar" }))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it("selects and removes an avatar through callbacks", () => {
    const onChoose = vi.fn()
    const onRemove = vi.fn()
    render(
      <AvatarPicker
        currentUrl={AVATARS[0]!.url}
        open
        busy={false}
        onToggle={vi.fn()}
        onChoose={onChoose}
        onRemove={onRemove}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: `Choose ${AVATARS[1]!.label}` }))
    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(onChoose).toHaveBeenCalledWith(AVATARS[1]!.url)
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it("disables mutations while a save is active", () => {
    render(
      <AvatarPicker
        currentUrl="chosen"
        open
        busy
        onToggle={vi.fn()}
        onChoose={vi.fn()}
        onRemove={vi.fn()}
      />
    )
    expect(screen.getByRole("button", { name: "Close picker" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled()
  })
})
