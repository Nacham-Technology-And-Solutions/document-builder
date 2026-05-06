"use client"

import { useMemo } from "react"
import { ChevronDown, ChevronUp, Plus, Rows3, Table, Palette, Trash2, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { flowBlockInspectorLabel } from "@/lib/builder/flow-block-labels"
import { createTotalsRowId } from "@/lib/builder/totals-block-utils"
import { resolveFlowBlockCornerStyle } from "@/lib/builder/flow-block-corners"
import { DEFAULT_FLOW_BLOCK_SPACING_PX, resolveFlowBlockSpacingPx } from "@/lib/builder/flow-block-spacing"
import { HEADING_BOX_MIN_HEIGHT_PX } from "@/lib/builder/heading-block-utils"
import { useBuilderStore } from "@/lib/builder/store"
import type { DynamicTableBlock, FloatingElement, FlowBlock, FlowBlockCornerStyle } from "@/lib/builder/types"

const INLINE_STYLING_HINT =
  "Inline styling: **bold** and *italic*. Mustache tokens like {{ client.name }} stay as-is."

const themeColors = [
  { name: "Slate", color: "#334155" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
]

export function RightSidebar() {
  const flowBlocks = useBuilderStore((state) => state.flowBlocks)
  const floatingElements = useBuilderStore((state) => state.floatingElements)
  const selection = useBuilderStore((state) => state.selection)
  const documentSettings = useBuilderStore((state) => state.documentSettings)
  const setDocumentSettings = useBuilderStore((state) => state.setDocumentSettings)
  const snapToGrid = useBuilderStore((state) => state.snapToGrid)
  const setSnapToGrid = useBuilderStore((state) => state.setSnapToGrid)
  const updateFlowBlock = useBuilderStore((state) => state.updateFlowBlock)
  const updateDynamicTableProps = useBuilderStore((state) => state.updateDynamicTableProps)
  const updateFloatingElement = useBuilderStore((state) => state.updateFloatingElement)
  const selectFlowBlock = useBuilderStore((state) => state.selectFlowBlock)
  const removeFlowBlock = useBuilderStore((state) => state.removeFlowBlock)
  const moveFlowBlockById = useBuilderStore((state) => state.moveFlowBlockById)
  const selectFloatingElement = useBuilderStore((state) => state.selectFloatingElement)
  const removeFloatingElement = useBuilderStore((state) => state.removeFloatingElement)
  const bringFloatingForward = useBuilderStore((state) => state.bringFloatingForward)
  const sendFloatingBackward = useBuilderStore((state) => state.sendFloatingBackward)
  const bringFloatingToFront = useBuilderStore((state) => state.bringFloatingToFront)
  const sendFloatingToBack = useBuilderStore((state) => state.sendFloatingToBack)
  const alignFloatingElement = useBuilderStore((state) => state.alignFloatingElement)
  const undo = useBuilderStore((state) => state.undo)
  const redo = useBuilderStore((state) => state.redo)

  const selectedBlock = flowBlocks.find(
    (block) => selection.kind === "flow" && selection.id === block.id
  )
  const selectedFloating = floatingElements.find(
    (element) => selection.kind === "floating" && selection.id === element.id
  ) as FloatingElement | undefined
  const selectedDynamicTable =
    selectedBlock?.type === "dynamic-table" ? (selectedBlock as DynamicTableBlock) : null
  const sortedFloatingLayers = useMemo(
    () => [...floatingElements].sort((a, b) => b.zIndex - a.zIndex),
    [floatingElements]
  )

  const updateSelectedFlow = (updater: (block: FlowBlock) => FlowBlock) => {
    if (!selectedBlock) return
    updateFlowBlock(selectedBlock.id, (block) => updater(block as FlowBlock))
  }

  const ColorField = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: string
    onChange: (next: string) => void
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-sm font-mono" />
        <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 p-1" />
      </div>
    </div>
  )

  return (
    <aside className="w-[320px] border-l border-border bg-card flex flex-col min-h-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Table className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {selectedBlock || selectedFloating ? "Block Properties" : "Inspector"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedBlock
                ? `Editing ${selectedBlock.type}`
                : selectedFloating
                  ? `Editing ${selectedFloating.type}`
                  : "Select an element to edit"}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="inspector" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="inspector" className="flex-1">Inspector</TabsTrigger>
            <TabsTrigger value="theme" className="flex-1">Theme & Layers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inspector" className="flex-1 min-h-0 mt-0">
          <div className="h-full overflow-y-auto p-4 space-y-6">
          {!selectedBlock && !selectedFloating && (
            <section className="rounded-md border border-dashed border-border p-3">
              <p className="text-xs text-muted-foreground">
                Select a flow block or floating element on the canvas to unlock editor controls.
              </p>
            </section>
          )}

          {selectedBlock && (
            <section className="space-y-3 pb-4 border-b border-border">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This block (overrides)</h3>
              <p className="text-[11px] text-muted-foreground">
                Omit values to follow Theme → Flow blocks: {resolveFlowBlockSpacingPx(documentSettings)}px spacing,{" "}
                {resolveFlowBlockCornerStyle(documentSettings)} corners.
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">Spacing below this block (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={160}
                  step={1}
                  placeholder={`Default (${resolveFlowBlockSpacingPx(documentSettings)})`}
                  value={typeof selectedBlock.spacingAfterPx === "number" ? selectedBlock.spacingAfterPx : ""}
                  onChange={(event) =>
                    updateSelectedFlow((block) => {
                      const raw = event.target.value.trim()
                      if (raw === "") {
                        return { ...block, spacingAfterPx: undefined }
                      }
                      const n = Number(raw)
                      if (!Number.isFinite(n)) return block
                      return { ...block, spacingAfterPx: Math.max(0, Math.min(160, Math.round(n))) }
                    })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="block-corner-override" className="text-xs">
                  Corner shape
                </Label>
                <Select
                  value={selectedBlock.cornerStyle ?? "__doc_default__"}
                  onValueChange={(value) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      cornerStyle:
                        value === "__doc_default__" ? undefined : (value as FlowBlockCornerStyle),
                    }))
                  }
                >
                  <SelectTrigger id="block-corner-override" className="h-8 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__doc_default__">Use document default</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>
          )}

          {selectedDynamicTable && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Mapping</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="loop-var" className="text-xs">Loop Variable</Label>
                  <Input
                    id="loop-var"
                    value={selectedDynamicTable.props.repeaterKey}
                    onChange={(event) =>
                      updateDynamicTableProps(selectedDynamicTable.id, { repeaterKey: event.target.value })
                    }
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="item-alias" className="text-xs">Item Alias</Label>
                  <Input
                    id="item-alias"
                    value={selectedDynamicTable.props.itemAlias}
                    onChange={(event) =>
                      updateDynamicTableProps(selectedDynamicTable.id, { itemAlias: event.target.value })
                    }
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
            </section>
          )}

          {selectedDynamicTable && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Table Columns</h3>
              <div className="grid grid-cols-2 gap-2">
                <ColorField
                  label="Header BG"
                  value={selectedDynamicTable.props.headerBackgroundColor}
                  onChange={(next) => updateDynamicTableProps(selectedDynamicTable.id, { headerBackgroundColor: next })}
                />
                <ColorField
                  label="Header Text"
                  value={selectedDynamicTable.props.headerTextColor}
                  onChange={(next) => updateDynamicTableProps(selectedDynamicTable.id, { headerTextColor: next })}
                />
                <ColorField
                  label="Row Text"
                  value={selectedDynamicTable.props.rowTextColor}
                  onChange={(next) => updateDynamicTableProps(selectedDynamicTable.id, { rowTextColor: next })}
                />
                <ColorField
                  label="Border Color"
                  value={selectedDynamicTable.props.borderColor}
                  onChange={(next) => updateDynamicTableProps(selectedDynamicTable.id, { borderColor: next })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Font Size</Label>
                <Input
                  type="number"
                  value={selectedDynamicTable.props.fontSize}
                  onChange={(event) =>
                    updateDynamicTableProps(selectedDynamicTable.id, { fontSize: Number(event.target.value || 0) })
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-3">
                {selectedDynamicTable.props.columns.map((column, index) => (
                  <div key={column.key} className="space-y-2 rounded-md border border-border p-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Column Key</Label>
                      <Input
                        value={column.key}
                        onChange={(event) => {
                          const nextColumns = [...selectedDynamicTable.props.columns]
                          nextColumns[index] = { ...nextColumns[index], key: event.target.value }
                          updateDynamicTableProps(selectedDynamicTable.id, { columns: nextColumns })
                        }}
                        className="h-8 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Column Label</Label>
                      <Input
                        value={column.label}
                        onChange={(event) => {
                          const nextColumns = [...selectedDynamicTable.props.columns]
                          nextColumns[index] = { ...nextColumns[index], label: event.target.value }
                          updateDynamicTableProps(selectedDynamicTable.id, { columns: nextColumns })
                        }}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Alignment</Label>
                      <Select
                        value={column.align}
                        onValueChange={(value: "left" | "center" | "right") => {
                          const nextColumns = [...selectedDynamicTable.props.columns]
                          nextColumns[index] = { ...nextColumns[index], align: value }
                          updateDynamicTableProps(selectedDynamicTable.id, { columns: nextColumns })
                        }}
                      >
                        <SelectTrigger className="h-8 text-sm w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {selectedBlock?.type === "header-banner" && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Header Style & Content</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Heading</Label>
                <Input
                  value={selectedBlock.props.heading}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...block.props, heading: event.target.value },
                    }))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Left column lines (one per line)</Label>
                <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                <textarea
                  value={
                    (selectedBlock.props.leftLines?.length
                      ? selectedBlock.props.leftLines
                      : selectedBlock.props.companyNameToken
                        ? [selectedBlock.props.companyNameToken]
                        : []
                    ).join("\n")
                  }
                  onChange={(event) => {
                    const raw = event.target.value
                    const lines = raw.trim() === "" ? [] : raw.split("\n")
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: {
                        ...(block as typeof selectedBlock).props,
                        leftLines: lines,
                        companyNameToken: undefined,
                      },
                    }))
                  }}
                  className="w-full min-h-20 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                  placeholder="{{ company.name }}"
                />
              </div>
              <div className="space-y-2 rounded-md border border-border p-3">
                <Label className="text-xs font-semibold">Right column</Label>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Use the fields below, or override with custom lines (tokens or static text per line).
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Custom right lines (optional override)</Label>
                  <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                  <textarea
                    value={(selectedBlock.props.rightLines ?? []).join("\n")}
                    onChange={(event) => {
                      const raw = event.target.value
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: {
                          ...(block as typeof selectedBlock).props,
                          rightLines: raw.trim() === "" ? undefined : raw.split("\n"),
                        },
                      }))
                    }}
                    className="w-full min-h-16 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                    placeholder="Leave empty → use invoice # + date fields"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Invoice label</Label>
                    <Input
                      value={selectedBlock.props.invoiceNumberLabel ?? "Invoice #"}
                      onChange={(event) =>
                        updateSelectedFlow((block) => ({
                          ...block,
                          props: {
                            ...(block as typeof selectedBlock).props,
                            invoiceNumberLabel: event.target.value,
                          },
                        }))
                      }
                      className="h-8 text-sm"
                      placeholder="Invoice #"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Number token</Label>
                    <Input
                      value={selectedBlock.props.invoiceNumberToken}
                      onChange={(event) =>
                        updateSelectedFlow((block) => ({
                          ...block,
                          props: {
                            ...(block as typeof selectedBlock).props,
                            invoiceNumberToken: event.target.value,
                          },
                        }))
                      }
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date prefix</Label>
                    <Input
                      value={selectedBlock.props.datePrefix ?? ""}
                      onChange={(event) =>
                        updateSelectedFlow((block) => ({
                          ...block,
                          props: { ...(block as typeof selectedBlock).props, datePrefix: event.target.value },
                        }))
                      }
                      className="h-8 text-sm"
                      placeholder='e.g. "Date: "'
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date token</Label>
                    <Input
                      value={selectedBlock.props.dateToken}
                      onChange={(event) =>
                        updateSelectedFlow((block) => ({
                          ...block,
                          props: { ...(block as typeof selectedBlock).props, dateToken: event.target.value },
                        }))
                      }
                      className="h-8 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorField
                  label="Background"
                  value={selectedBlock.props.backgroundColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, backgroundColor: next },
                    }))
                  }
                />
                <ColorField
                  label="Title Color"
                  value={selectedBlock.props.textColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, textColor: next },
                    }))
                  }
                />
              </div>
              <ColorField
                label="Muted / secondary text"
                value={selectedBlock.props.mutedTextColor}
                onChange={(next) =>
                  updateSelectedFlow((block) => ({
                    ...block,
                    props: { ...(block as typeof selectedBlock).props, mutedTextColor: next },
                  }))
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Heading size (px)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.props.headingFontSize}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: {
                          ...(block as typeof selectedBlock).props,
                          headingFontSize: Number(event.target.value || 0),
                        },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Heading weight</Label>
                  <Input
                    type="number"
                    min={100}
                    max={900}
                    step={100}
                    value={selectedBlock.props.headingFontWeight ?? 700}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: {
                          ...(block as typeof selectedBlock).props,
                          headingFontWeight: Number(event.target.value || 700),
                        },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Left subtitle size (px)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.props.subtitleFontSize ?? documentSettings.baseFontSize - 1}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: {
                          ...(block as typeof selectedBlock).props,
                          subtitleFontSize: Number(event.target.value || 0),
                        },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Right column size (px)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.props.rightColumnFontSize ?? documentSettings.baseFontSize - 1}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: {
                          ...(block as typeof selectedBlock).props,
                          rightColumnFontSize: Number(event.target.value || 0),
                        },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Padding X / Y (px)</Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={selectedBlock.props.paddingX ?? 24}
                      onChange={(event) =>
                        updateSelectedFlow((block) => ({
                          ...block,
                          props: { ...(block as typeof selectedBlock).props, paddingX: Number(event.target.value || 0) },
                        }))
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="number"
                      value={selectedBlock.props.paddingY ?? 24}
                      onChange={(event) =>
                        updateSelectedFlow((block) => ({
                          ...block,
                          props: { ...(block as typeof selectedBlock).props, paddingY: Number(event.target.value || 0) },
                        }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Column gap (px)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.props.columnGap ?? 12}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: {
                          ...(block as typeof selectedBlock).props,
                          columnGap: Number(event.target.value || 0),
                        },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Row layout</Label>
                  <Select
                    value={selectedBlock.props.bannerJustify ?? "between"}
                    onValueChange={(value: "between" | "center") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, bannerJustify: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="between">Space between</SelectItem>
                      <SelectItem value="center">Centered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Swap columns</Label>
                  <Select
                    value={selectedBlock.props.swapColumns ? "yes" : "no"}
                    onValueChange={(value: "yes" | "no") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, swapColumns: value === "yes" },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Heading left</SelectItem>
                      <SelectItem value="yes">Heading right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Left text align</Label>
                  <Select
                    value={selectedBlock.props.leftTextAlign ?? "left"}
                    onValueChange={(value: "left" | "center" | "right") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, leftTextAlign: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Right text align</Label>
                  <Select
                    value={selectedBlock.props.rightTextAlign ?? "right"}
                    onValueChange={(value: "left" | "center" | "right") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, rightTextAlign: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          )}

          {selectedBlock?.type === "invoice-meta-grid" && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta Grid Style</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Left Label</Label>
                  <Input
                    value={selectedBlock.props.billToLabel}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, billToLabel: event.target.value },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Right Label</Label>
                  <Input
                    value={selectedBlock.props.payToLabel}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, payToLabel: event.target.value },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorField
                  label="Label Color"
                  value={selectedBlock.props.labelColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, labelColor: next },
                    }))
                  }
                />
                <ColorField
                  label="Text Color"
                  value={selectedBlock.props.textColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, textColor: next },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Left Lines (one per line)</Label>
                <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                <textarea
                  value={selectedBlock.props.leftLines.join("\n")}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: {
                        ...(block as typeof selectedBlock).props,
                        leftLines: event.target.value.split("\n"),
                      },
                    }))
                  }
                  className="w-full min-h-20 rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Right Lines (one per line)</Label>
                <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                <textarea
                  value={selectedBlock.props.rightLines.join("\n")}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: {
                        ...(block as typeof selectedBlock).props,
                        rightLines: event.target.value.split("\n"),
                      },
                    }))
                  }
                  className="w-full min-h-20 rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
              </div>
            </section>
          )}

          {selectedBlock?.type === "totals-block" && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Totals</h3>
              <p className="text-[11px] text-muted-foreground leading-snug">
                All lines are one list—reorder freely. Use <span className="font-medium">Grand total</span> for the accent
                rule and bold styling (often the last row).
              </p>
              <div className="grid grid-cols-2 gap-2">
                <ColorField
                  label="Label Color"
                  value={selectedBlock.props.labelColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, labelColor: next },
                    }))
                  }
                />
                <ColorField
                  label="Value Color"
                  value={selectedBlock.props.valueColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, valueColor: next },
                    }))
                  }
                />
              </div>
              <ColorField
                label="Accent (grand total border)"
                value={selectedBlock.props.accentColor}
                onChange={(next) =>
                  updateSelectedFlow((block) => ({
                    ...block,
                    props: { ...(block as typeof selectedBlock).props, accentColor: next },
                  }))
                }
              />
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 px-2"
                  onClick={() =>
                    updateSelectedFlow((block) => {
                      if (block.type !== "totals-block") return block
                      return {
                        ...block,
                        props: {
                          ...block.props,
                          rows: [
                            ...block.props.rows,
                            {
                              id: createTotalsRowId(),
                              label: "Line",
                              value: "{{ invoice.amount }}",
                              variant: "line",
                            },
                          ],
                        },
                      }
                    })
                  }
                >
                  <Plus className="w-3.5 h-3.5" />
                  Row
                </Button>
              </div>
              <div className="space-y-2">
                {selectedBlock.props.rows.map((row, index) => (
                  <div key={row.id} className="space-y-2 rounded-md border border-border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium uppercase text-muted-foreground">Row {index + 1}</span>
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={index === 0}
                          onClick={() =>
                            updateSelectedFlow((block) => {
                              if (block.type !== "totals-block") return block
                              const prev = [...block.props.rows]
                              if (index <= 0) return block
                              ;[prev[index - 1], prev[index]] = [prev[index], prev[index - 1]]
                              return { ...block, props: { ...block.props, rows: prev } }
                            })
                          }
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span className="sr-only">Move up</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={index >= selectedBlock.props.rows.length - 1}
                          onClick={() =>
                            updateSelectedFlow((block) => {
                              if (block.type !== "totals-block") return block
                              const prev = [...block.props.rows]
                              if (index < 0 || index >= prev.length - 1) return block
                              ;[prev[index], prev[index + 1]] = [prev[index + 1], prev[index]]
                              return { ...block, props: { ...block.props, rows: prev } }
                            })
                          }
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span className="sr-only">Move down</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          disabled={selectedBlock.props.rows.length <= 1}
                          onClick={() =>
                            updateSelectedFlow((block) => {
                              if (block.type !== "totals-block") return block
                              if (block.props.rows.length <= 1) return block
                              return {
                                ...block,
                                props: {
                                  ...block.props,
                                  rows: block.props.rows.filter((r) => r.id !== row.id),
                                },
                              }
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Remove row</span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Style</Label>
                      <Select
                        value={row.variant}
                        onValueChange={(value: "line" | "grand-total") =>
                          updateSelectedFlow((block) => {
                            if (block.type !== "totals-block") return block
                            const prev = block.props.rows.map((r) =>
                              r.id === row.id ? { ...r, variant: value } : r
                            )
                            return { ...block, props: { ...block.props, rows: prev } }
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Regular</SelectItem>
                          <SelectItem value="grand-total">Grand total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={row.label}
                        onChange={(event) =>
                          updateSelectedFlow((block) => {
                            if (block.type !== "totals-block") return block
                            const prev = block.props.rows.map((r) =>
                              r.id === row.id ? { ...r, label: event.target.value } : r
                            )
                            return { ...block, props: { ...block.props, rows: prev } }
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Value / token</Label>
                      <Input
                        value={row.value}
                        onChange={(event) =>
                          updateSelectedFlow((block) => {
                            if (block.type !== "totals-block") return block
                            const prev = block.props.rows.map((r) =>
                              r.id === row.id ? { ...r, value: event.target.value } : r
                            )
                            return { ...block, props: { ...block.props, rows: prev } }
                          })
                        }
                        className="h-8 text-sm font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {selectedBlock?.type === "heading-block" && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Heading</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Heading text</Label>
                <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                <Input
                  value={selectedBlock.props.heading}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, heading: event.target.value },
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Width</Label>
                  <Select
                    value={selectedBlock.props.layoutWidth}
                    onValueChange={(value: "full" | "half") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, layoutWidth: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="half">Half</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Column</Label>
                  <Select
                    value={selectedBlock.props.boxAlign}
                    disabled={selectedBlock.props.layoutWidth === "full"}
                    onValueChange={(value: "left" | "right") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, boxAlign: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Align text</Label>
                  <Select
                    value={selectedBlock.props.textAlign}
                    onValueChange={(value: "left" | "center" | "right") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, textAlign: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorField label="Text color" value={selectedBlock.props.color} onChange={(next) => updateSelectedFlow((block) => ({ ...block, props: { ...(block as typeof selectedBlock).props, color: next } }))} />
                <div className="space-y-1.5">
                  <Label className="text-xs">Font size (px)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.props.fontSize}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, fontSize: Number(event.target.value || 14) },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Background</Label>
                <p className="text-[11px] text-muted-foreground">Clear for default canvas tint; export stays white unless set.</p>
                <div className="flex gap-2">
                  <Input
                    value={selectedBlock.props.backgroundColor ?? ""}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: {
                          ...(block as typeof selectedBlock).props,
                          backgroundColor: event.target.value.trim() || undefined,
                        },
                      }))
                    }
                    className="h-8 text-sm font-mono"
                    placeholder="Default"
                  />
                  <Input
                    type="color"
                    value={
                      /^#[0-9A-Fa-f]{6}$/.test((selectedBlock.props.backgroundColor ?? "").trim())
                        ? (selectedBlock.props.backgroundColor ?? "").trim()
                        : "#e2e8f0"
                    }
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, backgroundColor: event.target.value },
                      }))
                    }
                    className="h-8 w-12 p-1 shrink-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Box min height (px)</Label>
                <p className="text-[11px] text-muted-foreground">At least {HEADING_BOX_MIN_HEIGHT_PX}px when set; leave empty for auto.</p>
                <Input
                  type="number"
                  min={HEADING_BOX_MIN_HEIGHT_PX}
                  step={1}
                  placeholder="Auto"
                  value={
                    typeof selectedBlock.props.boxHeightPx === "number" && selectedBlock.props.boxHeightPx > 0
                      ? Math.max(HEADING_BOX_MIN_HEIGHT_PX, selectedBlock.props.boxHeightPx)
                      : ""
                  }
                  onChange={(event) => {
                    const raw = event.target.value.trim()
                    updateSelectedFlow((block) => {
                      if (block.type !== "heading-block") return block
                      if (raw === "") {
                        return { ...block, props: { ...block.props, boxHeightPx: undefined } }
                      }
                      const n = Number(raw)
                      if (!Number.isFinite(n)) {
                        return { ...block, props: { ...block.props, boxHeightPx: undefined } }
                      }
                      const nextH = n > 0 ? Math.max(HEADING_BOX_MIN_HEIGHT_PX, Math.round(n)) : undefined
                      return { ...block, props: { ...block.props, boxHeightPx: nextH } }
                    })
                  }}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Weight</Label>
                <Input
                  type="number"
                  min={100}
                  max={900}
                  step={100}
                  value={selectedBlock.props.fontWeight}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, fontWeight: Number(event.target.value || 600) },
                    }))
                  }
                  className="h-8 text-sm"
                />
              </div>
            </section>
          )}

          {selectedBlock?.type === "text-box" && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Text box</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Body</Label>
                <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                <textarea
                  value={selectedBlock.props.body}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, body: event.target.value },
                    }))
                  }
                  className="w-full min-h-28 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Width</Label>
                  <Select
                    value={selectedBlock.props.layoutWidth}
                    onValueChange={(value: "full" | "half") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, layoutWidth: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="half">Half</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Column</Label>
                  <Select
                    value={selectedBlock.props.boxAlign}
                    disabled={selectedBlock.props.layoutWidth === "full"}
                    onValueChange={(value: "left" | "right") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, boxAlign: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Align text</Label>
                  <Select
                    value={selectedBlock.props.textAlign}
                    onValueChange={(value: "left" | "center" | "right") =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, textAlign: value },
                      }))
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorField label="Color" value={selectedBlock.props.color} onChange={(next) => updateSelectedFlow((block) => ({ ...block, props: { ...(block as typeof selectedBlock).props, color: next } }))} />
                <div className="space-y-1.5">
                  <Label className="text-xs">Font size (px)</Label>
                  <Input
                    type="number"
                    value={selectedBlock.props.fontSize}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, fontSize: Number(event.target.value || 14) },
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Line height</Label>
                <Input
                  type="number"
                  step={0.05}
                  value={selectedBlock.props.lineHeight}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: {
                        ...(block as typeof selectedBlock).props,
                        lineHeight: Number(event.target.value || 1.4),
                      },
                    }))
                  }
                  className="h-8 text-sm"
                />
              </div>
            </section>
          )}

          {selectedBlock?.type === "footer-block" && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Footer Style</h3>
              <div className="grid grid-cols-2 gap-2">
                <ColorField
                  label="Heading Color"
                  value={selectedBlock.props.headingColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, headingColor: next },
                    }))
                  }
                />
                <ColorField
                  label="Text Color"
                  value={selectedBlock.props.textColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, textColor: next },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Heading</Label>
                <Input
                  value={selectedBlock.props.heading}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, heading: event.target.value },
                    }))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Lines (one per line)</Label>
                <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                <textarea
                  value={selectedBlock.props.lines.join("\n")}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, lines: event.target.value.split("\n") },
                    }))
                  }
                  className="w-full min-h-20 rounded-md border border-border bg-background px-2 py-1 text-xs"
                />
              </div>
            </section>
          )}

          {selectedBlock?.type === "custom-html" && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom HTML Block</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Block Label</Label>
                <Input
                  value={selectedBlock.props.label}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, label: event.target.value },
                    }))
                  }
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">HTML</Label>
                <textarea
                  value={selectedBlock.props.html}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, html: event.target.value },
                    }))
                  }
                  className="w-full min-h-24 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CSS</Label>
                <textarea
                  value={selectedBlock.props.css}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, css: event.target.value },
                    }))
                  }
                  className="w-full min-h-20 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                />
              </div>
            </section>
          )}

          {selectedFloating && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Floating Element</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Anchor Mode</Label>
                <Select
                  value={selectedFloating.anchorMode}
                  onValueChange={(value: "page" | "block") =>
                    updateFloatingElement(selectedFloating.id, { anchorMode: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedFloating.anchorMode === "block" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Anchor Target</Label>
                  <Select
                    value={selectedFloating.anchorTargetId || ""}
                    onValueChange={(value) =>
                      updateFloatingElement(selectedFloating.id, {
                        anchorTargetId: value === "none" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {flowBlocks.map((block) => (
                        <SelectItem key={block.id} value={block.id}>
                          {flowBlockInspectorLabel(block.type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={selectedFloating.x}
                    onChange={(event) => updateFloatingElement(selectedFloating.id, { x: Number(event.target.value || 0) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={selectedFloating.y}
                    onChange={(event) => updateFloatingElement(selectedFloating.id, { y: Number(event.target.value || 0) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={selectedFloating.width}
                    onChange={(event) =>
                      updateFloatingElement(selectedFloating.id, { width: Number(event.target.value || 0) })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={selectedFloating.height}
                    onChange={(event) =>
                      updateFloatingElement(selectedFloating.id, { height: Number(event.target.value || 0) })
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Z-Index</Label>
                <Input
                  type="number"
                  value={selectedFloating.zIndex}
                  onChange={(event) =>
                    updateFloatingElement(selectedFloating.id, { zIndex: Number(event.target.value || 0) })
                  }
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Rotation (deg)</Label>
                  <Input
                    type="number"
                    value={selectedFloating.rotation ?? 0}
                    onChange={(event) =>
                      updateFloatingElement(selectedFloating.id, { rotation: Number(event.target.value || 0) })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Lock Element</Label>
                  <label className="h-8 rounded-md border border-border px-2 flex items-center justify-between text-xs">
                    <span>{selectedFloating.locked ? "Locked" : "Unlocked"}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <input
                            type="checkbox"
                            checked={!!selectedFloating.locked}
                            onChange={(event) =>
                              updateFloatingElement(selectedFloating.id, { locked: event.target.checked })
                            }
                          />
                        </TooltipTrigger>
                        <TooltipContent>Lock prevents move, resize, and keyboard nudging.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                </div>
              </div>

              {(selectedFloating.type === "image" || selectedFloating.type === "stamp") && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Content</Label>
                  <Input
                    value={selectedFloating.content || ""}
                    onChange={(event) => updateFloatingElement(selectedFloating.id, { content: event.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
              )}
              {selectedFloating.type === "text" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Content (multi-line)</Label>
                    <p className="text-[11px] text-muted-foreground">{INLINE_STYLING_HINT}</p>
                    <textarea
                      value={selectedFloating.content || ""}
                      onChange={(event) => updateFloatingElement(selectedFloating.id, { content: event.target.value })}
                      className="w-full min-h-28 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Background</Label>
                    <p className="text-[11px] text-muted-foreground">Clear for default white tint; type transparent for none.</p>
                    <div className="flex gap-2">
                      <Input
                        value={selectedFloating.textBackgroundColor ?? ""}
                        onChange={(event) =>
                          updateFloatingElement(selectedFloating.id, {
                            textBackgroundColor: event.target.value.trim() || undefined,
                          })
                        }
                        className="h-8 text-sm font-mono"
                        placeholder="Default or transparent"
                      />
                      <Input
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test((selectedFloating.textBackgroundColor ?? "").trim())
                            ? (selectedFloating.textBackgroundColor ?? "").trim()
                            : "#ffffff"
                        }
                        onChange={(event) =>
                          updateFloatingElement(selectedFloating.id, { textBackgroundColor: event.target.value })
                        }
                        className="h-8 w-12 p-1 shrink-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Border color</Label>
                    <p className="text-[11px] text-muted-foreground">Clear for default gray; transparent removes the border.</p>
                    <div className="flex gap-2">
                      <Input
                        value={selectedFloating.textBorderColor ?? ""}
                        onChange={(event) =>
                          updateFloatingElement(selectedFloating.id, {
                            textBorderColor: event.target.value.trim() || undefined,
                          })
                        }
                        className="h-8 text-sm font-mono"
                        placeholder="Default or transparent"
                      />
                      <Input
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test((selectedFloating.textBorderColor ?? "").trim())
                            ? (selectedFloating.textBorderColor ?? "").trim()
                            : "#e5e7eb"
                        }
                        onChange={(event) =>
                          updateFloatingElement(selectedFloating.id, { textBorderColor: event.target.value })
                        }
                        className="h-8 w-12 p-1 shrink-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Border width (px)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="1"
                      value={
                        typeof selectedFloating.textBorderWidthPx === "number"
                          ? selectedFloating.textBorderWidthPx
                          : ""
                      }
                      onChange={(event) => {
                        const raw = event.target.value.trim()
                        if (raw === "") {
                          updateFloatingElement(selectedFloating.id, { textBorderWidthPx: undefined })
                          return
                        }
                        const n = Number(raw)
                        if (!Number.isFinite(n)) return
                        updateFloatingElement(selectedFloating.id, { textBorderWidthPx: Math.max(0, Math.round(n)) })
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}
              {selectedFloating.type === "image" && (
                <div className="space-y-2">
                  <Label className="text-xs">Upload Image / Logo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="h-8 text-sm"
                    onChange={async (event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = reader.result
                        if (typeof result === "string") {
                          updateFloatingElement(selectedFloating.id, { src: result })
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Image Fit</Label>
                    <Select
                      value={selectedFloating.fit || "contain"}
                      onValueChange={(value: "contain" | "cover") =>
                        updateFloatingElement(selectedFloating.id, { fit: value })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="cover">Cover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <Button title="Align to page left edge" size="sm" variant="outline" onClick={() => alignFloatingElement(selectedFloating.id, "left")}>Left</Button>
                <Button title="Align to page center" size="sm" variant="outline" onClick={() => alignFloatingElement(selectedFloating.id, "center")}>Center</Button>
                <Button title="Align to page right edge" size="sm" variant="outline" onClick={() => alignFloatingElement(selectedFloating.id, "right")}>Right</Button>
                <Button title="Align to page top edge" size="sm" variant="outline" onClick={() => alignFloatingElement(selectedFloating.id, "top")}>Top</Button>
                <Button title="Align to vertical middle" size="sm" variant="outline" onClick={() => alignFloatingElement(selectedFloating.id, "middle")}>Middle</Button>
                <Button title="Align to page bottom edge" size="sm" variant="outline" onClick={() => alignFloatingElement(selectedFloating.id, "bottom")}>Bottom</Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => sendFloatingToBack(selectedFloating.id)}>To Back</Button>
                <Button size="sm" variant="outline" onClick={() => sendFloatingBackward(selectedFloating.id)}>Back</Button>
                <Button size="sm" variant="outline" onClick={() => bringFloatingForward(selectedFloating.id)}>Forward</Button>
                <Button size="sm" variant="outline" onClick={() => bringFloatingToFront(selectedFloating.id)}>To Front</Button>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeFloatingElement(selectedFloating.id)}
                className="w-full"
              >
                Remove Floating Element
              </Button>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Block Layers</h3>
            <div className="space-y-1.5">
              {flowBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`w-full rounded-md border px-2 py-1.5 text-xs ${
                    selectedBlock?.id === block.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <button type="button" className="w-full text-left font-medium" onClick={() => selectFlowBlock(block.id)}>
                    {flowBlockInspectorLabel(block.type)}
                  </button>
                  <div className="mt-1 flex gap-1">
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => moveFlowBlockById(block.id, "up")} disabled={index === 0}>Up</Button>
                    <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => moveFlowBlockById(block.id, "down")} disabled={index === flowBlocks.length - 1}>Down</Button>
                    <Button size="sm" variant="destructive" className="h-6 px-2 text-[10px]" onClick={() => removeFlowBlock(block.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Floating Layers</h3>
            <div className="space-y-1.5">
              {sortedFloatingLayers.length === 0 && (
                <p className="text-xs text-muted-foreground">No floating elements yet.</p>
              )}
              {sortedFloatingLayers.map((layer) => (
                <button
                  type="button"
                  key={layer.id}
                  className={`w-full text-left rounded-md border px-2 py-1.5 text-xs ${
                    selectedFloating?.id === layer.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                  }`}
                  onClick={() => selectFloatingElement(layer.id)}
                >
                  <div className="font-medium">{layer.type}</div>
                  <div className="text-muted-foreground">z-index: {layer.zIndex}</div>
                </button>
              ))}
            </div>
          </section>
          <div className="h-2" />
          </div>
        </TabsContent>

        <TabsContent value="theme" className="flex-1 min-h-0 mt-0">
          <div className="h-full overflow-y-auto p-4 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme Color</h3>
            </div>
            <div className="flex gap-2">
              {themeColors.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  className="relative w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                  onClick={() => setDocumentSettings({ primaryColor: color.color })}
                >
                  {documentSettings.primaryColor === color.color && (
                    <div className="absolute inset-0 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-card" />
                  )}
                </button>
              ))}
            </div>
            <ColorField
              label="Primary Color (Hex)"
              value={documentSettings.primaryColor}
              onChange={(next) => setDocumentSettings({ primaryColor: next })}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h3>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="font-family" className="text-xs">Font Family</Label>
              <Select
                value={documentSettings.fontFamily}
                onValueChange={(value) => setDocumentSettings({ fontFamily: value })}
              >
                <SelectTrigger id="font-family" className="h-8 text-sm w-full">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                  <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                  <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                  <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                  <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Rows3 className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flow blocks</h3>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Document-wide defaults on canvas and HTML export; a selected block can override spacing and corners in Inspector (This block overrides).
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="flow-block-spacing" className="text-xs">
                Spacing between blocks (px)
              </Label>
              <p className="text-[11px] text-muted-foreground">Default {DEFAULT_FLOW_BLOCK_SPACING_PX}px when no per-block spacing is set.</p>
              <Input
                id="flow-block-spacing"
                type="number"
                min={0}
                max={160}
                step={1}
                value={resolveFlowBlockSpacingPx(documentSettings)}
                onChange={(event) => {
                  const n = Number(event.target.value)
                  if (!Number.isFinite(n)) return
                  setDocumentSettings({
                    flowBlockSpacingPx: Math.max(0, Math.min(160, Math.round(n))),
                  })
                }}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="flow-block-corners" className="text-xs">
                Block corners
              </Label>
              <p className="text-[11px] text-muted-foreground">Default corner shape unless a block sets its own.</p>
              <Select
                value={resolveFlowBlockCornerStyle(documentSettings)}
                onValueChange={(value: FlowBlockCornerStyle) => setDocumentSettings({ flowBlockCornerStyle: value })}
              >
                <SelectTrigger id="flow-block-corners" className="h-8 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Canvas Controls</h3>
            <label className="flex items-center justify-between rounded-md border border-border p-2">
              <span className="text-sm">Snap To Grid</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="checkbox"
                      checked={snapToGrid}
                      onChange={(event) => setSnapToGrid(event.target.checked)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Snap drag and resize operations to an 8px grid.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={undo}>Undo</Button>
              <Button size="sm" variant="outline" onClick={redo}>Redo</Button>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Layers</h3>
            <p className="text-xs text-muted-foreground">Blocks: {flowBlocks.length} | Floating: {floatingElements.length}</p>
          </section>
          <div className="h-2" />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
