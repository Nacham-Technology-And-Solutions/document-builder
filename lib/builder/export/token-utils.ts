export const LOOP_START = "LOOP_START"
export const LOOP_END = "LOOP_END"
export const IF_START = "IF"
export const IF_END = "END_IF"

export const buildLoopStartMarker = (collectionPath: string, alias: string) =>
  `<!--[${LOOP_START}:${collectionPath}:${alias}]-->`

export const buildLoopEndMarker = () => `<!--[${LOOP_END}]-->`
export const buildIfStartMarker = (conditionPath: string) => `<!--[${IF_START}:${conditionPath}]-->`
export const buildIfEndMarker = () => `<!--[${IF_END}]-->`

export const toPhpPath = (path: string) => `$${path.replace(/\./g, "->")}`

export const convertTokenToBlade = (text: string) => {
  const tokenMatch = text.match(/^\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}$/)
  if (!tokenMatch) return text
  return `{{ ${toPhpPath(tokenMatch[1])} }}`
}

export const convertSquareTokenToBlade = (text: string) => {
  const tokenMatch = text.match(/^\[\[\s*([a-zA-Z0-9_.]+)\s*\]\]$/)
  if (!tokenMatch) return text
  return `{{ ${toPhpPath(tokenMatch[1])} }}`
}
