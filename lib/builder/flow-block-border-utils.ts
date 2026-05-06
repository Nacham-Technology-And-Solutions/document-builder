import type { CSSProperties } from "react"

import type { FlowBlockBorderMixin } from "@/lib/builder/types"

export const DEFAULT_FLOW_BLOCK_BORDER_COLOR = "#e5e7eb"
const DEFAULT_WIDTH_PX = 1
const MAX_WIDTH_PX = 16

export type ResolveFlowBlockBorderOptions = {
  /** Used when `props.borderColor` is empty and border is solid */
  borderColorFallback?: string
}

/** Full CSS `border` value for `style={{ border }}` or HTML `border:…` */
export function resolveFlowBlockBorderCss(
  props: Partial<FlowBlockBorderMixin> | undefined,
  options?: ResolveFlowBlockBorderOptions,
): string {
  const mode = props?.borderMode ?? "solid"
  const color =
    props?.borderColor?.trim() || options?.borderColorFallback || DEFAULT_FLOW_BLOCK_BORDER_COLOR
  const wRaw = props?.borderWidthPx
  const w =
    mode === "none"
      ? 0
      : typeof wRaw === "number" && Number.isFinite(wRaw) && wRaw >= 0
        ? Math.min(MAX_WIDTH_PX, Math.round(wRaw))
        : DEFAULT_WIDTH_PX
  if (w === 0) return "none"
  return `${w}px solid ${color}`
}

export function flowBlockBorderStyle(
  props: Partial<FlowBlockBorderMixin> | undefined,
  options?: ResolveFlowBlockBorderOptions,
): Pick<CSSProperties, "border"> {
  return { border: resolveFlowBlockBorderCss(props, options) }
}
