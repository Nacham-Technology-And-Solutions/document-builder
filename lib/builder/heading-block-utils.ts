/** Applied when `boxHeightPx` is set: CSS min-height never goes below this value. */
export const HEADING_BOX_MIN_HEIGHT_PX = 15

/** Resolved min-height for the heading card, or `undefined` when height is auto */
export function resolveHeadingBoxMinHeightPx(boxHeightPx: number | undefined): number | undefined {
  if (typeof boxHeightPx !== "number" || !(boxHeightPx > 0)) return undefined
  return Math.max(HEADING_BOX_MIN_HEIGHT_PX, Math.round(boxHeightPx))
}
