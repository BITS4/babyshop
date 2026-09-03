"use client"

/* eslint-disable @next/next/no-img-element -- avatars are local SVG data URLs */

const svg = (body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'>${body}</svg>`)}`

export const AVATARS = [
  ["peach-bunny", "Peach Bunny", "#FFE4E6", "#FFD1D9"],
  ["mint-bear", "Mint Bear", "#D1FAE5", "#A7F3D0"],
  ["sky-kitty", "Sky Kitty", "#DBEAFE", "#BFDBFE"],
  ["sunny-chick", "Sunny Chick", "#FEF3C7", "#FDE68A"],
  ["lavender-fox", "Lavender Fox", "#EDE9FE", "#C4B5FD"],
  ["sea-panda", "Sea Panda", "#CCFBF1", "#99F6E4"],
  ["rose-bear", "Rose Bear", "#FFE4E6", "#FDA4AF"],
  ["lime-frog", "Lime Frog", "#ECFCCB", "#D9F99D"],
].map(([id, label, background, face]) => ({
  id,
  label,
  url: svg(
    `<rect width='80' height='80' rx='16' fill='${background}'/><circle cx='40' cy='41' r='20' fill='${face}'/><circle cx='33' cy='39' r='3' fill='#1F2937'/><circle cx='47' cy='39' r='3' fill='#1F2937'/><path d='M34 49 Q40 54 46 49' stroke='#1F2937' stroke-width='2' fill='none' stroke-linecap='round'/>`
  ),
}))

export const FALLBACK_AVATAR = svg(
  "<rect width='80' height='80' fill='#f3f4f6'/><circle cx='40' cy='29' r='14' fill='#d1d5db'/><rect x='18' y='48' width='44' height='18' rx='9' fill='#d1d5db'/>"
)

type AvatarPickerProps = {
  currentUrl: string
  open: boolean
  busy: boolean
  onToggle: () => void
  onChoose: (url: string) => void
  onRemove: () => void
}

export function AvatarPicker({
  currentUrl,
  open,
  busy,
  onToggle,
  onChoose,
  onRemove,
}: AvatarPickerProps) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <img
          src={currentUrl || FALLBACK_AVATAR}
          alt="User avatar"
          width={72}
          height={72}
          className="h-18 w-18 rounded-full border border-neutral-200 object-cover"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            {open ? "Close picker" : "Choose avatar"}
          </button>
          {currentUrl ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {open ? (
        <div aria-label="Avatar choices" className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {AVATARS.map((avatar) => (
            <button
              type="button"
              key={avatar.id}
              onClick={() => onChoose(avatar.url)}
              disabled={busy}
              aria-label={`Choose ${avatar.label}`}
              aria-pressed={currentUrl === avatar.url}
              className="rounded-xl border border-neutral-200 p-1"
            >
              <img src={avatar.url} alt="" className="h-14 w-14 rounded-lg" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
