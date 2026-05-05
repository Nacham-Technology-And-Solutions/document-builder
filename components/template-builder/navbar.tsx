"use client"

import { useState } from "react"
import { FileText, Save, Code, FileCode2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar() {
  const [title, setTitle] = useState("Untitled Invoice Template")

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
        <Button variant="ghost" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Code className="w-4 h-4" />
          Export HTML
        </Button>
        <Button size="sm" className="gap-2">
          <FileCode2 className="w-4 h-4" />
          Export Blade
        </Button>
      </div>
    </header>
  )
}
