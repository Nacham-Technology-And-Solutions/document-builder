import { Navbar } from "@/components/template-builder/navbar"
import { LeftSidebar } from "@/components/template-builder/left-sidebar"
import { Canvas } from "@/components/template-builder/canvas"
import { RightSidebar } from "@/components/template-builder/right-sidebar"

export default function TemplateBuilderPage() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
    </div>
  )
}
