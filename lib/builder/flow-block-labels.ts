import type { FlowBlock } from "@/lib/builder/types"

const FLOW_BLOCK_LABELS: Record<FlowBlock["type"], string> = {
  "custom-html": "Custom HTML",
  "dynamic-table": "Dynamic table",
  "footer-block": "Footer",
  "header-banner": "Header banner",
  "heading-block": "Heading",
  "invoice-meta-grid": "Meta grid",
  "text-box": "Text box",
  "totals-block": "Totals",
}

export function flowBlockInspectorLabel(type: FlowBlock["type"]): string {
  return FLOW_BLOCK_LABELS[type] ?? type
}
