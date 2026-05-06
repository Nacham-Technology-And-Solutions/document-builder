import {
  resolveBannerJustify,
  resolveHeaderBannerLeftLines,
  resolveHeaderBannerRightLines,
  resolveHeadingWeight,
  resolveRightColumnFontSize,
  resolveSubtitleFontSize,
} from "@/lib/builder/header-banner-utils"
import { inlineRichTextToSafeHtml } from "@/lib/builder/inline-rich-text"
import { getTotalsRows } from "@/lib/builder/totals-block-utils"
import type { BuilderState, FloatingElement, FlowBlock } from "@/lib/builder/types"
import { buildLoopEndMarker, buildLoopStartMarker } from "@/lib/builder/export/token-utils"

const alignCss: Record<string, string> = {
  left: "left",
  center: "center",
  right: "right",
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const renderFlowBlockHtml = (block: FlowBlock, baseFontSize: number) => {
  switch (block.type) {
    case "header-banner": {
      const p = block.props
      const leftLines = resolveHeaderBannerLeftLines(p)
      const rightLines = resolveHeaderBannerRightLines(p)
      const centered = resolveBannerJustify(p) === "center"
      const justifyCss = centered ? "center" : "space-between"
      const dirCss = p.swapColumns ? "row-reverse" : "row"
      const gap = typeof p.columnGap === "number" ? p.columnGap : 12
      const px = typeof p.paddingX === "number" ? p.paddingX : 24
      const py = typeof p.paddingY === "number" ? p.paddingY : 24
      const subFs = resolveSubtitleFontSize(p, baseFontSize)
      const rightFs = resolveRightColumnFontSize(p, baseFontSize)
      const wHeading = resolveHeadingWeight(p)
      const leftAlign = p.leftTextAlign ?? "left"
      const rightAlign = p.rightTextAlign ?? "right"
      const innerPad = `padding:${py}px ${px}px`
      const flexChildren = centered ? "max-width:50%;" : "flex:1 1 0;min-width:0;"

      const leftHtml = `
    <div style="${flexChildren}text-align:${leftAlign};box-sizing:border-box;">
      <h1 style="margin:0;font-size:${p.headingFontSize}px;font-weight:${wHeading};color:${escapeHtml(p.textColor)};">${escapeHtml(p.heading)}</h1>
      ${leftLines
        .map(
          (line, idx) =>
            `<p style="margin:${idx === 0 ? "6px" : "4px"} 0 0;font-size:${subFs}px;color:${escapeHtml(p.mutedTextColor)};">${inlineRichTextToSafeHtml(line)}</p>`
        )
        .join("")}
    </div>`
      const rightHtml = `
    <div style="${flexChildren}text-align:${rightAlign};box-sizing:border-box;">
      ${rightLines
        .map(
          (line, idx) =>
            `<p style="margin:${idx === 0 ? "0" : "4px"} 0 0;font-size:${rightFs}px;color:${escapeHtml(p.mutedTextColor)};">${inlineRichTextToSafeHtml(line)}</p>`
        )
        .join("")}
    </div>`

      return `
<section class="block card banner" style="background:${escapeHtml(p.backgroundColor)};border-color:${escapeHtml(p.backgroundColor)};color:${escapeHtml(p.textColor)};">
  <div class="banner-content" style="${innerPad};display:flex;flex-direction:${dirCss};align-items:center;justify-content:${justifyCss};gap:${gap}px;box-sizing:border-box;">
    ${leftHtml}
    ${rightHtml}
  </div>
</section>`
    }
    case "invoice-meta-grid":
      return `
<section class="block card">
  <div class="grid-2">
    <div>
      <p class="label" style="color:${escapeHtml(block.props.labelColor)};">${escapeHtml(block.props.billToLabel)}</p>
      ${block.props.leftLines.map((line) => `<p style="color:${escapeHtml(block.props.textColor)};">${inlineRichTextToSafeHtml(line)}</p>`).join("")}
    </div>
    <div>
      <p class="label" style="color:${escapeHtml(block.props.labelColor)};">${escapeHtml(block.props.payToLabel)}</p>
      ${block.props.rightLines.map((line) => `<p style="color:${escapeHtml(block.props.textColor)};">${inlineRichTextToSafeHtml(line)}</p>`).join("")}
    </div>
  </div>
</section>`
    case "dynamic-table":
      const loopStart = buildLoopStartMarker(block.props.repeaterKey, block.props.itemAlias)
      const loopEnd = buildLoopEndMarker()
      return `
<section class="block card table-wrap" style="border-color:${escapeHtml(block.props.borderColor)};">
  <table style="font-size:${block.props.fontSize}px;">
    <thead>
      <tr style="background:${escapeHtml(block.props.headerBackgroundColor)};">
        ${block.props.columns
          .map((column) => `<th style="text-align:${alignCss[column.align] ?? "left"};color:${escapeHtml(block.props.headerTextColor)};">${escapeHtml(column.label)}</th>`)
          .join("")}
      </tr>
    </thead>
    <tbody>
      ${loopStart}
      <tr>
        ${block.props.columns
          .map(
            (column) =>
              `<td style="text-align:${alignCss[column.align] ?? "left"};color:${escapeHtml(block.props.rowTextColor)};">{{ ${block.props.itemAlias}.${column.key} }}</td>`
          )
          .join("")}
      </tr>
      ${loopEnd}
    </tbody>
  </table>
</section>`
    case "totals-block": {
      const rows = getTotalsRows(block.props)
      const rowsHtml = rows
        .map((row) => {
          const isGrand = row.variant === "grand-total"
          const cls = isGrand ? "line total" : "line"
          const borderStyle = isGrand ? ` style="border-color:${escapeHtml(block.props.accentColor)};"` : ""
          return `<div class="${cls}"${borderStyle}><span style="color:${escapeHtml(block.props.labelColor)};">${escapeHtml(row.label)}</span><span style="color:${escapeHtml(block.props.valueColor)};">${escapeHtml(row.value)}</span></div>`
        })
        .join("")
      return `
<section class="block totals-wrap">
  <div class="card totals">${rowsHtml}
  </div>
</section>`
    }
    case "footer-block":
      return `
<section class="block card">
  <p class="footer-title" style="color:${escapeHtml(block.props.headingColor)};">${escapeHtml(block.props.heading)}</p>
  ${block.props.lines.map((line) => `<p style="color:${escapeHtml(block.props.textColor)};">${inlineRichTextToSafeHtml(line)}</p>`).join("")}
</section>`
    case "custom-html":
      return `
<section class="block card">
  <p class="footer-title">${escapeHtml(block.props.label)}</p>
  ${block.props.css ? `<style>${block.props.css}</style>` : ""}
  ${block.props.html}
</section>`
  }
}

const renderFloatingElementHtml = (element: FloatingElement) => {
  const style = `position:absolute;left:${element.x}px;top:${element.y}px;width:${element.width}px;height:${element.height}px;z-index:${element.zIndex};transform:rotate(${element.rotation ?? 0}deg);transform-origin:center center;`

  if (element.type === "image") {
    if (element.src) {
      return `<div style="${style}"><img src="${escapeHtml(element.src)}" alt="${escapeHtml(element.content || "image")}" style="width:100%;height:100%;object-fit:${element.fit || "contain"};" /></div>`
    }
    return `<div style="${style}border:1px dashed #cbd5e1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#64748b;">${escapeHtml(
      element.content || "Upload logo"
    )}</div>`
  }

  if (element.type === "text") {
    return `<div style="${style}display:flex;align-items:center;padding:0 8px;border:1px solid #e5e7eb;border-radius:6px;background:rgba(255,255,255,.9);font-size:14px;">${escapeHtml(
      element.content || ""
    )}</div>`
  }

  if (element.type === "stamp") {
    return `<div style="${style}display:flex;align-items:center;justify-content:center;"><div style="width:100%;height:100%;border-radius:9999px;border:4px solid #10b981;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.8);font-weight:700;color:#10b981;">${escapeHtml(
      element.content || "PAID"
    )}</div></div>`
  }

  return `<div style="${style}border-radius:8px;background:radial-gradient(circle at 1px 1px, rgba(30,41,59,0.22) 1px, transparent 0), linear-gradient(135deg, rgba(51,65,85,0.12), rgba(59,130,246,0.08));background-size:10px 10px, auto;"></div>`
}

const baseStyles = (state: BuilderState) => `
* { box-sizing: border-box; }
body { margin: 0; background: #f5f5f5; padding: 24px; font-family: ${state.documentSettings.fontFamily}; }
.document-wrapper { position: relative; overflow: hidden; width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; color: #111827; font-size: ${state.documentSettings.baseFontSize}px; padding: 24px; }
.block { margin-bottom: 16px; }
.card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; }
.banner { background: ${state.documentSettings.primaryColor}; border-color: ${state.documentSettings.primaryColor}; color: #fff; }
.banner-content { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.banner h1 { margin: 0; font-size: 24px; }
.banner p { margin: 4px 0 0; opacity: 0.95; }
.right { text-align: right; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
.table-wrap { padding: 0; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead tr { background: #f8fafc; }
th, td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
.hint-row { background: #f8fafc; color: #6b7280; font-style: italic; }
.totals-wrap { display: flex; justify-content: flex-end; }
.totals { width: 280px; }
.line { display: flex; justify-content: space-between; margin-bottom: 8px; }
.line.total { border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px; font-weight: 700; margin-bottom: 0; }
.footer-title { font-weight: 600; margin: 0 0 8px; }
@media print { body { padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .document-wrapper { margin: 0; } }
`

export const generateHtmlExport = (state: BuilderState) => {
  const baseFs = state.documentSettings.baseFontSize
  const blocksHtml = state.flowBlocks.map((block) => renderFlowBlockHtml(block, baseFs)).join("\n")
  const floatingHtml = state.floatingElements
    .slice()
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(renderFloatingElementHtml)
    .join("\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(state.documentSettings.title)}</title>
  <style>${baseStyles(state)}</style>
</head>
<body>
  <div class="document-wrapper">
${blocksHtml}
${floatingHtml}
  </div>
</body>
</html>`
}

export const downloadTextFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

