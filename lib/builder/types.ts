export type DocumentType = "invoice" | "receipt" | "proforma"

/** Sharp vs rounded chrome on flow blocks (canvas + HTML export `.card`). */
export type FlowBlockCornerStyle = "rounded" | "square"

export interface DocumentSettings {
  title: string
  type: DocumentType
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  baseFontSize: number
  /** Vertical gap between flow blocks on canvas and in HTML export (px) */
  flowBlockSpacingPx: number
  flowBlockCornerStyle: FlowBlockCornerStyle
}

export type FlowBlockType =
  | "header-banner"
  | "invoice-meta-grid"
  | "dynamic-table"
  | "totals-block"
  | "heading-block"
  | "text-box"
  | "footer-block"
  | "custom-html"

export type FlowBlockWidthMode = "full" | "half"

/** Half-width strips: column sits on left or right */
export type FlowBlockBoxAlign = "left" | "right"

export type FlowBlockTextAlign = "left" | "center" | "right"

export interface FlowSectionLayoutMixin {
  layoutWidth: FlowBlockWidthMode
  boxAlign: FlowBlockBoxAlign
  textAlign: FlowBlockTextAlign
}

interface BaseFlowBlock {
  id: string
  type: FlowBlockType
  /** Space below this block (px); omit → document spacing between blocks */
  spacingAfterPx?: number
  /** Omit → document `flowBlockCornerStyle` */
  cornerStyle?: FlowBlockCornerStyle
}

export interface HeaderBannerBlock extends BaseFlowBlock {
  type: "header-banner"
  props: {
    heading: string
    /** Lines under the title — tokens or static text */
    leftLines?: string[]
    /** @deprecated — use `leftLines`; still honored when leftLines omitted (older templates) */
    companyNameToken?: string
    /** Printed before invoice number token, e.g. "Invoice #" or "Ref:" */
    invoiceNumberLabel?: string
    invoiceNumberToken: string
    /** Optional prefix before date token on its own row, e.g. "Date: " */
    datePrefix?: string
    dateToken: string
    /** When non-empty, each line renders as a `<p>` and replaces invoice/date pairing */
    rightLines?: string[]
    backgroundColor: string
    textColor: string
    mutedTextColor: string
    headingFontSize: number
    /** CSS font-weight (100–900), default bold */
    headingFontWeight?: number
    subtitleFontSize?: number
    rightColumnFontSize?: number
    paddingX?: number
    paddingY?: number
    columnGap?: number
    /** Visual swap of primary vs secondary column */
    swapColumns?: boolean
    /** Row flex alignment */
    bannerJustify?: "between" | "center"
    leftTextAlign?: "left" | "center" | "right"
    rightTextAlign?: "left" | "center" | "right"
  }
}

export interface InvoiceMetaGridBlock extends BaseFlowBlock {
  type: "invoice-meta-grid"
  props: {
    billToLabel: string
    payToLabel: string
    leftLines: string[]
    rightLines: string[]
    labelColor: string
    textColor: string
  }
}

export interface DynamicTableBlock extends BaseFlowBlock {
  type: "dynamic-table"
  props: {
    repeaterKey: string
    itemAlias: string
    columns: Array<{
      key: string
      label: string
      align: "left" | "center" | "right"
    }>
    headerBackgroundColor: string
    headerTextColor: string
    rowTextColor: string
    borderColor: string
    fontSize: number
  }
}

export type TotalsRowVariant = "line" | "grand-total"

export interface TotalsRow {
  id: string
  label: string
  value: string
  /** Grand total style: top border + bold (any row can use it, any order). */
  variant: TotalsRowVariant
}

export interface TotalsBlock extends BaseFlowBlock {
  type: "totals-block"
  props: {
    rows: TotalsRow[]
    labelColor: string
    valueColor: string
    accentColor: string
  }
}

export interface HeadingBlock extends BaseFlowBlock {
  type: "heading-block"
  props: FlowSectionLayoutMixin & {
    /** Markdown-lite (**bold**, *italic*); tokens `{{ }}` safe */
    heading: string
    fontSize: number
    fontWeight: number
    color: string
    /** When set (non-whitespace), fills the heading box; otherwise canvas keeps default tinted surface */
    backgroundColor?: string
    /** Minimum inner height in px (floored to 15 when set); vertically centers text when above natural height */
    boxHeightPx?: number
  }
}

export interface TextBoxBlock extends BaseFlowBlock {
  type: "text-box"
  props: FlowSectionLayoutMixin & {
    /** Markdown-lite; one paragraph per line */
    body: string
    fontSize: number
    color: string
    lineHeight: number
  }
}

export interface FooterBlock extends BaseFlowBlock {
  type: "footer-block"
  props: {
    heading: string
    lines: string[]
    headingColor: string
    textColor: string
  }
}

export interface CustomHtmlBlock extends BaseFlowBlock {
  type: "custom-html"
  props: {
    label: string
    html: string
    css: string
  }
}

export type FlowBlock =
  | HeaderBannerBlock
  | InvoiceMetaGridBlock
  | DynamicTableBlock
  | TotalsBlock
  | HeadingBlock
  | TextBoxBlock
  | FooterBlock
  | CustomHtmlBlock

export type AnchorMode = "page" | "block"

export type FloatingElementType = "image" | "text" | "pattern" | "stamp"

export interface FloatingElement {
  id: string
  type: FloatingElementType
  anchorMode: AnchorMode
  anchorTargetId?: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  content?: string
  src?: string
  fit?: "contain" | "cover"
  locked?: boolean
  rotation?: number
  /** Floating `text` only: box fill; omit for default white tint; `transparent` or empty clears fill */
  textBackgroundColor?: string
  /** Floating `text` only: border color; `transparent` or blank hides the stroke (when width allows) */
  textBorderColor?: string
  /** Floating `text` only: border width in px; `0` removes border; omit defaults to 1px when border is shown */
  textBorderWidthPx?: number
}

export interface BuilderSelection {
  kind: "flow" | "floating" | null
  id: string | null
}

export interface BuilderState {
  documentSettings: DocumentSettings
  flowBlocks: FlowBlock[]
  floatingElements: FloatingElement[]
  selection: BuilderSelection
  snapToGrid: boolean
}

export interface PersistedTemplate {
  schemaVersion: 1
  savedAt: string
  builderState: BuilderState
}

