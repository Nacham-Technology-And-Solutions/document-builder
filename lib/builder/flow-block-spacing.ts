import type { DocumentSettings } from "@/lib/builder/types"

/** Matches the previous canvas `space-y-6` rhythm. */
export const DEFAULT_FLOW_BLOCK_SPACING_PX = 24

const MAX_SPACING_PX = 160

export function resolveFlowBlockSpacingPx(settings: Pick<DocumentSettings, "flowBlockSpacingPx">): number {
  const v = settings.flowBlockSpacingPx
  if (typeof v !== "number" || !Number.isFinite(v)) return DEFAULT_FLOW_BLOCK_SPACING_PX
  return Math.max(0, Math.min(MAX_SPACING_PX, Math.round(v)))
}
