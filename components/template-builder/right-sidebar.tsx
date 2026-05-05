"use client"

import { Table, Anchor, Palette } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

const themeColors = [
  { name: "Slate", color: "#334155" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
]

export function RightSidebar() {
  return (
    <aside className="w-[300px] border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Table className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Dynamic Table Block</h2>
            <p className="text-xs text-muted-foreground">Configure properties</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Data Mapping Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Mapping</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="loop-var" className="text-xs">Loop Variable</Label>
                <Input 
                  id="loop-var" 
                  defaultValue="invoice.items" 
                  className="h-8 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-alias" className="text-xs">Item Alias</Label>
                <Input 
                  id="item-alias" 
                  defaultValue="item" 
                  className="h-8 text-sm font-mono"
                />
              </div>
            </div>
          </section>

          {/* Theme Color Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme Color</h3>
            </div>
            <div className="flex gap-2">
              {themeColors.map((color) => (
                <button
                  key={color.name}
                  className="relative w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                >
                  {color.name === "Slate" && (
                    <div className="absolute inset-0 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-card" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typography</h3>
            <div className="space-y-1.5">
              <Label htmlFor="font-family" className="text-xs">Font Family</Label>
              <Select defaultValue="inter">
                <SelectTrigger id="font-family" className="h-8 text-sm w-full">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="open-sans">Open Sans</SelectItem>
                  <SelectItem value="lato">Lato</SelectItem>
                  <SelectItem value="poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="header-size" className="text-xs">Header Size</Label>
              <Select defaultValue="sm">
                <SelectTrigger id="header-size" className="h-8 text-sm w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xs">Extra Small</SelectItem>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Anchoring Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Anchor className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Anchoring</h3>
            </div>
            <RadioGroup defaultValue="block" className="gap-2">
              <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="page" id="anchor-page" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="anchor-page" className="text-sm font-medium cursor-pointer">
                    Anchor to Page
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Element stays fixed relative to page edges
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-md border border-primary/50 bg-primary/5 cursor-pointer">
                <RadioGroupItem value="block" id="anchor-block" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="anchor-block" className="text-sm font-medium cursor-pointer">
                    Anchor to Block
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Element flows with document content
                  </p>
                </div>
              </div>
            </RadioGroup>
          </section>

          {/* Table Options Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Table Options</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="border-style" className="text-xs">Border Style</Label>
                <Select defaultValue="solid">
                  <SelectTrigger id="border-style" className="h-8 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="row-striping" className="text-xs">Row Striping</Label>
                <Select defaultValue="odd">
                  <SelectTrigger id="row-striping" className="h-8 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="odd">Odd Rows</SelectItem>
                    <SelectItem value="even">Even Rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </aside>
  )
}
