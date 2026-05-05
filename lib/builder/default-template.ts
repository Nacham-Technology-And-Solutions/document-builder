import type { BuilderState, FlowBlock, FlowBlockType } from "@/lib/builder/types"

const buildId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const createDefaultBlock = (type: FlowBlockType): FlowBlock => {
  switch (type) {
    case "header-banner":
      return {
        id: buildId(),
        type: "header-banner",
        props: {
          heading: "INVOICE",
          companyNameToken: "{{ company.name }}",
          invoiceNumberToken: "{{ invoice.number }}",
          dateToken: "{{ invoice.date }}",
        },
      }
    case "invoice-meta-grid":
      return {
        id: buildId(),
        type: "invoice-meta-grid",
        props: {
          billToLabel: "Bill To",
          payToLabel: "Pay To",
          leftLines: ["{{ client.name }}", "{{ client.address }}", "{{ client.email }}"],
          rightLines: ["{{ company.name }}", "{{ company.address }}", "{{ company.bank }}"],
        },
      }
    case "dynamic-table":
      return {
        id: buildId(),
        type: "dynamic-table",
        props: {
          repeaterKey: "invoice.items",
          itemAlias: "item",
          columns: [
            { key: "description", label: "Description", align: "left" },
            { key: "quantity", label: "Qty", align: "center" },
            { key: "rate", label: "Rate", align: "right" },
            { key: "amount", label: "Amount", align: "right" },
          ],
        },
      }
    case "totals-block":
      return {
        id: buildId(),
        type: "totals-block",
        props: {
          taxLabel: "Tax (10%)",
          subtotalToken: "{{ invoice.subtotal }}",
          taxToken: "{{ invoice.tax }}",
          totalToken: "{{ invoice.total }}",
        },
      }
    case "footer-block":
      return {
        id: buildId(),
        type: "footer-block",
        props: {
          heading: "Notes",
          lines: ["{{ invoice.notes }}"],
        },
      }
  }
}

export const initialBuilderState: BuilderState = {
  documentSettings: {
    title: "Untitled Invoice Template",
    type: "invoice",
    primaryColor: "#334155",
    secondaryColor: "#f1f5f9",
    fontFamily: "Inter, sans-serif",
    baseFontSize: 14,
  },
  flowBlocks: [
    createDefaultBlock("header-banner"),
    createDefaultBlock("invoice-meta-grid"),
    createDefaultBlock("dynamic-table"),
    createDefaultBlock("totals-block"),
  ],
  floatingElements: [],
  selection: {
    kind: "flow",
    id: null,
  },
}

