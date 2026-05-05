"use client"

import { 
  LayoutTemplate, 
  Grid3X3, 
  Table, 
  Calculator, 
  FileText,
  ImageIcon,
  Type,
  Sparkles,
  Stamp,
  GripVertical
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BlockItemProps {
  icon: React.ReactNode
  label: string
  description: string
}

function BlockItem({ icon, label, description }: BlockItemProps) {
  return (
    <div className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/30 cursor-grab transition-colors">
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
    </div>
  )
}

const flowBlocks: BlockItemProps[] = [
  { 
    icon: <LayoutTemplate className="w-4 h-4 text-muted-foreground" />, 
    label: "Header Banner", 
    description: "Top section with branding" 
  },
  { 
    icon: <Grid3X3 className="w-4 h-4 text-muted-foreground" />, 
    label: "Invoice Meta Grid", 
    description: "Invoice details layout" 
  },
  { 
    icon: <Table className="w-4 h-4 text-muted-foreground" />, 
    label: "Dynamic Table", 
    description: "Line items with loop" 
  },
  { 
    icon: <Calculator className="w-4 h-4 text-muted-foreground" />, 
    label: "Totals Block", 
    description: "Subtotal, tax, total" 
  },
  { 
    icon: <FileText className="w-4 h-4 text-muted-foreground" />, 
    label: "Footer", 
    description: "Terms and notes" 
  },
]

const floatingElements: BlockItemProps[] = [
  { 
    icon: <ImageIcon className="w-4 h-4 text-muted-foreground" />, 
    label: "Logo / Image", 
    description: "Upload or placeholder" 
  },
  { 
    icon: <Type className="w-4 h-4 text-muted-foreground" />, 
    label: "Text Box", 
    description: "Free-form text" 
  },
  { 
    icon: <Sparkles className="w-4 h-4 text-muted-foreground" />, 
    label: "Background Pattern", 
    description: "Decorative overlay" 
  },
  { 
    icon: <Stamp className="w-4 h-4 text-muted-foreground" />, 
    label: "PAID Stamp", 
    description: "Status watermark" 
  },
]

export function LeftSidebar() {
  return (
    <aside className="w-[300px] border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Toolbox</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Drag elements to the canvas</p>
      </div>
      <Tabs defaultValue="flow" className="flex-1 flex flex-col">
        <div className="px-4 pt-3">
          <TabsList className="w-full">
            <TabsTrigger value="flow" className="flex-1">Flow Blocks</TabsTrigger>
            <TabsTrigger value="floating" className="flex-1">Floating</TabsTrigger>
          </TabsList>
        </div>
        <ScrollArea className="flex-1 px-4 py-3">
          <TabsContent value="flow" className="mt-0 space-y-2">
            {flowBlocks.map((block) => (
              <BlockItem key={block.label} {...block} />
            ))}
          </TabsContent>
          <TabsContent value="floating" className="mt-0 space-y-2">
            {floatingElements.map((element) => (
              <BlockItem key={element.label} {...element} />
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  )
}
