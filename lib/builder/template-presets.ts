import { createDefaultBlock } from "@/lib/builder/default-template"
import { normalizeImportedFlowBlocks } from "@/lib/builder/dynamic-table-utils"
import { DEFAULT_FLOW_BLOCK_CORNER_STYLE } from "@/lib/builder/flow-block-corners"
import { DEFAULT_FLOW_BLOCK_SPACING_PX } from "@/lib/builder/flow-block-spacing"
import { createTotalsRowId } from "@/lib/builder/totals-block-utils"
import type { BuilderState, DocumentSettings } from "@/lib/builder/types"

const completeDocumentSettings = (
  partial: Omit<DocumentSettings, "flowBlockSpacingPx" | "flowBlockCornerStyle">,
): DocumentSettings => ({
  ...partial,
  flowBlockSpacingPx: DEFAULT_FLOW_BLOCK_SPACING_PX,
  flowBlockCornerStyle: DEFAULT_FLOW_BLOCK_CORNER_STYLE,
})

export type TemplateMenuCategory = "invoice-proforma" | "receipt" | "other" | "extra"
export type TemplateMenuStyle = "a" | "b"

export interface TemplateStyleOption {
  id: TemplateMenuStyle
  name: string
  description: string
}

export interface TemplateCategoryMeta {
  id: TemplateMenuCategory
  label: string
  styles: TemplateStyleOption[]
}

export const TEMPLATE_MENU_CATEGORIES: TemplateCategoryMeta[] = [
  {
    id: "invoice-proforma",
    label: "Invoice / Proforma",
    styles: [
      {
        id: "a",
        name: "Corporate slate",
        description: "Dark banner, structured meta grid and line items.",
      },
      {
        id: "b",
        name: "Emerald proforma",
        description: "Proforma wording with emerald accent and airy layout.",
      },
    ],
  },
  {
    id: "receipt",
    label: "Receipt",
    styles: [
      {
        id: "a",
        name: "Itemized",
        description: "Receipt header with SKU-style line columns.",
      },
      {
        id: "b",
        name: "Store slip",
        description: "Warm accent, concise columns and thank-you footer.",
      },
    ],
  },
  {
    id: "other",
    label: "Other",
    styles: [
      {
        id: "a",
        name: "Quotation",
        description: "Quote-style headings, terms-ready footer.",
      },
      {
        id: "b",
        name: "General letter",
        description: "Neutral letterhead blocks for mixed documents.",
      },
    ],
  },
  {
    id: "extra",
    label: "Extra",
    styles: [
      {
        id: "a",
        name: "Delivery note",
        description: "Ship-to / ship-from layout with packing line items.",
      },
      {
        id: "b",
        name: "Credit memo",
        description: "Credit memo banner, adjusted totals labels, cool ruby accent.",
      },
    ],
  },
]

const baseSelectionAndSnap = (): Pick<BuilderState, "selection" | "snapToGrid"> => ({
  selection: { kind: null, id: null },
  snapToGrid: true,
})

const presetInvoiceCorporate = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const table = createDefaultBlock("dynamic-table")
  const totals = createDefaultBlock("totals-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "Corporate Invoice Template",
      type: "invoice",
      primaryColor: "#334155",
      secondaryColor: "#f1f5f9",
      fontFamily: "Inter, sans-serif",
      baseFontSize: 14,
    }),
    flowBlocks: [header, meta, table, totals],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

const presetInvoiceEmeraldProforma = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const table = createDefaultBlock("dynamic-table")
  const totals = createDefaultBlock("totals-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "Proforma Template",
      type: "proforma",
      primaryColor: "#047857",
      secondaryColor: "#ecfdf5",
      fontFamily: "Inter, sans-serif",
      baseFontSize: 14,
    }),
    flowBlocks: [
      {
        ...header,
        props: {
          ...header.props,
          heading: "PROFORMA",
          backgroundColor: "#047857",
          textColor: "#ecfdf5",
          mutedTextColor: "#a7f3d0",
        },
      },
      {
        ...meta,
        props: {
          ...meta.props,
          labelColor: "#047857",
          textColor: "#14532d",
        },
      },
      {
        ...table,
        props: {
          ...table.props,
          headerBackgroundColor: "#d1fae5",
          headerTextColor: "#065f46",
          rowTextColor: "#166534",
          borderColor: "#bbf7d0",
        },
      },
      {
        ...totals,
        props: {
          ...totals.props,
          labelColor: "#047857",
          valueColor: "#14532d",
          accentColor: "#d1fae5",
        },
      },
    ],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

const presetReceiptItemized = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const table = createDefaultBlock("dynamic-table")
  const totals = createDefaultBlock("totals-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "Itemized Receipt",
      type: "receipt",
      primaryColor: "#1e293b",
      secondaryColor: "#f8fafc",
      fontFamily: "Inter, sans-serif",
      baseFontSize: 13,
    }),
    flowBlocks: [
      {
        ...header,
        props: {
          ...header.props,
          heading: "RECEIPT",
          leftLines: ["{{ store.name }}"],
          invoiceNumberToken: "{{ receipt.number }}",
          dateToken: "{{ receipt.date }}",
          backgroundColor: "#1e293b",
          mutedTextColor: "#94a3b8",
          headingFontSize: 26,
        },
      },
      {
        ...meta,
        props: {
          ...meta.props,
          billToLabel: "Customer",
          payToLabel: "Merchant",
          leftLines: ["{{ customer.name }}", "{{ receipt.channel }}"],
          rightLines: ["{{ store.name }}", "{{ store.location }}"],
        },
      },
      {
        ...table,
        props: {
          ...table.props,
          repeaterKey: "receipt.items",
          itemAlias: "line",
          columns: [
            { key: "description", label: "Item", align: "left" },
            { key: "sku", label: "SKU", align: "center" },
            { key: "quantity", label: "Qty", align: "center" },
            { key: "amount", label: "Amount", align: "right" },
          ],
        },
      },
      {
        ...totals,
        props: {
          ...totals.props,
          rows: [
            { id: createTotalsRowId(), label: "Subtotal", value: "{{ receipt.subtotal }}", variant: "line" },
            { id: createTotalsRowId(), label: "Tax", value: "{{ receipt.tax }}", variant: "line" },
            { id: createTotalsRowId(), label: "Total", value: "{{ receipt.total }}", variant: "grand-total" },
          ],
        },
      },
    ],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

const presetReceiptStore = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const table = createDefaultBlock("dynamic-table")
  const footer = createDefaultBlock("footer-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "Store Receipt",
      type: "receipt",
      primaryColor: "#c2410c",
      secondaryColor: "#fff7ed",
      fontFamily: "system-ui, sans-serif",
      baseFontSize: 13,
    }),
    flowBlocks: [
      {
        ...header,
        props: {
          ...header.props,
          heading: "PAYMENT RECEIVED",
          backgroundColor: "#ea580c",
          textColor: "#fffbeb",
          mutedTextColor: "#fed7aa",
          invoiceNumberToken: "{{ receipt.number }}",
          dateToken: "{{ receipt.date }}",
        },
      },
      {
        ...meta,
        props: {
          ...meta.props,
          billToLabel: "Paid by",
          payToLabel: "Received by",
          leftLines: ["{{ customer.name }}"],
          rightLines: ["{{ cashier.name }}", "{{ store.name }}"],
          labelColor: "#9a3412",
          textColor: "#431407",
        },
      },
      {
        ...table,
        props: {
          ...table.props,
          repeaterKey: "receipt.lines",
          itemAlias: "row",
          columns: [
            { key: "label", label: "Description", align: "left" },
            { key: "amount", label: "Amount", align: "right" },
          ],
          headerBackgroundColor: "#ffedd5",
          headerTextColor: "#9a3412",
          rowTextColor: "#431407",
          borderColor: "#fdba74",
        },
      },
      {
        ...footer,
        props: {
          ...footer.props,
          heading: "Thank you",
          lines: ["{{ receipt.footer_message }}"],
          headingColor: "#c2410c",
          textColor: "#78350f",
        },
      },
    ],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

const presetOtherQuotation = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const table = createDefaultBlock("dynamic-table")
  const totals = createDefaultBlock("totals-block")
  const footer = createDefaultBlock("footer-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "Quotation Template",
      type: "invoice",
      primaryColor: "#3730a3",
      secondaryColor: "#eef2ff",
      fontFamily: "Inter, sans-serif",
      baseFontSize: 14,
    }),
    flowBlocks: [
      {
        ...header,
        props: {
          ...header.props,
          heading: "QUOTATION",
          leftLines: ["{{ company.name }}"],
          invoiceNumberToken: "{{ quote.number }}",
          dateToken: "{{ quote.date }}",
          backgroundColor: "#3730a3",
          mutedTextColor: "#c7d2fe",
          headingFontSize: 26,
        },
      },
      {
        ...meta,
        props: {
          ...meta.props,
          billToLabel: "Prepared for",
          payToLabel: "Prepared by",
          leftLines: ["{{ client.name }}", "{{ client.contact }}"],
          rightLines: ["{{ company.name }}", "{{ salesperson.name }}"],
          labelColor: "#4338ca",
          textColor: "#312e81",
        },
      },
      {
        ...table,
        props: {
          ...table.props,
          repeaterKey: "quote.lines",
          itemAlias: "line",
          columns: [
            { key: "service", label: "Service / item", align: "left" },
            { key: "quantity", label: "Qty", align: "center" },
            { key: "unit_price", label: "Unit price", align: "right" },
            { key: "line_total", label: "Line total", align: "right" },
          ],
          headerBackgroundColor: "#e0e7ff",
          headerTextColor: "#4338ca",
          rowTextColor: "#312e81",
          borderColor: "#c7d2fe",
        },
      },
      {
        ...totals,
        props: {
          ...totals.props,
          rows: [
            { id: createTotalsRowId(), label: "Subtotal", value: "{{ quote.subtotal }}", variant: "line" },
            { id: createTotalsRowId(), label: "Estimated tax", value: "{{ quote.tax }}", variant: "line" },
            { id: createTotalsRowId(), label: "Total", value: "{{ quote.total }}", variant: "grand-total" },
          ],
        },
      },
      {
        ...footer,
        props: {
          ...footer.props,
          heading: "Terms & validity",
          lines: ["Valid until {{ quote.valid_until }}.", "{{ quote.terms }}"],
          headingColor: "#3730a3",
          textColor: "#4c51bf",
        },
      },
    ],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

const presetOtherGeneral = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const footer = createDefaultBlock("footer-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "General Document Template",
      type: "invoice",
      primaryColor: "#44403c",
      secondaryColor: "#fafaf9",
      fontFamily: "Georgia, serif",
      baseFontSize: 14,
    }),
    flowBlocks: [
      {
        ...header,
        props: {
          ...header.props,
          heading: "DOCUMENT",
          backgroundColor: "#fafaf9",
          textColor: "#292524",
          mutedTextColor: "#78716c",
          headingFontSize: 22,
        },
      },
      {
        ...meta,
        props: {
          ...meta.props,
          billToLabel: "To",
          payToLabel: "From",
          leftLines: ["{{ recipient.name }}", "{{ recipient.address }}"],
          rightLines: ["{{ sender.name }}", "{{ sender.contact }}"],
          labelColor: "#78716c",
          textColor: "#44403c",
        },
      },
      {
        ...footer,
        props: {
          ...footer.props,
          heading: "Body summary",
          lines: ["{{ document.summary }}", "{{ document.reference }}"],
          headingColor: "#292524",
          textColor: "#57534e",
        },
      },
    ],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

const presetExtraDelivery = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const table = createDefaultBlock("dynamic-table")
  const footer = createDefaultBlock("footer-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "Delivery Note Template",
      type: "invoice",
      primaryColor: "#0f766e",
      secondaryColor: "#f0fdfa",
      fontFamily: "Inter, sans-serif",
      baseFontSize: 14,
    }),
    flowBlocks: [
      {
        ...header,
        props: {
          ...header.props,
          heading: "DELIVERY NOTE",
          leftLines: ["{{ carrier.name }}"],
          invoiceNumberToken: "{{ shipment.number }}",
          dateToken: "{{ shipment.date }}",
          backgroundColor: "#0f766e",
          textColor: "#f0fdfa",
          mutedTextColor: "#99f6e4",
          headingFontSize: 24,
        },
      },
      {
        ...meta,
        props: {
          ...meta.props,
          billToLabel: "Ship to",
          payToLabel: "Ship from",
          leftLines: ["{{ shipment.recipient }}", "{{ shipment.address }}", "{{ shipment.phone }}"],
          rightLines: ["{{ warehouse.name }}", "{{ warehouse.address }}"],
          labelColor: "#0f766e",
          textColor: "#134e4a",
        },
      },
      {
        ...table,
        props: {
          ...table.props,
          repeaterKey: "shipment.items",
          itemAlias: "row",
          columns: [
            { key: "sku", label: "SKU", align: "left" },
            { key: "description", label: "Description", align: "left" },
            { key: "quantity", label: "Qty", align: "center" },
            { key: "unit", label: "Unit", align: "center" },
          ],
          headerBackgroundColor: "#ccfbf1",
          headerTextColor: "#0f766e",
          rowTextColor: "#115e59",
          borderColor: "#99f6e4",
        },
      },
      {
        ...footer,
        props: {
          ...footer.props,
          heading: "Shipment notes",
          lines: ["{{ shipment.instructions }}", "Signature: {{ shipment.signature }}"],
          headingColor: "#0f766e",
          textColor: "#475569",
        },
      },
    ],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

const presetExtraCreditMemo = (): BuilderState => {
  const header = createDefaultBlock("header-banner")
  const meta = createDefaultBlock("invoice-meta-grid")
  const table = createDefaultBlock("dynamic-table")
  const totals = createDefaultBlock("totals-block")
  const footer = createDefaultBlock("footer-block")

  return {
    documentSettings: completeDocumentSettings({
      title: "Credit Memo Template",
      type: "invoice",
      primaryColor: "#be123c",
      secondaryColor: "#fff1f2",
      fontFamily: "Inter, sans-serif",
      baseFontSize: 14,
    }),
    flowBlocks: [
      {
        ...header,
        props: {
          ...header.props,
          heading: "CREDIT MEMO",
          leftLines: ["{{ company.name }}"],
          invoiceNumberToken: "{{ credit.memo_number }}",
          dateToken: "{{ credit.date }}",
          backgroundColor: "#be123c",
          textColor: "#fff1f2",
          mutedTextColor: "#fecdd3",
          headingFontSize: 26,
        },
      },
      {
        ...meta,
        props: {
          ...meta.props,
          billToLabel: "Credited customer",
          payToLabel: "Issued by",
          leftLines: ["{{ customer.name }}", "{{ customer.reference }}"],
          rightLines: ["{{ company.name }}", "{{ company.support_email }}"],
          labelColor: "#be123c",
          textColor: "#881337",
        },
      },
      {
        ...table,
        props: {
          ...table.props,
          repeaterKey: "credit.lines",
          itemAlias: "line",
          columns: [
            { key: "description", label: "Reason / item", align: "left" },
            { key: "original_invoice", label: "Ref. invoice", align: "center" },
            { key: "amount", label: "Credit amount", align: "right" },
          ],
          headerBackgroundColor: "#ffe4e6",
          headerTextColor: "#9f1239",
          rowTextColor: "#831843",
          borderColor: "#fda4af",
        },
      },
      {
        ...totals,
        props: {
          ...totals.props,
          rows: [
            { id: createTotalsRowId(), label: "Subtotal", value: "{{ credit.subtotal }}", variant: "line" },
            { id: createTotalsRowId(), label: "Adjusted tax", value: "{{ credit.tax_adjustment }}", variant: "line" },
            { id: createTotalsRowId(), label: "Total credit", value: "{{ credit.total_credit }}", variant: "grand-total" },
          ],
          labelColor: "#be123c",
          valueColor: "#881337",
          accentColor: "#ffe4e6",
        },
      },
      {
        ...footer,
        props: {
          ...footer.props,
          heading: "Resolution",
          lines: ["{{ credit.reason }}", "Original document: {{ credit.original_document }}"],
          headingColor: "#9f1239",
          textColor: "#6b21a8",
        },
      },
    ],
    floatingElements: [],
    ...baseSelectionAndSnap(),
  }
}

export function getPresetBuilderState(category: TemplateMenuCategory, style: TemplateMenuStyle): BuilderState {
  const raw =
    category === "invoice-proforma"
      ? style === "a"
        ? presetInvoiceCorporate()
        : presetInvoiceEmeraldProforma()
      : category === "receipt"
        ? style === "a"
          ? presetReceiptItemized()
          : presetReceiptStore()
        : category === "other"
          ? style === "a"
            ? presetOtherQuotation()
            : presetOtherGeneral()
          : style === "a"
            ? presetExtraDelivery()
            : presetExtraCreditMemo()
  return { ...raw, flowBlocks: normalizeImportedFlowBlocks(raw.flowBlocks) }
}
