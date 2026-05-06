import type { DocumentSettings, FlowBlockCornerStyle } from "@/lib/builder/types"

export const DEFAULT_FLOW_BLOCK_CORNER_STYLE: FlowBlockCornerStyle = "rounded"

export function resolveFlowBlockCornerStyle(
  ds: Pick<DocumentSettings, "flowBlockCornerStyle">,
): FlowBlockCornerStyle {
  return ds.flowBlockCornerStyle === "square" ? "square" : "rounded"
}

/** Tailwind rounding for flow-block outer surfaces (matches `rounded-md` / `rounded-none`). */
export function flowBlockRadiusTwClass(cornerStyle: FlowBlockCornerStyle): string {
  return cornerStyle === "square" ? "rounded-none" : "rounded-md"
}

/** Border radius in px for export CSS (historical `.card` used 6px). */
export function flowBlockCardRadiusPx(cornerStyle: FlowBlockCornerStyle): number {
  return cornerStyle === "square" ? 0 : 6
}
