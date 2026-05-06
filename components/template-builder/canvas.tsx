"use client"

import { useEffect, type CSSProperties, type MouseEvent } from "react"
import { GripVertical, Lock } from "lucide-react"
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
import {
  resolveBannerJustify,
  resolveHeaderBannerLeftLines,
  resolveHeaderBannerRightLines,
  resolveHeadingWeight,
  resolveRightColumnFontSize,
  resolveSubtitleFontSize,
} from "@/lib/builder/header-banner-utils"
import { flowBlockRadiusTwClass } from "@/lib/builder/flow-block-corners"
import {
  resolveFlowBlockCornersForBlock,
  resolveFlowBlockSpacingAfterPx,
} from "@/lib/builder/flow-block-layout-resolve"
import { floatingTextInnerStyle } from "@/lib/builder/floating-text-utils"
import { resolveHeadingBoxMinHeightPx } from "@/lib/builder/heading-block-utils"
import { layoutStripCardProps, layoutStripOuterProps } from "@/lib/builder/flow-section-layout"
import { cn } from "@/lib/utils"
import { inlineRichTextToSafeHtml, multilineMarkdownToParagraphInnerHtml } from "@/lib/builder/inline-rich-text"
import { getTotalsRows } from "@/lib/builder/totals-block-utils"
import { flowBlockInspectorLabel } from "@/lib/builder/flow-block-labels"
import type { FloatingElement, FlowBlock } from "@/lib/builder/types"

interface SelectedBlockProps {
  children: React.ReactNode
  label: string
  isSelected?: boolean
  onClick?: () => void
  id: string
  /** `rounded-md` or `rounded-none` */
  blockRadiusTw: string
  /** Space below this block (already 0 when last row) */
  marginBottomPx: number
}

type ResizeHandle = "nw" | "ne" | "sw" | "se"

const GRID = 8
const MIN_W = 40
const MIN_H = 24
const PAGE_W = 595
const PAGE_H = 842

const alignClassName: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const snap = (value: number) => Math.round(value / GRID) * GRID

/** Skip canvas shortcuts while the user edits form fields so Backspace does not delete the selection. */
function eventTargetIsEditableField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const el = target
  const tag = el.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
  if (el.isContentEditable) return true
  if (el.closest("[contenteditable='true']")) return true
  return false
}

function SortableFlowBlock({
  children,
  label,
  isSelected,
  onClick,
  id,
  blockRadiusTw,
  marginBottomPx,
}: SelectedBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const toolbarTopRounding = blockRadiusTw === "rounded-none" ? "rounded-t-none" : "rounded-t-md"

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: marginBottomPx,
      }}
      className={cn(
        "relative transition-all",
        blockRadiusTw,
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : "hover:ring-1 hover:ring-border",
      )}
      onClick={onClick}
    >
      {isSelected && (
        <>
          <div className="absolute -left-3 top-1/2 -translate-y-1/2">
            <button
              type="button"
              className="w-3 h-3 rounded-full bg-primary cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              {...attributes}
              {...listeners}
            />
          </div>
          <div
            className={cn("absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-1 bg-primary", toolbarTopRounding)}
          >
            <GripVertical className="w-3 h-3 text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">{label}</span>
          </div>
        </>
      )}
      {children}
    </div>
  )
}

function renderFlowBlock(block: FlowBlock, primaryColor: string, baseFontSize: number, blockRadiusTw: string) {
  switch (block.type) {
    case "header-banner": {
      const p = block.props
      const leftLines = resolveHeaderBannerLeftLines(p)
      const rightLines = resolveHeaderBannerRightLines(p)
      const centered = resolveBannerJustify(p) === "center"
      const justify = centered ? "center" : "space-between"
      const gap = typeof p.columnGap === "number" ? p.columnGap : 12
      const px = typeof p.paddingX === "number" ? p.paddingX : 24
      const py = typeof p.paddingY === "number" ? p.paddingY : 24
      const subtitlePx = resolveSubtitleFontSize(p, baseFontSize)
      const rightPx = resolveRightColumnFontSize(p, baseFontSize)
      const leftAlign = p.leftTextAlign ?? "left"
      const rightAlign = p.rightTextAlign ?? "right"
      const wHeading = resolveHeadingWeight(p)

      return (
        <div
          className={cn(blockRadiusTw, "box-border min-w-0")}
          style={{
            backgroundColor: p.backgroundColor || primaryColor,
            paddingLeft: px,
            paddingRight: px,
            paddingTop: py,
            paddingBottom: py,
          }}
        >
          <div
            className="flex items-center min-w-0 box-border"
            style={{
              flexDirection: p.swapColumns ? "row-reverse" : "row",
              justifyContent: justify,
              gap,
            }}
          >
            <div className={centered ? "min-w-0 max-w-[50%]" : "min-w-0 flex-1"} style={{ textAlign: leftAlign }}>
              <h1
                className="m-0"
                style={{
                  color: p.textColor,
                  fontSize: `${p.headingFontSize}px`,
                  fontWeight: wHeading,
                }}
              >
                {p.heading}
              </h1>
              {leftLines.map((line, idx) => (
                <p
                  key={`hl-${idx}`}
                  style={{
                    color: p.mutedTextColor,
                    fontSize: `${subtitlePx}px`,
                    marginTop: idx === 0 ? 6 : 4,
                    marginBottom: 0,
                  }}
                  dangerouslySetInnerHTML={{ __html: inlineRichTextToSafeHtml(line) }}
                />
              ))}
            </div>
            <div className={centered ? "min-w-0 max-w-[50%]" : "min-w-0 flex-1"} style={{ textAlign: rightAlign }}>
              {rightLines.map((line, idx) => (
                <p
                  key={`hr-${idx}`}
                  style={{
                    color: p.mutedTextColor,
                    fontSize: `${rightPx}px`,
                    marginTop: idx === 0 ? 0 : 4,
                    marginBottom: 0,
                  }}
                  dangerouslySetInnerHTML={{ __html: inlineRichTextToSafeHtml(line) }}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }
    case "invoice-meta-grid":
      return (
        <div className={cn("grid grid-cols-2 gap-6 p-4 border border-border", blockRadiusTw)}>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: block.props.labelColor }}>
              {block.props.billToLabel}
            </p>
            {block.props.leftLines.map((line, idx) => (
              <p
                key={`meta-l-${idx}`}
                className="text-sm"
                style={{ color: block.props.textColor }}
                dangerouslySetInnerHTML={{ __html: inlineRichTextToSafeHtml(line) }}
              />
            ))}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: block.props.labelColor }}>
              {block.props.payToLabel}
            </p>
            {block.props.rightLines.map((line, idx) => (
              <p
                key={`meta-r-${idx}`}
                className="text-sm"
                style={{ color: block.props.textColor }}
                dangerouslySetInnerHTML={{ __html: inlineRichTextToSafeHtml(line) }}
              />
            ))}
          </div>
        </div>
      )
    case "dynamic-table":
      return (
        <div className={cn(blockRadiusTw, "overflow-hidden")} style={{ border: `1px solid ${block.props.borderColor}` }}>
          <table className="w-full" style={{ fontSize: `${block.props.fontSize}px` }}>
            <thead>
              <tr style={{ backgroundColor: block.props.headerBackgroundColor }}>
                {block.props.columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-xs font-medium uppercase tracking-wider p-3 ${alignClassName[column.align] ?? "text-left"}`}
                    style={{ color: block.props.headerTextColor }}
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
                    className={`p-3 ${alignClassName[column.align] ?? "text-left"}`}
                    style={{ color: block.props.rowTextColor }}
                  >
                    {`{{ ${block.props.itemAlias}.${column.key} }}`}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )
    case "custom-html":
      return (
        <div className={cn("border border-border p-4", blockRadiusTw)}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{block.props.label}</p>
          {block.props.css ? <style>{block.props.css}</style> : null}
          <div dangerouslySetInnerHTML={{ __html: block.props.html }} />
        </div>
      )
    case "totals-block": {
      const rows = getTotalsRows(block.props)
      return (
        <div className="flex justify-end">
          <div className={cn("w-64 space-y-2 p-4 border border-border", blockRadiusTw)}>
            {rows.map((row) => {
              const isGrand = row.variant === "grand-total"
              const rowCls = isGrand ? "flex justify-between text-base font-semibold pt-2 mt-2 border-t" : "flex justify-between text-sm"
              return (
                <div
                  key={row.id}
                  className={rowCls}
                  style={isGrand ? { borderTopColor: block.props.accentColor } : undefined}
                >
                  <span style={{ color: block.props.labelColor }}>{row.label}</span>
                  <span style={{ color: block.props.valueColor }}>{row.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    case "heading-block": {
      const b = block.props
      const rowStyle = layoutStripOuterProps(b.boxAlign, b.layoutWidth)
      const cardStyle: CSSProperties = {
        ...layoutStripCardProps(b.layoutWidth, b.textAlign),
      }
      const bg = b.backgroundColor?.trim()
      if (bg) cardStyle.backgroundColor = bg
      const boxH = resolveHeadingBoxMinHeightPx(b.boxHeightPx)
      if (boxH !== undefined) {
        cardStyle.minHeight = boxH
        cardStyle.display = "flex"
        cardStyle.flexDirection = "column"
        cardStyle.justifyContent = "center"
      }
      return (
        <div className="w-full min-w-0" style={rowStyle}>
          <div
            className={cn(
              blockRadiusTw,
              "border border-border p-4 box-border min-w-0",
              !bg && "bg-card/40",
            )}
            style={cardStyle}
          >
            <h2
              className="m-0"
              style={{
                fontSize: `${b.fontSize}px`,
                fontWeight: b.fontWeight,
                color: b.color,
                lineHeight: 1.2,
              }}
              dangerouslySetInnerHTML={{ __html: inlineRichTextToSafeHtml(b.heading) }}
            />
          </div>
        </div>
      )
    }
    case "text-box": {
      const b = block.props
      const rowStyle = layoutStripOuterProps(b.boxAlign, b.layoutWidth)
      const cardStyle = layoutStripCardProps(b.layoutWidth, b.textAlign)
      const paragraphCss = `color:${b.color};font-size:${b.fontSize}px;line-height:${b.lineHeight}`
      const innerHtml = multilineMarkdownToParagraphInnerHtml(b.body, paragraphCss)
      return (
        <div className="w-full min-w-0" style={rowStyle}>
          <div
            className={cn(blockRadiusTw, "border border-border p-4 box-border bg-card/40 min-w-0 [&_p]:m-0")}
            style={cardStyle}
            dangerouslySetInnerHTML={{ __html: innerHtml }}
          />
        </div>
      )
    }
    case "footer-block":
      return (
        <div className={cn("border border-border p-4", blockRadiusTw)}>
          <p className="text-sm font-medium mb-2" style={{ color: block.props.headingColor }}>
            {block.props.heading}
          </p>
          {block.props.lines.map((line, idx) => (
            <p
              key={`foot-${idx}`}
              className="text-sm"
              style={{ color: block.props.textColor }}
              dangerouslySetInnerHTML={{ __html: inlineRichTextToSafeHtml(line) }}
            />
          ))}
        </div>
      )
  }
}

function FloatingNode({
  element,
  selected,
  onMouseDown,
  onResizeStart,
}: {
  element: FloatingElement
  selected: boolean
  onMouseDown: (event: MouseEvent) => void
  onResizeStart: (event: MouseEvent, handle: ResizeHandle) => void
}) {
  const selectionClass = selected ? "ring-2 ring-primary ring-offset-1" : "hover:ring-1 hover:ring-border"
  const baseStyle: CSSProperties = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    transform: `rotate(${element.rotation ?? 0}deg)`,
    transformOrigin: "center center",
  }

  let body: React.ReactNode
  if (element.type === "image") {
    body = element.src ? (
      <img
        src={element.src}
        alt={element.content || "Uploaded"}
        className={`w-full h-full rounded-md ${element.fit === "cover" ? "object-cover" : "object-contain"}`}
        draggable={false}
      />
    ) : (
      <div className="w-full h-full border border-dashed rounded-md flex items-center justify-center text-xs text-muted-foreground">{element.content || "Upload logo"}</div>
    )
  } else if (element.type === "stamp") {
    body = (
      <div className="w-full h-full rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white/80">
        <span className="text-lg font-bold text-emerald-500 tracking-wider">{element.content || "PAID"}</span>
      </div>
    )
  } else if (element.type === "pattern") {
    body = (
      <div
        className="w-full h-full rounded-md"
        style={{
          background:
            "radial-gradient(circle at 1px 1px, rgba(30, 41, 59, 0.22) 1px, transparent 0), linear-gradient(135deg, rgba(51,65,85,0.12), rgba(59,130,246,0.08))",
          backgroundSize: "10px 10px, auto",
        }}
      />
    )
  } else {
    const txt = element.content ?? "Text"
    const inner = multilineMarkdownToParagraphInnerHtml(txt, "")
    const chrome = floatingTextInnerStyle(element)
    body = (
      <div
        className="w-full h-full overflow-auto px-2 py-1.5 text-sm leading-snug rounded-md [&_p]:leading-snug"
        style={chrome}
      >
        <div dangerouslySetInnerHTML={{ __html: inner }} />
      </div>
    )
  }

  return (
    <div
      className={`absolute pointer-events-auto select-none rounded-md ${element.locked ? "cursor-not-allowed" : "cursor-move"} ${selectionClass}`}
      style={baseStyle}
      onMouseDown={onMouseDown}
    >
      {body}
      {element.locked && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
          <Lock className="w-3 h-3 text-amber-700" />
        </div>
      )}
      {selected && !element.locked && (
        <>
          <button type="button" className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-primary rounded-full cursor-nw-resize" onMouseDown={(e) => onResizeStart(e, "nw")} />
          <button type="button" className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-primary rounded-full cursor-ne-resize" onMouseDown={(e) => onResizeStart(e, "ne")} />
          <button type="button" className="absolute -left-1 -bottom-1 w-2.5 h-2.5 bg-primary rounded-full cursor-sw-resize" onMouseDown={(e) => onResizeStart(e, "sw")} />
          <button type="button" className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-primary rounded-full cursor-se-resize" onMouseDown={(e) => onResizeStart(e, "se")} />
        </>
      )}
    </div>
  )
}

export function Canvas() {
  const flowBlocks = useBuilderStore((state) => state.flowBlocks)
  const floatingElements = useBuilderStore((state) => state.floatingElements)
  const documentSettings = useBuilderStore((state) => state.documentSettings)
  const selection = useBuilderStore((state) => state.selection)
  const selectFlowBlock = useBuilderStore((state) => state.selectFlowBlock)
  const selectFloatingElement = useBuilderStore((state) => state.selectFloatingElement)
  const updateFloatingElement = useBuilderStore((state) => state.updateFloatingElement)
  const reorderFlowBlocks = useBuilderStore((state) => state.reorderFlowBlocks)
  const nudgeFloatingElement = useBuilderStore((state) => state.nudgeFloatingElement)
  const snapToGrid = useBuilderStore((state) => state.snapToGrid)
  const removeFlowBlock = useBuilderStore((state) => state.removeFlowBlock)
  const removeFloatingElement = useBuilderStore((state) => state.removeFloatingElement)
  const undo = useBuilderStore((state) => state.undo)
  const redo = useBuilderStore((state) => state.redo)

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      const typing = eventTargetIsEditableField(event.target)
      const ctrlOrMeta = event.ctrlKey || event.metaKey
      if (ctrlOrMeta && event.key.toLowerCase() === "z") {
        if (typing) return
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (typing) return
        if (selection.kind === "floating" && selection.id) {
          event.preventDefault()
          removeFloatingElement(selection.id)
          return
        }
        if (selection.kind === "flow" && selection.id) {
          event.preventDefault()
          removeFlowBlock(selection.id)
        }
      }
    }
    window.addEventListener("keydown", onGlobalKeyDown)
    return () => window.removeEventListener("keydown", onGlobalKeyDown)
  }, [selection, removeFlowBlock, removeFloatingElement, undo, redo])

  useEffect(() => {
    const selectedId = selection.kind === "floating" ? selection.id : null
    if (!selectedId) return
    const target = floatingElements.find((el) => el.id === selectedId)
    if (!target) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (eventTargetIsEditableField(event.target)) return
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return
      if (target.locked) return
      event.preventDefault()
      const step = event.shiftKey ? 10 : 1
      let dx = 0
      let dy = 0
      if (event.key === "ArrowUp") dy = -step
      if (event.key === "ArrowDown") dy = step
      if (event.key === "ArrowLeft") dx = -step
      if (event.key === "ArrowRight") dx = step
      const nextX = clamp(target.x + dx, 0, PAGE_W - target.width)
      const nextY = clamp(target.y + dy, 0, PAGE_H - target.height)
      nudgeFloatingElement(selectedId, nextX - target.x, nextY - target.y)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selection, floatingElements, nudgeFloatingElement])

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = flowBlocks.findIndex((b) => b.id === active.id)
    const to = flowBlocks.findIndex((b) => b.id === over.id)
    if (from >= 0 && to >= 0) reorderFlowBlocks(from, to)
  }

  const onFloatingMoveStart = (event: MouseEvent, element: FloatingElement) => {
    event.stopPropagation()
    selectFloatingElement(element.id)
    if (element.anchorMode !== "page") return
    if (element.locked) return

    const sx = event.clientX
    const sy = event.clientY
    const ix = element.x
    const iy = element.y
    const onMove = (e: MouseEvent) => {
      const rawX = clamp(ix + (e.clientX - sx), 0, PAGE_W - element.width)
      const rawY = clamp(iy + (e.clientY - sy), 0, PAGE_H - element.height)
      const nextX = snapToGrid ? snap(rawX) : rawX
      const nextY = snapToGrid ? snap(rawY) : rawY
      updateFloatingElement(element.id, { x: nextX, y: nextY })
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const onFloatingResizeStart = (event: MouseEvent, element: FloatingElement, handle: ResizeHandle) => {
    event.stopPropagation()
    event.preventDefault()
    selectFloatingElement(element.id)
    if (element.locked) return

    const sx = event.clientX
    const sy = event.clientY
    const initial = { ...element }
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - sx
      const dy = e.clientY - sy
      let x = initial.x
      let y = initial.y
      let w = initial.width
      let h = initial.height

      if (handle.includes("e")) w = Math.max(MIN_W, initial.width + dx)
      if (handle.includes("s")) h = Math.max(MIN_H, initial.height + dy)
      if (handle.includes("w")) {
        w = Math.max(MIN_W, initial.width - dx)
        x = initial.x + (initial.width - w)
      }
      if (handle.includes("n")) {
        h = Math.max(MIN_H, initial.height - dy)
        y = initial.y + (initial.height - h)
      }

      if (element.anchorMode === "page") {
        x = clamp(x, 0, PAGE_W - w)
        y = clamp(y, 0, PAGE_H - h)
      }
      updateFloatingElement(element.id, {
        x: snapToGrid ? snap(x) : x,
        y: snapToGrid ? snap(y) : y,
        width: snapToGrid ? snap(w) : w,
        height: snapToGrid ? snap(h) : h,
      })
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const sortedPageFloating = floatingElements
    .filter((item) => item.anchorMode === "page")
    .slice()
    .sort((a, b) => a.zIndex - b.zIndex)

  return (
    <main className="flex-1 bg-canvas p-8 overflow-auto">
      <div className="min-h-full flex items-start justify-center">
        <div
          className="bg-card shadow-lg rounded-sm relative"
          style={{ width: `${PAGE_W}px`, minHeight: `${PAGE_H}px`, aspectRatio: "1 / 1.414", fontFamily: documentSettings.fontFamily }}
          onMouseDown={() => {
            if (selection.kind === "flow") selectFlowBlock(null)
            if (selection.kind === "floating") selectFloatingElement(null)
          }}
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={flowBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <div className="p-8 flex flex-col">
                {flowBlocks.map((block, index) => {
                  const isLast = index === flowBlocks.length - 1
                  const marginBottomPx = isLast ? 0 : resolveFlowBlockSpacingAfterPx(block, documentSettings)
                  const blockRadiusTw = flowBlockRadiusTwClass(resolveFlowBlockCornersForBlock(block, documentSettings))
                  const blockFloating = floatingElements
                    .filter((item) => item.anchorMode === "block" && item.anchorTargetId === block.id)
                    .slice()
                    .sort((a, b) => a.zIndex - b.zIndex)
                  return (
                    <SortableFlowBlock
                      key={block.id}
                      id={block.id}
                      label={flowBlockInspectorLabel(block.type)}
                      isSelected={selection.kind === "flow" && selection.id === block.id}
                      onClick={() => selectFlowBlock(block.id)}
                      blockRadiusTw={blockRadiusTw}
                      marginBottomPx={marginBottomPx}
                    >
                      {renderFlowBlock(block, documentSettings.primaryColor, documentSettings.baseFontSize, blockRadiusTw)}
                      {blockFloating.map((element) => (
                        <FloatingNode
                          key={element.id}
                          element={element}
                          selected={selection.kind === "floating" && selection.id === element.id}
                          onMouseDown={(e) => onFloatingMoveStart(e, element)}
                          onResizeStart={(e, handle) => onFloatingResizeStart(e, element, handle)}
                        />
                      ))}
                    </SortableFlowBlock>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>

          {sortedPageFloating.map((element) => (
            <FloatingNode
              key={element.id}
              element={element}
              selected={selection.kind === "floating" && selection.id === element.id}
              onMouseDown={(e) => onFloatingMoveStart(e, element)}
              onResizeStart={(e, handle) => onFloatingResizeStart(e, element, handle)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
