"use client"

import { useRef, type ChangeEvent } from "react"
import { FileText, Save, Code, FileCode2, FolderUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useBuilderStore } from "@/lib/builder/store"
import { downloadTextFile, generateHtmlExport } from "@/lib/builder/export/html-export"
import { generateBladeExport } from "@/lib/builder/export/blade-export"
import { parseTemplate, serializeTemplate } from "@/lib/builder/persistence"

export function Navbar() {
  const title = useBuilderStore((state) => state.documentSettings.title)
  const setTitle = useBuilderStore((state) => state.setTitle)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "template"

  const onSaveDraft = () => {
    const state = useBuilderStore.getState()
    const builderState = {
      documentSettings: state.documentSettings,
      flowBlocks: state.flowBlocks,
      floatingElements: state.floatingElements,
      selection: state.selection,
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
    }
    const blade = generateBladeExport(builderState)
    downloadTextFile(blade, `${safeTitle}.blade.php`, "text/plain")
  }

  const onLoadTemplateClick = () => {
    fileInputRef.current?.click()
  }

  const onLoadTemplateFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      const content = await file.text()
      const parsed = parseTemplate(content)
      useBuilderStore.getState().loadFromTemplate(parsed.builderState)
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
        <Button variant="ghost" size="sm" className="gap-2" onClick={onLoadTemplateClick}>
          <FolderUp className="w-4 h-4" />
          Load Template
        </Button>
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
