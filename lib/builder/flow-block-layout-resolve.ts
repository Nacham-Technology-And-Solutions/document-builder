import type { DocumentSettings, FlowBlock, FlowBlockCornerStyle } from "@/lib/builder/types"
import { resolveFlowBlockCornerStyle } from "@/lib/builder/flow-block-corners"
import { resolveFlowBlockSpacingPx } from "@/lib/builder/flow-block-spacing"

/** Vertical gap after `block` when another block follows (respects override). */
export function resolveFlowBlockSpacingAfterPx(block: FlowBlock, documentSettings: DocumentSettings): number {
  const o = block.spacingAfterPx
  if (typeof o === "number" && Number.isFinite(o)) {
    return Math.max(0, Math.min(160, Math.round(o)))
  }
  return resolveFlowBlockSpacingPx(documentSettings)
}

/** Effective corner shape for `block`. */
export function resolveFlowBlockCornersForBlock(block: FlowBlock, documentSettings: DocumentSettings): FlowBlockCornerStyle {
  if (block.cornerStyle === "square" || block.cornerStyle === "rounded") return block.cornerStyle
  return resolveFlowBlockCornerStyle(documentSettings)
}
