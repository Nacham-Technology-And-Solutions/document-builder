import type { FlowBlock, TotalsBlock, TotalsRow } from "@/lib/builder/types"

/** Legacy persisted shape before uniform `rows`. */
interface LegacyTotalsFields {
  taxLabel?: string
  subtotalToken?: string
  taxToken?: string
  totalToken?: string
  extraLines?: Array<{ id: string; label: string; value: string }>
  rows?: TotalsRow[]
}

export function createTotalsRowId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function createDefaultTotalsRows(): TotalsRow[] {
  return [
    { id: createTotalsRowId(), label: "Subtotal", value: "{{ invoice.subtotal }}", variant: "line" },
    { id: createTotalsRowId(), label: "Tax (10%)", value: "{{ invoice.tax }}", variant: "line" },
    { id: createTotalsRowId(), label: "Total", value: "{{ invoice.total }}", variant: "grand-total" },
  ]
}

function migrateLegacyTotalsProps(props: LegacyTotalsFields): TotalsRow[] {
  const rows: TotalsRow[] = []
  rows.push({
    id: createTotalsRowId(),
    label: "Subtotal",
    value: props.subtotalToken ?? "{{ invoice.subtotal }}",
    variant: "line",
  })
  rows.push({
    id: createTotalsRowId(),
    label: props.taxLabel ?? "Tax",
    value: props.taxToken ?? "{{ invoice.tax }}",
    variant: "line",
  })
  for (const ex of props.extraLines ?? []) {
    rows.push({ id: ex.id, label: ex.label, value: ex.value, variant: "line" })
  }
  rows.push({
    id: createTotalsRowId(),
    label: "Total",
    value: props.totalToken ?? "{{ invoice.total }}",
    variant: "grand-total",
  })
  return rows
}

/** Resolve rows whether the block uses the new shape or legacy fields (e.g. undo stack). */
export function getTotalsRows(props: TotalsBlock["props"] & LegacyTotalsFields): TotalsRow[] {
  if (props.rows !== undefined && props.rows.length > 0) return props.rows
  if (props.rows !== undefined && props.rows.length === 0) return props.rows
  return migrateLegacyTotalsProps(props)
}

export function normalizeTotalsBlockProps(raw: TotalsBlock["props"] & LegacyTotalsFields): TotalsBlock["props"] {
  const rows = getTotalsRows(raw)
  return {
    rows,
    labelColor: raw.labelColor,
    valueColor: raw.valueColor,
    accentColor: raw.accentColor,
  }
}

export function normalizeTotalsFlowBlock(block: FlowBlock): FlowBlock {
  if (block.type !== "totals-block") return block
  return {
    ...block,
    props: normalizeTotalsBlockProps(block.props),
  }
}
