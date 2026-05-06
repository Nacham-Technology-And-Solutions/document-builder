import type { HeaderBannerBlock } from "@/lib/builder/types"

export type BannerJustifyMode = "between" | "center"

export type BannerTextAlign = "left" | "center" | "right"

/** Left column subtitle lines — prefers `leftLines`, falls back to legacy `companyNameToken`. */
export function resolveHeaderBannerLeftLines(props: HeaderBannerBlock["props"]): string[] {
  if (props.leftLines !== undefined) {
    const cleaned = props.leftLines.map((l) => l.trim()).filter((l) => l.length > 0)
    if (cleaned.length > 0) return cleaned
    return []
  }
  const legacy = props.companyNameToken?.trim()
  if (legacy) return [legacy]
  return ["{{ company.name }}"]
}

/**
 * Right column: `rightLines` when non-empty replaces the invoice-line + date pattern entirely.
 */
export function resolveHeaderBannerRightLines(props: HeaderBannerBlock["props"]): string[] {
  const free = props.rightLines?.filter((l) => l.trim().length > 0) ?? []
  if (free.length > 0) return free

  const invLabel = (props.invoiceNumberLabel ?? "Invoice #").trim()
  const invToken = (props.invoiceNumberToken ?? "").trim()
  let line1 = ""
  if (invLabel.length > 0 && invToken.length > 0) line1 = `${invLabel} ${invToken}`
  else line1 = invLabel.length > 0 ? invLabel : invToken

  const dpTrim = (props.datePrefix ?? "").trim()
  const dateTok = (props.dateToken ?? "").trim()
  let line2 = ""
  if (dateTok.length > 0) {
    line2 = dpTrim.length > 0 ? (dpTrim.endsWith(" ") ? dpTrim + dateTok : `${dpTrim} ${dateTok}`) : dateTok
  } else if (dpTrim.length > 0) {
    line2 = dpTrim
  }

  const out: string[] = []
  if (line1.length > 0) out.push(line1)
  if (line2.length > 0) out.push(line2)
  return out
}

export function resolveBannerJustify(props: HeaderBannerBlock["props"]): BannerJustifyMode {
  return props.bannerJustify ?? "between"
}

export function resolveSubtitleFontSize(props: HeaderBannerBlock["props"], fallbackDocSize: number): number {
  if (typeof props.subtitleFontSize === "number" && props.subtitleFontSize > 0) return props.subtitleFontSize
  return Math.max(11, fallbackDocSize - 1)
}

export function resolveRightColumnFontSize(props: HeaderBannerBlock["props"], fallbackDocSize: number): number {
  if (typeof props.rightColumnFontSize === "number" && props.rightColumnFontSize > 0) return props.rightColumnFontSize
  return resolveSubtitleFontSize(props, fallbackDocSize)
}

export function resolveHeadingWeight(props: HeaderBannerBlock["props"]): number {
  if (typeof props.headingFontWeight === "number" && props.headingFontWeight >= 100) return props.headingFontWeight
  return 700
}
