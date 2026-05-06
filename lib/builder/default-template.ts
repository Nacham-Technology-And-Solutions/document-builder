import { createDefaultTotalsRows } from "@/lib/builder/totals-block-utils"
import type { BuilderState, FloatingElement, FloatingElementType, FlowBlock, FlowBlockType } from "@/lib/builder/types"

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
          leftLines: ["{{ company.name }}"],
          invoiceNumberLabel: "Invoice #",
          invoiceNumberToken: "{{ invoice.number }}",
          datePrefix: "",
          dateToken: "{{ invoice.date }}",
          backgroundColor: "#334155",
          textColor: "#ffffff",
          mutedTextColor: "#cbd5e1",
          headingFontSize: 28,
          headingFontWeight: 700,
          subtitleFontSize: 14,
          rightColumnFontSize: 14,
          paddingX: 24,
          paddingY: 24,
          columnGap: 12,
          swapColumns: false,
          bannerJustify: "between",
          leftTextAlign: "left",
          rightTextAlign: "right",
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
          labelColor: "#64748b",
          textColor: "#334155",
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
          headerBackgroundColor: "#f1f5f9",
          headerTextColor: "#64748b",
          rowTextColor: "#334155",
          borderColor: "#e5e7eb",
          fontSize: 14,
        },
      }
    case "totals-block":
      return {
        id: buildId(),
        type: "totals-block",
        props: {
          rows: createDefaultTotalsRows(),
          labelColor: "#64748b",
          valueColor: "#334155",
          accentColor: "#e2e8f0",
        },
      }
    case "heading-block":
      return {
        id: buildId(),
        type: "heading-block",
        props: {
          heading: "**Section heading**",
          fontSize: 20,
          fontWeight: 600,
          color: "#0f172a",
          layoutWidth: "full",
          boxAlign: "left",
          textAlign: "left",
        },
      }
    case "text-box":
      return {
        id: buildId(),
        type: "text-box",
        props: {
          body: "{{ document.intro }}\nSupporting line with *italic* or **bold**.",
          fontSize: 14,
          color: "#334155",
          lineHeight: 1.45,
          layoutWidth: "full",
          boxAlign: "left",
          textAlign: "left",
        },
      }
    case "footer-block":
      return {
        id: buildId(),
        type: "footer-block",
        props: {
          heading: "Notes",
          lines: ["{{ invoice.notes }}"],
          headingColor: "#334155",
          textColor: "#64748b",
        },
      }
    case "custom-html":
      return {
        id: buildId(),
        type: "custom-html",
        props: {
          label: "Custom HTML Block",
          html: "<div><strong>Custom content</strong></div>",
          css: "div { color: #334155; font-size: 14px; }",
        },
      }
  }
}

export const createDefaultFloatingElement = (type: FloatingElementType): FloatingElement => {
  switch (type) {
    case "image":
      return {
        id: buildId(),
        type: "image",
        anchorMode: "page",
        x: 420,
        y: 24,
        width: 120,
        height: 56,
        zIndex: 20,
        content: "Logo",
        fit: "contain",
        locked: false,
        rotation: 0,
      }
    case "text":
      return {
        id: buildId(),
        type: "text",
        anchorMode: "page",
        x: 32,
        y: 760,
        width: 260,
        height: 72,
        zIndex: 30,
        content: "{{ company.phone }} | {{ company.email }}",
        locked: false,
        rotation: 0,
      }
    case "pattern":
      return {
        id: buildId(),
        type: "pattern",
        anchorMode: "page",
        x: -24,
        y: -24,
        width: 240,
        height: 160,
        zIndex: 0,
        locked: false,
        rotation: 0,
      }
    case "stamp":
      return {
        id: buildId(),
        type: "stamp",
        anchorMode: "page",
        x: 440,
        y: 96,
        width: 88,
        height: 88,
        zIndex: 25,
        content: "PAID",
        locked: false,
        rotation: -15,
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
    flowBlockSpacingPx: 24,
    flowBlockCornerStyle: "rounded",
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
  snapToGrid: true,
}

