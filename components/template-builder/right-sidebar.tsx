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
import { useBuilderStore } from "@/lib/builder/store"
import type { DynamicTableBlock, FloatingElement } from "@/lib/builder/types"

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
  const updateDynamicTableProps = useBuilderStore((state) => state.updateDynamicTableProps)
  const updateFloatingElement = useBuilderStore((state) => state.updateFloatingElement)
  const selectFloatingElement = useBuilderStore((state) => state.selectFloatingElement)
  const removeFloatingElement = useBuilderStore((state) => state.removeFloatingElement)
  const bringFloatingForward = useBuilderStore((state) => state.bringFloatingForward)
  const sendFloatingBackward = useBuilderStore((state) => state.sendFloatingBackward)
  const bringFloatingToFront = useBuilderStore((state) => state.bringFloatingToFront)
  const sendFloatingToBack = useBuilderStore((state) => state.sendFloatingToBack)

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
                  : "Select a block to edit"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!selectedBlock && !selectedFloating && (
            <section className="rounded-md border border-dashed border-border p-3">
              <p className="text-xs text-muted-foreground">
                Select a block on the canvas to enable block-specific controls.
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
                <div className="space-y-1.5">
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
                </div>
              )}
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
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Layers</h3>
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

          {selectedDynamicTable && (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Table Columns</h3>
              <div className="space-y-3">
                {selectedDynamicTable.props.columns.map((column, index) => (
                  <div key={column.key} className="space-y-2 rounded-md border border-border p-2">
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
          <div className="h-2" />
      </div>
    </aside>
  )
}
