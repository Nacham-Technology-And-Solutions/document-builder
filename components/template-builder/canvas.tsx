"use client"

import { GripVertical } from "lucide-react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useBuilderStore } from "@/lib/builder/store"
import type { FlowBlock } from "@/lib/builder/types"

interface SelectedBlockProps {
  children: React.ReactNode
  label: string
  isSelected?: boolean
  onClick?: () => void
  id: string
}

function FlowBlock({ children, label, isSelected, onClick, id }: SelectedBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`relative rounded-md transition-all ${
        isSelected 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-card" 
          : "hover:ring-1 hover:ring-border"
      }`}
      onClick={onClick}
    >
      {isSelected && (
        <>
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            <button
              type="button"
              className="w-3 h-3 rounded-full bg-primary cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
            />
          </div>
          <div className="absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-1 bg-primary rounded-t-md">
            <GripVertical className="w-3 h-3 text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">{label}</span>
          </div>
        </>
      )}
      {children}
    </div>
  )
}

const alignClassName: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

function renderFlowBlock(block: FlowBlock, primaryColor: string) {
  switch (block.type) {
    case "header-banner":
      return (
        <div className="rounded-md p-6" style={{ backgroundColor: primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{block.props.heading}</h1>
              <p className="text-zinc-400 text-sm mt-1">{block.props.companyNameToken}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-sm">Invoice # {block.props.invoiceNumberToken}</p>
              <p className="text-zinc-400 text-sm">{block.props.dateToken}</p>
            </div>
          </div>
        </div>
      )
    case "invoice-meta-grid":
      return (
        <div className="grid grid-cols-2 gap-6 p-4 border border-border rounded-md">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{block.props.billToLabel}</p>
            {block.props.leftLines.map((line) => (
              <p key={line} className="text-sm text-muted-foreground">{line}</p>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{block.props.payToLabel}</p>
            {block.props.rightLines.map((line) => (
              <p key={line} className="text-sm text-muted-foreground">{line}</p>
            ))}
          </div>
        </div>
      )
    case "dynamic-table":
      return (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                {block.props.columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-xs font-medium text-muted-foreground uppercase tracking-wider p-3 ${alignClassName[column.align] ?? "text-left"}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="text-sm">
                {block.props.columns.map((column) => (
                  <td
                    key={column.key}
                    className={`p-3 text-muted-foreground ${alignClassName[column.align] ?? "text-left"}`}
                  >
                    {`{{ ${block.props.itemAlias}.${column.key} }}`}
                  </td>
                ))}
              </tr>
              <tr className="text-sm bg-muted/30">
                <td className="p-3 text-muted-foreground italic" colSpan={block.props.columns.length}>
                  {`@foreach(${block.props.repeaterKey} as ${block.props.itemAlias})`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    case "totals-block":
      return (
        <div className="flex justify-end">
          <div className="w-64 space-y-2 p-4 border border-border rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{block.props.subtotalToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{block.props.taxLabel}</span>
              <span className="text-foreground">{block.props.taxToken}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{block.props.totalToken}</span>
              </div>
            </div>
          </div>
        </div>
      )
    case "footer-block":
      return (
        <div className="border border-border rounded-md p-4">
          <p className="text-sm font-medium text-foreground mb-2">{block.props.heading}</p>
          {block.props.lines.map((line) => (
            <p key={line} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      )
  }
}

export function Canvas() {
  const flowBlocks = useBuilderStore((state) => state.flowBlocks)
  const documentSettings = useBuilderStore((state) => state.documentSettings)
  const selection = useBuilderStore((state) => state.selection)
  const selectFlowBlock = useBuilderStore((state) => state.selectFlowBlock)
  const reorderFlowBlocks = useBuilderStore((state) => state.reorderFlowBlocks)

  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const fromIndex = flowBlocks.findIndex((block) => block.id === active.id)
    const toIndex = flowBlocks.findIndex((block) => block.id === over.id)
    if (fromIndex >= 0 && toIndex >= 0) {
      reorderFlowBlocks(fromIndex, toIndex)
    }
  }

  return (
    <main className="flex-1 bg-canvas p-8 overflow-auto">
      <div className="min-h-full flex items-start justify-center">
        {/* A4 Paper Container */}
        <div 
          className="bg-card shadow-lg rounded-sm relative"
          style={{ 
            width: "595px", // A4 width at 72 DPI
            minHeight: "842px", // A4 height at 72 DPI
            aspectRatio: "1 / 1.414", // A4 aspect ratio
            fontFamily: documentSettings.fontFamily,
          }}
        >
          {/* Page content */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={flowBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="p-8 space-y-6">
                {flowBlocks.map((block) => (
                  <FlowBlock
                    key={block.id}
                    id={block.id}
                    label={block.type}
                    isSelected={selection.kind === "flow" && selection.id === block.id}
                    onClick={() => selectFlowBlock(block.id)}
                  >
                    {renderFlowBlock(block, documentSettings.primaryColor)}
                  </FlowBlock>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </main>
  )
}
