export type DocumentType = "invoice" | "receipt" | "proforma"

export interface DocumentSettings {
  title: string
  type: DocumentType
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  baseFontSize: number
}

export type FlowBlockType =
  | "header-banner"
  | "invoice-meta-grid"
  | "dynamic-table"
  | "totals-block"
  | "footer-block"
  | "custom-html"

interface BaseFlowBlock {
  id: string
  type: FlowBlockType
}

export interface HeaderBannerBlock extends BaseFlowBlock {
  type: "header-banner"
  props: {
    heading: string
    companyNameToken: string
    invoiceNumberToken: string
    dateToken: string
    backgroundColor: string
    textColor: string
    mutedTextColor: string
    headingFontSize: number
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

export interface TotalsBlock extends BaseFlowBlock {
  type: "totals-block"
  props: {
    taxLabel: string
    subtotalToken: string
    taxToken: string
    totalToken: string
    labelColor: string
    valueColor: string
    accentColor: string
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

