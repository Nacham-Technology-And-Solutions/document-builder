import type { BuilderState } from "@/lib/builder/types"
import { generateHtmlExport } from "@/lib/builder/export/html-export"
import {
  convertSquareTokenToBlade,
  convertTokenToBlade,
  IF_END,
  IF_START,
  LOOP_END,
  LOOP_START,
  toPhpPath,
} from "@/lib/builder/export/token-utils"

export const generateBladeExport = (state: BuilderState) => {
  let html = generateHtmlExport(state)

  const loopStartRegex = new RegExp(`<!--\\[${LOOP_START}:([a-zA-Z0-9_.]+):([a-zA-Z0-9_]+)\\]-->`, "g")
  html = html.replace(loopStartRegex, (_match, collectionPath, alias) => {
    return `@foreach(${toPhpPath(collectionPath)} as $${alias})`
  })
  html = html.replace(new RegExp(`<!--\\[${LOOP_END}\\]-->`, "g"), "@endforeach")

  const ifStartRegex = new RegExp(`<!--\\[${IF_START}:([a-zA-Z0-9_.]+)\\]-->`, "g")
  html = html.replace(ifStartRegex, (_match, conditionPath) => {
    return `@if(${toPhpPath(conditionPath)})`
  })
  html = html.replace(new RegExp(`<!--\\[${IF_END}\\]-->`, "g"), "@endif")

  html = html.replace(/\[\[\s*([a-zA-Z0-9_.]+)\s*\]\]/g, (_match, tokenPath) => {
    return convertSquareTokenToBlade(`[[ ${tokenPath} ]]`)
  })

  html = html.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_match, tokenPath) => {
    return convertTokenToBlade(`{{ ${tokenPath} }}`)
  })

  return html
}

