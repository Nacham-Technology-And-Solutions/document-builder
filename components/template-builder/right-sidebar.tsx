"use client"

import { useMemo } from "react"
import { Table, Palette, Type } from "lucide-react"
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
import { useBuilderStore } from "@/lib/builder/store"
import type { DynamicTableBlock, FloatingElement, FlowBlock } from "@/lib/builder/types"

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
                <Label className="text-xs">Heading Text</Label>
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
                <Label className="text-xs">Company Token</Label>
                <Input
                  value={selectedBlock.props.companyNameToken}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, companyNameToken: event.target.value },
                    }))
                  }
                  className="h-8 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Invoice Number Token</Label>
                <Input
                  value={selectedBlock.props.invoiceNumberToken}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, invoiceNumberToken: event.target.value },
                    }))
                  }
                  className="h-8 text-sm font-mono"
                />
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
              <div className="grid grid-cols-2 gap-2">
                <ColorField
                  label="Muted Text"
                  value={selectedBlock.props.mutedTextColor}
                  onChange={(next) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, mutedTextColor: next },
                    }))
                  }
                />
                <div className="space-y-1.5">
                  <Label className="text-xs">Heading Size</Label>
                  <Input
                    type="number"
                    value={selectedBlock.props.headingFontSize}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, headingFontSize: Number(event.target.value || 0) },
                      }))
                    }
                    className="h-8 text-sm"
                  />
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
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Totals Style</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Tax Label</Label>
                <Input
                  value={selectedBlock.props.taxLabel}
                  onChange={(event) =>
                    updateSelectedFlow((block) => ({
                      ...block,
                      props: { ...(block as typeof selectedBlock).props, taxLabel: event.target.value },
                    }))
                  }
                  className="h-8 text-sm"
                />
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
                label="Accent Color"
                value={selectedBlock.props.accentColor}
                onChange={(next) =>
                  updateSelectedFlow((block) => ({
                    ...block,
                    props: { ...(block as typeof selectedBlock).props, accentColor: next },
                  }))
                }
              />
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Subtotal Token</Label>
                  <Input
                    value={selectedBlock.props.subtotalToken}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, subtotalToken: event.target.value },
                      }))
                    }
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tax Token</Label>
                  <Input
                    value={selectedBlock.props.taxToken}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, taxToken: event.target.value },
                      }))
                    }
                    className="h-8 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Total Token</Label>
                  <Input
                    value={selectedBlock.props.totalToken}
                    onChange={(event) =>
                      updateSelectedFlow((block) => ({
                        ...block,
                        props: { ...(block as typeof selectedBlock).props, totalToken: event.target.value },
                      }))
                    }
                    className="h-8 text-sm font-mono"
                  />
                </div>
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
                          {block.type}
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

              {(selectedFloating.type === "text" || selectedFloating.type === "image" || selectedFloating.type === "stamp") && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Content</Label>
                  <Input
                    value={selectedFloating.content || ""}
                    onChange={(event) => updateFloatingElement(selectedFloating.id, { content: event.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
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
                    {block.type}
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
