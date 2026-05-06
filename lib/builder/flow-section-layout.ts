import type { CSSProperties } from "react"

export type FlowBlockWidthMode = "full" | "half"
/** When width is half, whether the strip sits on the left or right of the page column */
export type FlowBlockBoxAlign = "left" | "right"
export type FlowBlockTextAlign = "left" | "center" | "right"

/** Wraps constrained-width flow content (heading / text strip). */
export function layoutStripOuterProps(boxAlign: FlowBlockBoxAlign, layoutWidth: FlowBlockWidthMode): CSSProperties {
  return {
    display: "flex",
    width: "100%",
    justifyContent: layoutWidth === "half" && boxAlign === "right" ? "flex-end" : "flex-start",
  }
}

/** Bordered content box: full width stretches; half hugs content up to half the row (like totals). */
export function layoutStripCardProps(layoutWidth: FlowBlockWidthMode, textAlign: FlowBlockTextAlign): CSSProperties {
  if (layoutWidth === "full") {
    return {
      width: "100%",
      maxWidth: "100%",
      textAlign,
      boxSizing: "border-box",
      minWidth: 0,
    }
  }
  return {
    width: "fit-content",
    maxWidth: "50%",
    textAlign,
    boxSizing: "border-box",
    minWidth: 0,
  }
}

/** Rules for `.card` `style=""` on heading/text blocks (minus extra heading-only styles). */
export function layoutStripCardStyleRules(layoutWidth: FlowBlockWidthMode, textAlign: FlowBlockTextAlign): string {
  if (layoutWidth === "full") {
    return `width:100%;max-width:100%;text-align:${textAlign};box-sizing:border-box`
  }
  return `width:fit-content;max-width:50%;text-align:${textAlign};box-sizing:border-box`
}

export function layoutStripCardHtmlAttrs(layoutWidth: FlowBlockWidthMode, textAlign: FlowBlockTextAlign): string {
  return `style="${layoutStripCardStyleRules(layoutWidth, textAlign)}"`
}

export function layoutStripOuterHtmlAttrs(boxAlign: FlowBlockBoxAlign, layoutWidth: FlowBlockWidthMode): string {
  const jc = layoutWidth === "half" && boxAlign === "right" ? "flex-end" : "flex-start"
  return `style="display:flex;width:100%;justify-content:${jc};"`
}
