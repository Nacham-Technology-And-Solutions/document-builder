"use client"

import {
  AlignLeft,
  Heading2,
  LayoutTemplate,
  Grid3X3,
  Table,
  Calculator,
  FileText,
  ImageIcon,
  Type,
  Sparkles,
  Stamp,
  GripVertical,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBuilderStore } from "@/lib/builder/store"
import type { FloatingElementType, FlowBlockType } from "@/lib/builder/types"

interface BlockItemProps {
  icon: React.ReactNode
  label: string
  description: string
  blockType?: FlowBlockType
  floatingType?: FloatingElementType
  onClick?: () => void
}

function BlockItem({ icon, label, description, onClick }: BlockItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2 flex-1">
        <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
      </div>
      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

const flowBlocks: BlockItemProps[] = [
  { 
    icon: <LayoutTemplate className="w-4 h-4 text-muted-foreground" />, 
    label: "Header Banner", 
    description: "Top section with branding",
    blockType: "header-banner",
  },
  { 
    icon: <Grid3X3 className="w-4 h-4 text-muted-foreground" />, 
    label: "Invoice Meta Grid", 
    description: "Invoice details layout",
    blockType: "invoice-meta-grid",
  },
  { 
    icon: <Table className="w-4 h-4 text-muted-foreground" />, 
    label: "Dynamic Table", 
    description: "Line items with loop",
    blockType: "dynamic-table",
  },
  { 
    icon: <Calculator className="w-4 h-4 text-muted-foreground" />, 
    label: "Totals Block", 
    description: "Subtotal, tax, total",
    blockType: "totals-block",
  },
  {
    icon: <Heading2 className="w-4 h-4 text-muted-foreground" />,
    label: "Heading",
    description: "Title strip, full or half width",
    blockType: "heading-block",
  },
  {
    icon: <AlignLeft className="w-4 h-4 text-muted-foreground" />,
    label: "Text box",
    description: "Body copy, full or half width",
    blockType: "text-box",
  },
  { 
    icon: <FileText className="w-4 h-4 text-muted-foreground" />, 
    label: "Footer", 
    description: "Terms and notes",
    blockType: "footer-block",
  },
  {
    icon: <Type className="w-4 h-4 text-muted-foreground" />,
    label: "Custom HTML",
    description: "User-defined HTML/CSS block",
    blockType: "custom-html",
  },
]

const floatingElements: BlockItemProps[] = [
  { 
    icon: <ImageIcon className="w-4 h-4 text-muted-foreground" />, 
    label: "Logo / Image", 
    description: "Upload or placeholder",
    floatingType: "image",
  },
  { 
    icon: <Type className="w-4 h-4 text-muted-foreground" />, 
    label: "Text Box", 
    description: "Floating multi-line text, bold/italic",
    floatingType: "text",
  },
  { 
    icon: <Sparkles className="w-4 h-4 text-muted-foreground" />, 
    label: "Background Pattern", 
    description: "Decorative overlay",
    floatingType: "pattern",
  },
  { 
    icon: <Stamp className="w-4 h-4 text-muted-foreground" />, 
    label: "PAID Stamp", 
    description: "Status watermark",
    floatingType: "stamp",
  },
]

export function LeftSidebar() {
  const addFlowBlock = useBuilderStore((state) => state.addFlowBlock)
  const addFloatingElement = useBuilderStore((state) => state.addFloatingElement)

  return (
    <aside className="w-[300px] shrink-0 border-r border-border bg-card flex flex-col min-h-0 h-full overflow-hidden">
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Toolbox</h2>
        <p className="text-xs text-muted-foreground mt-1">Add blocks or floating elements to the canvas.</p>
      </div>
      <Tabs defaultValue="flow" className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="px-4 pt-3 shrink-0">
          <TabsList className="w-full">
            <TabsTrigger value="flow" className="flex-1">Flow Blocks</TabsTrigger>
            <TabsTrigger value="floating" className="flex-1">Floating</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
          <TabsContent value="flow" className="mt-0 space-y-2 outline-none">
            {flowBlocks.map((block) => (
              <BlockItem
                key={block.label}
                {...block}
                onClick={() => {
                  if (block.blockType) addFlowBlock(block.blockType)
                }}
              />
            ))}
          </TabsContent>
          <TabsContent value="floating" className="mt-0 space-y-2 outline-none">
            {floatingElements.map((element) => (
              <BlockItem
                key={element.label}
                {...element}
                onClick={() => {
                  if (element.floatingType) addFloatingElement(element.floatingType)
                }}
              />
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  )
}
