/** Unicode sentinels — not escaped, used only while parsing. */
const PH = {
  open: "\uE000",
  close: "\uE001",
} as const

const phToken = (index: number) => `${PH.open}${index}${PH.close}`

export const escapeHtmlText = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

/** Protect `{{ tokens }}` so `_` / `*` inside tokens are never treated as markdown. */
function protectMustaches(input: string): { guarded: string; slots: string[] } {
  const slots: string[] = []
  const guarded = input.replace(/\{\{[\s\S]*?\}\}/g, (m) => {
    const i = slots.length
    slots.push(m)
    return phToken(i)
  })
  return { guarded, slots }
}

function restoreSlots(s: string, slots: string[]): string {
  let out = s
  for (let i = 0; i < slots.length; i++) {
    out = out.split(phToken(i)).join(slots[i])
  }
  return out
}

/**
 * Mini markup for template lines: `**bold**`, `*italic*` (single asterisk pairs).
 * Mustache tokens `{{ ... }}` are protected. Output is safe HTML (no arbitrary tags).
 */
export function inlineRichTextToSafeHtml(input: string): string {
  const { guarded, slots } = protectMustaches(input)
  const ph = guarded

  const sr = (fragment: string) => restoreSlots(fragment, slots)

  let out = ""
  let i = 0

  while (i < ph.length) {
    if (ph[i] === "*" && ph[i + 1] === "*") {
      const end = ph.indexOf("**", i + 2)
      if (end === -1) {
        out += escapeHtmlText(sr(ph.slice(i)))
        break
      }
      const inner = ph.slice(i + 2, end)
      out += "<strong>" + escapeHtmlText(sr(inner)) + "</strong>"
      i = end + 2
      continue
    }

    if (ph[i] === "*") {
      const end = ph.indexOf("*", i + 1)
      if (end === -1) {
        out += escapeHtmlText(sr(ph[i]))
        i += 1
        continue
      }
      const inner = ph.slice(i + 1, end)
      if (inner.length === 0) {
        out += escapeHtmlText(sr(ph[i]))
        i += 1
        continue
      }
      out += "<em>" + escapeHtmlText(sr(inner)) + "</em>"
      i = end + 1
      continue
    }

    let j = i
    while (j < ph.length) {
      const c = ph[j]
      if (c === "*" && j + 1 < ph.length && ph[j + 1] === "*") break
      if (c === "*") break
      j += 1
    }
    out += escapeHtmlText(sr(ph.slice(i, j)))
    i = j
  }

  return out
}

/** Markdown-lite paragraphs (one `<p>` per line). Optional CSS fragment for each `<p>`. */
export function multilineMarkdownToParagraphInnerHtml(raw: string, paragraphStyleCss = ""): string {
  if (!raw.trim()) return `<p style="margin:0;${paragraphStyleCss}">&nbsp;</p>`
  const lines = raw.split("\n")
  return lines
    .map((line, idx) => {
      const isLast = idx === lines.length - 1
      const marginBottom = isLast ? "0" : "4px"
      if (!line.trim()) {
        return `<p style="margin:4px 0 ${marginBottom};min-height:0.5em;${paragraphStyleCss}">&nbsp;</p>`
      }
      return `<p style="margin:${idx === 0 ? "0" : "4px"} 0 ${marginBottom};${paragraphStyleCss}">${inlineRichTextToSafeHtml(line)}</p>`
    })
    .join("")
}
