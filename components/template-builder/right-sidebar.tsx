"use client"

import { Table, Palette, Type } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBuilderStore } from "@/lib/builder/store"
import type { DynamicTableBlock } from "@/lib/builder/types"

const themeColors = [
  { name: "Slate", color: "#334155" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
]

export function RightSidebar() {
  const flowBlocks = useBuilderStore((state) => state.flowBlocks)
  const selection = useBuilderStore((state) => state.selection)
  const documentSettings = useBuilderStore((state) => state.documentSettings)
  const setDocumentSettings = useBuilderStore((state) => state.setDocumentSettings)
  const updateDynamicTableProps = useBuilderStore((state) => state.updateDynamicTableProps)

  const selectedBlock = flowBlocks.find(
    (block) => selection.kind === "flow" && selection.id === block.id
  )
  const selectedDynamicTable =
    selectedBlock?.type === "dynamic-table" ? (selectedBlock as DynamicTableBlock) : null

  return (
    <aside className="w-[300px] border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Table className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {selectedBlock ? "Block Properties" : "Inspector"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedBlock ? `Editing ${selectedBlock.type}` : "Select a block to edit"}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {!selectedBlock && (
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

          <section className="rounded-md border border-dashed border-border p-3">
            <p className="text-xs text-muted-foreground">
              Floating element anchoring controls will be enabled in the next phase.
            </p>
          </section>
          <div className="h-1" />
        </div>
      </ScrollArea>
    </aside>
  )
}
