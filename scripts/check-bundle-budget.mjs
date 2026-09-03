import { readdir, stat } from "node:fs/promises"
import path from "node:path"

const outputDirectory = path.join(process.cwd(), ".next", "static")
const totalBudget = 4 * 1024 * 1024
const assetBudget = 900 * 1024

async function filesWithin(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) => {
        const location = path.join(directory, entry.name)
        return entry.isDirectory() ? filesWithin(location) : [location]
      })
    )
  ).flat()
}

const files = await filesWithin(outputDirectory)
const assets = await Promise.all(
  files.map(async (file) => ({
    file: path.relative(process.cwd(), file),
    bytes: (await stat(file)).size,
  }))
)
const total = assets.reduce((sum, asset) => sum + asset.bytes, 0)
const oversized = assets.filter((asset) => asset.bytes > assetBudget)

process.stdout.write(
  `Static bundle: ${(total / 1024).toFixed(1)} KiB across ${assets.length} assets\n`
)
if (total > totalBudget || oversized.length) {
  const details = oversized
    .map((asset) => `${asset.file} (${(asset.bytes / 1024).toFixed(1)} KiB)`)
    .join(", ")
  throw new Error(`Bundle budget exceeded${details ? `: ${details}` : ""}`)
}
