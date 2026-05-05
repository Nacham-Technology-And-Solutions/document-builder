import type { BuilderState, FlowBlock } from "@/lib/builder/types"
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

const renderFlowBlockHtml = (block: FlowBlock) => {
  switch (block.type) {
    case "header-banner":
      return `
<section class="block card banner">
  <div class="banner-content">
    <div>
      <h1>${escapeHtml(block.props.heading)}</h1>
      <p>${escapeHtml(block.props.companyNameToken)}</p>
    </div>
    <div class="right">
      <p>Invoice # ${escapeHtml(block.props.invoiceNumberToken)}</p>
      <p>${escapeHtml(block.props.dateToken)}</p>
    </div>
  </div>
</section>`
    case "invoice-meta-grid":
      return `
<section class="block card">
  <div class="grid-2">
    <div>
      <p class="label">${escapeHtml(block.props.billToLabel)}</p>
      ${block.props.leftLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </div>
    <div>
      <p class="label">${escapeHtml(block.props.payToLabel)}</p>
      ${block.props.rightLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </div>
  </div>
</section>`
    case "dynamic-table":
      const loopStart = buildLoopStartMarker(block.props.repeaterKey, block.props.itemAlias)
      const loopEnd = buildLoopEndMarker()
      return `
<section class="block card table-wrap">
  <table>
    <thead>
      <tr>
        ${block.props.columns
          .map((column) => `<th style="text-align:${alignCss[column.align] ?? "left"}">${escapeHtml(column.label)}</th>`)
          .join("")}
      </tr>
    </thead>
    <tbody>
      ${loopStart}
      <tr>
        ${block.props.columns
          .map(
            (column) =>
              `<td style="text-align:${alignCss[column.align] ?? "left"}">{{ ${block.props.itemAlias}.${column.key} }}</td>`
          )
          .join("")}
      </tr>
      ${loopEnd}
    </tbody>
  </table>
</section>`
    case "totals-block":
      return `
<section class="block totals-wrap">
  <div class="card totals">
    <div class="line"><span>Subtotal</span><span>${escapeHtml(block.props.subtotalToken)}</span></div>
    <div class="line"><span>${escapeHtml(block.props.taxLabel)}</span><span>${escapeHtml(block.props.taxToken)}</span></div>
    <div class="line total"><span>Total</span><span>${escapeHtml(block.props.totalToken)}</span></div>
  </div>
</section>`
    case "footer-block":
      return `
<section class="block card">
  <p class="footer-title">${escapeHtml(block.props.heading)}</p>
  ${block.props.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
</section>`
  }
}

const baseStyles = (state: BuilderState) => `
* { box-sizing: border-box; }
body { margin: 0; background: #f5f5f5; padding: 24px; font-family: ${state.documentSettings.fontFamily}; }
.document-wrapper { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; color: #111827; font-size: ${state.documentSettings.baseFontSize}px; padding: 24px; }
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
  const blocksHtml = state.flowBlocks.map(renderFlowBlockHtml).join("\n")

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

