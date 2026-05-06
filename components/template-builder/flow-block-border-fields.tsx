"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DEFAULT_FLOW_BLOCK_BORDER_COLOR } from "@/lib/builder/flow-block-border-utils"
import type { FlowBlockBorderMixin } from "@/lib/builder/types"

interface FlowBlockBorderFieldsProps {
  value: Partial<FlowBlockBorderMixin>
  onPatch: (patch: Partial<FlowBlockBorderMixin>) => void
  /** Placeholder for hex text field when color is empty */
  colorPlaceholder?: string
  /** When false, only mode + width (e.g. dynamic table has its own border color field) */
  showColorField?: boolean
}

export function FlowBlockBorderFields({
  value,
  onPatch,
  colorPlaceholder = DEFAULT_FLOW_BLOCK_BORDER_COLOR,
  showColorField = true,
}: FlowBlockBorderFieldsProps) {
  const mode = value.borderMode ?? "solid"
  const colorStr = (value.borderColor ?? "").trim()
  const pickerFallback = /^#[0-9A-Fa-f]{6}$/.test(colorStr) ? colorStr : colorPlaceholder

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Border</h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Style</Label>
        <Select
          value={mode}
          onValueChange={(v) => onPatch({ borderMode: v as "none" | "solid" })}
        >
          <SelectTrigger className="h-8 text-sm w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {mode === "solid" && (
        <>
          {showColorField && (
            <div className="space-y-1.5">
              <Label className="text-xs">Border color</Label>
              <p className="text-[11px] text-muted-foreground">Clear to use the block default (see hint below).</p>
              <div className="flex gap-2">
                <Input
                  value={value.borderColor ?? ""}
                  onChange={(event) =>
                    onPatch({ borderColor: event.target.value.trim() || undefined })
                  }
                  className="h-8 text-sm font-mono"
                  placeholder={colorPlaceholder}
                />
                <Input
                  type="color"
                  value={pickerFallback}
                  onChange={(event) => onPatch({ borderColor: event.target.value })}
                  className="h-8 w-12 p-1 shrink-0"
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Border width (px)</Label>
            <Input
              type="number"
              min={0}
              max={16}
              step={1}
              placeholder="1"
              value={typeof value.borderWidthPx === "number" ? value.borderWidthPx : ""}
              onChange={(event) => {
                const raw = event.target.value.trim()
                if (raw === "") {
                  onPatch({ borderWidthPx: undefined })
                  return
                }
                const n = Number(raw)
                if (!Number.isFinite(n)) return
                onPatch({ borderWidthPx: Math.max(0, Math.min(16, Math.round(n))) })
              }}
              className="h-8 text-sm"
            />
          </div>
        </>
      )}
    </div>
  )
}
