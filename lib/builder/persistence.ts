import { initialBuilderState } from "@/lib/builder/default-template"
import type { BuilderState, PersistedTemplate } from "@/lib/builder/types"

const CURRENT_SCHEMA_VERSION = 1 as const

const isBuilderState = (value: unknown): value is BuilderState => {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<BuilderState>
  return (
    !!candidate.documentSettings &&
    Array.isArray(candidate.flowBlocks) &&
    Array.isArray(candidate.floatingElements) &&
    !!candidate.selection
  )
}

const isPersistedTemplate = (value: unknown): value is PersistedTemplate => {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<PersistedTemplate>
  return candidate.schemaVersion === 1 && typeof candidate.savedAt === "string" && isBuilderState(candidate.builderState)
}

export const serializeTemplate = (state: BuilderState): PersistedTemplate => {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    builderState: state,
  }
}

export const migrateTemplate = (value: unknown): PersistedTemplate => {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid template payload.")
  }

  const candidate = value as Record<string, unknown>

  if ("schemaVersion" in candidate) {
    if (!isPersistedTemplate(candidate)) {
      throw new Error("Unsupported template format.")
    }
    return candidate
  }

  if (isBuilderState(candidate)) {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      builderState: candidate,
    }
  }

  throw new Error("Invalid template schema.")
}

export const parseTemplate = (jsonString: string): PersistedTemplate => {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error("Template file is not valid JSON.")
  }

  const migrated = migrateTemplate(parsed)
  return {
    ...migrated,
    builderState: {
      ...initialBuilderState,
      ...migrated.builderState,
      documentSettings: {
        ...initialBuilderState.documentSettings,
        ...migrated.builderState.documentSettings,
      },
      selection: {
        kind: null,
        id: null,
      },
    },
  }
}

