"use client"

import { GripVertical, Move, Maximize2 } from "lucide-react"

interface SelectedBlockProps {
  children: React.ReactNode
  label: string
  isSelected?: boolean
}

function FlowBlock({ children, label, isSelected }: SelectedBlockProps) {
  return (
    <div 
      className={`relative rounded-md transition-all ${
        isSelected 
          ? "ring-2 ring-primary ring-offset-2 ring-offset-card" 
          : "hover:ring-1 hover:ring-border"
      }`}
    >
      {isSelected && (
        <>
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-2 h-2 rounded-full bg-primary cursor-move" />
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

interface FloatingElementProps {
  className?: string
}

function FloatingStamp({ className }: FloatingElementProps) {
  return (
    <div className={`absolute ${className}`}>
      {/* Resize handles */}
      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-primary rounded-full cursor-nw-resize" />
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full cursor-ne-resize" />
      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-primary rounded-full cursor-sw-resize" />
      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full cursor-se-resize" />
      {/* Move handle */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-primary rounded-md">
        <Move className="w-3 h-3 text-primary-foreground" />
        <span className="text-xs font-medium text-primary-foreground">PAID Stamp</span>
      </div>
      {/* The stamp itself */}
      <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center rotate-[-15deg]">
        <span className="text-lg font-bold text-emerald-500 tracking-wider">PAID</span>
      </div>
    </div>
  )
}

export function Canvas() {
  return (
    <main className="flex-1 bg-canvas p-8 overflow-auto">
      <div className="min-h-full flex items-start justify-center">
        {/* A4 Paper Container */}
        <div 
          className="bg-card shadow-lg rounded-sm relative"
          style={{ 
            width: "595px", // A4 width at 72 DPI
            minHeight: "842px", // A4 height at 72 DPI
            aspectRatio: "1 / 1.414" // A4 aspect ratio
          }}
        >
          {/* Page content */}
          <div className="p-8 space-y-6">
            {/* Header Block */}
            <FlowBlock label="Header Banner" isSelected={false}>
              <div className="bg-zinc-900 rounded-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-white">INVOICE</h1>
                    <p className="text-zinc-400 text-sm mt-1">{"{{ company.name }}"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-sm">Invoice #{"{{ invoice.number }}"}</p>
                    <p className="text-zinc-400 text-sm">{"{{ invoice.date }}"}</p>
                  </div>
                </div>
              </div>
            </FlowBlock>

            {/* Meta Grid Block */}
            <FlowBlock label="Invoice Meta Grid" isSelected={false}>
              <div className="grid grid-cols-2 gap-6 p-4 border border-border rounded-md">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bill To</p>
                  <p className="text-sm font-medium text-foreground">{"{{ client.name }}"}</p>
                  <p className="text-sm text-muted-foreground">{"{{ client.address }}"}</p>
                  <p className="text-sm text-muted-foreground">{"{{ client.email }}"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Pay To</p>
                  <p className="text-sm font-medium text-foreground">{"{{ company.name }}"}</p>
                  <p className="text-sm text-muted-foreground">{"{{ company.address }}"}</p>
                  <p className="text-sm text-muted-foreground">{"{{ company.bank }}"}</p>
                </div>
              </div>
            </FlowBlock>

            {/* Dynamic Table Block - Selected */}
            <FlowBlock label="Dynamic Table" isSelected={true}>
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-3">Description</th>
                      <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider p-3">Qty</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-3">Rate</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="text-sm">
                      <td className="p-3 text-foreground">{"{{ item.description }}"}</td>
                      <td className="p-3 text-center text-muted-foreground">{"{{ item.quantity }}"}</td>
                      <td className="p-3 text-right text-muted-foreground">{"{{ item.rate }}"}</td>
                      <td className="p-3 text-right font-medium text-foreground">{"{{ item.amount }}"}</td>
                    </tr>
                    <tr className="text-sm bg-muted/30">
                      <td className="p-3 text-muted-foreground italic" colSpan={4}>
                        @foreach(invoice.items as item)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </FlowBlock>

            {/* Totals Block */}
            <FlowBlock label="Totals" isSelected={false}>
              <div className="flex justify-end">
                <div className="w-64 space-y-2 p-4 border border-border rounded-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{"{{ invoice.subtotal }}"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="text-foreground">{"{{ invoice.tax }}"}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-base font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{"{{ invoice.total }}"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FlowBlock>
          </div>

          {/* Floating PAID Stamp */}
          <FloatingStamp className="top-16 right-6" />
        </div>
      </div>
    </main>
  )
}
