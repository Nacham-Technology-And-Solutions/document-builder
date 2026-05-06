import type { CSSProperties } from "react"

/** Default chrome when legacy elements omit overrides (matches historical export look). */
export const FLOATING_TEXT_DEFAULT_BG = "rgba(255, 255, 255, 0.95)"
export const FLOATING_TEXT_DEFAULT_BORDER_COLOR = "#e5e7eb"

function isTransparentToken(value: string | undefined): boolean {
  const v = (value ?? "").trim().toLowerCase()
  return v === "transparent"
}

function isUnsetOrTransparentBackground(value: string | undefined): boolean {
  if (value === undefined) return false
  const v = value.trim().toLowerCase()
  return v === "" || v === "transparent"
}

export interface FloatingTextChromeFields {
  textBackgroundColor?: string
  textBorderColor?: string
  textBorderWidthPx?: number
}

export type FloatingTextChromeInput = FloatingTextChromeFields

/** Inner box chrome for floating `text` (canvas React styles). */
export function floatingTextInnerStyle(el: { type: string } & FloatingTextChromeFields): CSSProperties {
  if (el.type !== "text") return {}
  const bgRaw = el.textBackgroundColor
  const bcRaw = el.textBorderColor
  const bwRaw = el.textBorderWidthPx

  const style: CSSProperties = {}

  if (bgRaw === undefined) {
    style.backgroundColor = FLOATING_TEXT_DEFAULT_BG
  } else if (isUnsetOrTransparentBackground(bgRaw)) {
    style.backgroundColor = "transparent"
  } else {
    style.backgroundColor = bgRaw.trim()
  }

  const width = bwRaw === undefined ? 1 : Math.max(0, Math.round(Number(bwRaw)))

  if (
    width === 0 ||
    (bcRaw !== undefined && isTransparentToken(bcRaw)) ||
    (bcRaw !== undefined && bcRaw.trim() === "")
  ) {
    style.border = "none"
  } else {
    style.borderWidth = width
    style.borderStyle = "solid"
    style.borderColor = bcRaw === undefined ? FLOATING_TEXT_DEFAULT_BORDER_COLOR : bcRaw.trim()
  }

  return style
}

/** Fragments for HTML `style` attributes. */
export function floatingTextChromeForExport(el: FloatingTextChromeInput): { backgroundColor: string; border: string } {
  const bgRaw = el.textBackgroundColor
  let backgroundColor: string
  if (bgRaw === undefined) backgroundColor = FLOATING_TEXT_DEFAULT_BG.replace(/\s+/g, " ")
  else if (isUnsetOrTransparentBackground(bgRaw)) backgroundColor = "transparent"
  else backgroundColor = bgRaw.trim()

  const bcRaw = el.textBorderColor
  const bwRaw = el.textBorderWidthPx
  const width = bwRaw === undefined ? 1 : Math.max(0, Math.round(Number(bwRaw)))

  let border: string
  if (
    width === 0 ||
    (bcRaw !== undefined && isTransparentToken(bcRaw)) ||
    (bcRaw !== undefined && bcRaw.trim() === "")
  ) {
    border = "none"
  } else {
    const color = bcRaw === undefined ? FLOATING_TEXT_DEFAULT_BORDER_COLOR : bcRaw.trim()
    border = `${width}px solid ${color}`
  }

  return { backgroundColor, border }
}
