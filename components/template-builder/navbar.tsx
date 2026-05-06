"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { FileText, LayoutTemplate, Save, Code, FileCode2, FolderUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useBuilderStore } from "@/lib/builder/store"
import { downloadTextFile, generateHtmlExport } from "@/lib/builder/export/html-export"
import { generateBladeExport } from "@/lib/builder/export/blade-export"
import { parseTemplate, serializeTemplate } from "@/lib/builder/persistence"
import {
  getPresetBuilderState,
  type TemplateMenuCategory,
  type TemplateMenuStyle,
  TEMPLATE_MENU_CATEGORIES,
} from "@/lib/builder/template-presets"

export function Navbar() {
  const title = useBuilderStore((state) => state.documentSettings.title)
  const setTitle = useBuilderStore((state) => state.setTitle)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false)

  const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "template"

  const onSaveDraft = () => {
    const state = useBuilderStore.getState()
    const builderState = {
      documentSettings: state.documentSettings,
      flowBlocks: state.flowBlocks,
      floatingElements: state.floatingElements,
      selection: state.selection,
      snapToGrid: state.snapToGrid,
    }
    const payload = JSON.stringify(serializeTemplate(builderState), null, 2)
    downloadTextFile(payload, `${safeTitle}.json`, "application/json")
  }

  const onExportHtml = () => {
    const state = useBuilderStore.getState()
    const builderState = {
      documentSettings: state.documentSettings,
      flowBlocks: state.flowBlocks,
      floatingElements: state.floatingElements,
      selection: state.selection,
      snapToGrid: state.snapToGrid,
    }
    const html = generateHtmlExport(builderState)
    downloadTextFile(html, `${safeTitle}.html`, "text/html")
  }

  const onExportBlade = () => {
    const state = useBuilderStore.getState()
    const builderState = {
      documentSettings: state.documentSettings,
      flowBlocks: state.flowBlocks,
      floatingElements: state.floatingElements,
      selection: state.selection,
      snapToGrid: state.snapToGrid,
    }
    const blade = generateBladeExport(builderState)
    downloadTextFile(blade, `${safeTitle}.blade.php`, "text/plain")
  }

  const onLoadTemplateClick = () => {
    fileInputRef.current?.click()
  }

  const applyPreset = (category: TemplateMenuCategory, style: TemplateMenuStyle) => {
    const next = getPresetBuilderState(category, style)
    useBuilderStore.getState().replaceBuilderState(next)
    setTemplateMenuOpen(false)
  }

  const onLoadTemplateFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      const content = await file.text()
      const parsed = parseTemplate(content)
      useBuilderStore.getState().replaceBuilderState(parsed.builderState)
      setTemplateMenuOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import template."
      alert(message)
    }
  }

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Left side - Logo and title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">DocBuilder</span>
        </div>
        <div className="h-6 w-px bg-border" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-64 h-8 bg-transparent border-transparent hover:border-input focus:border-input text-sm font-medium"
        />
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={onLoadTemplateFile}
        />
        <Dialog open={templateMenuOpen} onOpenChange={setTemplateMenuOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl" showCloseButton>
            <DialogHeader>
              <DialogTitle>Templates</DialogTitle>
              <DialogDescription>
                Pick a document category and layout, or load a saved JSON template file.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue={TEMPLATE_MENU_CATEGORIES[0].id} className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                {TEMPLATE_MENU_CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {TEMPLATE_MENU_CATEGORIES.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cat.styles.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => applyPreset(cat.id, s.id)}
                        className={cn(
                          "rounded-lg border border-border bg-card p-4 text-left transition-colors",
                          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        )}
                      >
                        <p className="font-medium">{s.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <Separator />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Already have a template file?</p>
              <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={onLoadTemplateClick}>
                <FolderUp className="w-4 h-4" />
                Load from JSON…
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="sm" className="gap-2" onClick={onSaveDraft}>
          <Save className="w-4 h-4" />
          Save Draft
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={onExportHtml}>
          <Code className="w-4 h-4" />
          Export HTML
        </Button>
        <Button size="sm" className="gap-2" onClick={onExportBlade}>
          <FileCode2 className="w-4 h-4" />
          Export Blade
        </Button>
      </div>
    </header>
  )
}
