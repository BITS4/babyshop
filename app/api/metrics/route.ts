import { renderMetrics } from "@/lib/observability/metrics"

export const dynamic = "force-dynamic"

export function GET() {
  return new Response(renderMetrics(), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    },
  })
}
