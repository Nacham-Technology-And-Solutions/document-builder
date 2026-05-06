import type { CSSProperties } from "react"

import type { DynamicTableColumn, FlowBlock } from "@/lib/builder/types"
import { normalizeTotalsFlowBlock } from "@/lib/builder/totals-block-utils"

function newColumnId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `col_${Math.random().toString(36).slice(2, 11)}`
}

const MAX_COLUMN_MIN_WIDTH_PX = 640

/** New column template for the inspector. */
export function createDynamicTableColumn(
  overrides: Partial<Omit<DynamicTableColumn, "id">> = {},
): DynamicTableColumn {
  return {
    id: newColumnId(),
    key: overrides.key ?? "field",
    label: overrides.label ?? "Column",
    align: overrides.align ?? "left",
    minWidthPx:
      typeof overrides.minWidthPx === "number" && overrides.minWidthPx > 0
        ? Math.min(MAX_COLUMN_MIN_WIDTH_PX, Math.round(overrides.minWidthPx))
        : undefined,
  }
}

/** Ensures every column has an `id` and clamps `minWidthPx`. */
export function normalizeDynamicTableColumns(columns: DynamicTableColumn[]): DynamicTableColumn[] {
  return columns.map((c) => ({
    ...c,
    id: typeof c.id === "string" && c.id.trim() ? c.id : newColumnId(),
    minWidthPx:
      typeof c.minWidthPx === "number" && Number.isFinite(c.minWidthPx) && c.minWidthPx > 0
        ? Math.min(MAX_COLUMN_MIN_WIDTH_PX, Math.round(c.minWidthPx))
        : undefined,
  }))
}

export function normalizeDynamicTableBlock(block: FlowBlock): FlowBlock {
  if (block.type !== "dynamic-table") return block
  return {
    ...block,
    props: {
      ...block.props,
      columns: normalizeDynamicTableColumns(block.props.columns),
    },
  }
}

/** Run after preset import / template load alongside totals normalization. */
export function normalizeImportedFlowBlocks(blocks: FlowBlock[]): FlowBlock[] {
  return blocks.map((block) => normalizeDynamicTableBlock(normalizeTotalsFlowBlock(block)))
}

export function moveDynamicTableColumn(columns: DynamicTableColumn[], index: number, direction: -1 | 1): DynamicTableColumn[] {
  const to = index + direction
  if (to < 0 || to >= columns.length) return columns
  const next = [...columns]
  const [row] = next.splice(index, 1)
  next.splice(to, 0, row)
  return next
}

export function columnMinWidthStyle(minWidthPx: number | undefined): CSSProperties | undefined {
  if (typeof minWidthPx !== "number" || !(minWidthPx > 0)) return undefined
  return { minWidth: minWidthPx }
}
