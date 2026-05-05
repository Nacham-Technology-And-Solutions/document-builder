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
  }
}

export interface InvoiceMetaGridBlock extends BaseFlowBlock {
  type: "invoice-meta-grid"
  props: {
    billToLabel: string
    payToLabel: string
    leftLines: string[]
    rightLines: string[]
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
  }
}

export interface TotalsBlock extends BaseFlowBlock {
  type: "totals-block"
  props: {
    taxLabel: string
    subtotalToken: string
    taxToken: string
    totalToken: string
  }
}

export interface FooterBlock extends BaseFlowBlock {
  type: "footer-block"
  props: {
    heading: string
    lines: string[]
  }
}

export type FlowBlock =
  | HeaderBannerBlock
  | InvoiceMetaGridBlock
  | DynamicTableBlock
  | TotalsBlock
  | FooterBlock

export type AnchorMode = "page" | "block"

export interface FloatingElement {
  id: string
  type: "image" | "text" | "pattern" | "stamp"
  anchorMode: AnchorMode
  anchorTargetId?: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
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
}

export interface PersistedTemplate {
  schemaVersion: 1
  savedAt: string
  builderState: BuilderState
}

