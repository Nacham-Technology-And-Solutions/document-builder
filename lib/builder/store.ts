"use client"

import { create } from "zustand"
import { createDefaultBlock, createDefaultFloatingElement, initialBuilderState } from "@/lib/builder/default-template"
import { normalizeImportedFlowBlocks } from "@/lib/builder/dynamic-table-utils"
import type { BuilderState, FloatingElementType, FlowBlock, FlowBlockType } from "@/lib/builder/types"

interface BuilderActions {
  setTitle: (title: string) => void
  setDocumentSettings: (partial: Partial<BuilderState["documentSettings"]>) => void
  addFlowBlock: (type: FlowBlockType) => void
  updateFlowBlock: (id: string, updater: (block: FlowBlock) => FlowBlock) => void
  updateDynamicTableProps: (id: string, partial: Partial<Extract<FlowBlock, { type: "dynamic-table" }>["props"]>) => void
  removeFlowBlock: (id: string) => void
  reorderFlowBlocks: (fromIndex: number, toIndex: number) => void
  moveFlowBlockById: (id: string, direction: "up" | "down") => void
  addFloatingElement: (type: FloatingElementType) => void
  updateFloatingElement: (id: string, partial: Partial<BuilderState["floatingElements"][number]>) => void
  removeFloatingElement: (id: string) => void
  nudgeFloatingElement: (id: string, dx: number, dy: number) => void
  bringFloatingForward: (id: string) => void
  sendFloatingBackward: (id: string) => void
  bringFloatingToFront: (id: string) => void
  sendFloatingToBack: (id: string) => void
  alignFloatingElement: (id: string, alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => void
  selectFlowBlock: (id: string | null) => void
  selectFloatingElement: (id: string | null) => void
  clearSelection: () => void
  loadFromTemplate: (state: BuilderState) => void
  /** Replaces canvas state and clears undo/redo (e.g. new preset or imported file). */
  replaceBuilderState: (state: BuilderState) => void
  setSnapToGrid: (enabled: boolean) => void
  undo: () => void
  redo: () => void
}

type BuilderStore = BuilderState &
  BuilderActions & {
    past: BuilderState[]
    future: BuilderState[]
  }

const snapshotState = (state: BuilderStore): BuilderState => ({
  documentSettings: state.documentSettings,
  flowBlocks: state.flowBlocks,
  floatingElements: state.floatingElements,
  selection: state.selection,
  snapToGrid: state.snapToGrid,
})

const withHistory = (state: BuilderStore, patch: Partial<BuilderState>): Partial<BuilderStore> => ({
  ...patch,
  past: [...state.past, snapshotState(state)],
  future: [],
})

export const useBuilderStore = create<BuilderStore>((set) => ({
  ...initialBuilderState,
  past: [],
  future: [],
  setTitle: (title) =>
    set((state) =>
      withHistory(state, {
        documentSettings: {
          ...state.documentSettings,
          title,
        },
      })
    ),
  setDocumentSettings: (partial) =>
    set((state) =>
      withHistory(state, {
        documentSettings: {
          ...state.documentSettings,
          ...partial,
        },
      })
    ),
  addFlowBlock: (type) =>
    set((state) => {
      const block = createDefaultBlock(type)
      return withHistory(state, {
        flowBlocks: [...state.flowBlocks, block],
        selection: {
          kind: "flow",
          id: block.id,
        },
      })
    }),
  updateFlowBlock: (id, updater) =>
    set((state) =>
      withHistory(state, {
        flowBlocks: state.flowBlocks.map((block) => (block.id === id ? updater(block) : block)),
      })
    ),
  updateDynamicTableProps: (id, partial) =>
    set((state) =>
      withHistory(state, {
        flowBlocks: state.flowBlocks.map((block) => {
          if (block.id !== id || block.type !== "dynamic-table") return block
          return {
            ...block,
            props: {
              ...block.props,
              ...partial,
            },
          }
        }),
      })
    ),
  removeFlowBlock: (id) =>
    set((state) =>
      withHistory(state, {
        flowBlocks: state.flowBlocks.filter((block) => block.id !== id),
        selection: state.selection.id === id ? { kind: null, id: null } : state.selection,
      })
    ),
  reorderFlowBlocks: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.flowBlocks]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return withHistory(state, { flowBlocks: next })
    }),
  moveFlowBlockById: (id, direction) =>
    set((state) => {
      const idx = state.flowBlocks.findIndex((block) => block.id === id)
      if (idx < 0) return {}
      const to = direction === "up" ? idx - 1 : idx + 1
      if (to < 0 || to >= state.flowBlocks.length) return {}
      const next = [...state.flowBlocks]
      const [moved] = next.splice(idx, 1)
      next.splice(to, 0, moved)
      return withHistory(state, { flowBlocks: next })
    }),
  addFloatingElement: (type) =>
    set((state) => {
      const element = createDefaultFloatingElement(type)
      return withHistory(state, {
        floatingElements: [...state.floatingElements, element],
        selection: {
          kind: "floating",
          id: element.id,
        },
      })
    }),
  updateFloatingElement: (id, partial) =>
    set((state) =>
      withHistory(state, {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, ...partial } : element
        ),
      })
    ),
  removeFloatingElement: (id) =>
    set((state) =>
      withHistory(state, {
        floatingElements: state.floatingElements.filter((element) => element.id !== id),
        selection: state.selection.id === id ? { kind: null, id: null } : state.selection,
      })
    ),
  nudgeFloatingElement: (id, dx, dy) =>
    set((state) =>
      withHistory(state, {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, x: element.x + dx, y: element.y + dy } : element
        ),
      })
    ),
  bringFloatingForward: (id) =>
    set((state) =>
      withHistory(state, {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, zIndex: element.zIndex + 1 } : element
        ),
      })
    ),
  sendFloatingBackward: (id) =>
    set((state) =>
      withHistory(state, {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, zIndex: element.zIndex - 1 } : element
        ),
      })
    ),
  bringFloatingToFront: (id) =>
    set((state) => {
      const maxZ = state.floatingElements.reduce((max, item) => Math.max(max, item.zIndex), 0)
      return withHistory(state, {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, zIndex: maxZ + 1 } : element
        ),
      })
    }),
  sendFloatingToBack: (id) =>
    set((state) => {
      const minZ = state.floatingElements.reduce((min, item) => Math.min(min, item.zIndex), 0)
      return withHistory(state, {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, zIndex: minZ - 1 } : element
        ),
      })
    }),
  alignFloatingElement: (id, alignment) =>
    set((state) =>
      withHistory(state, {
        floatingElements: state.floatingElements.map((element) => {
          if (element.id !== id) return element
          let x = element.x
          let y = element.y
          if (alignment === "left") x = 0
          if (alignment === "center") x = Math.round((595 - element.width) / 2)
          if (alignment === "right") x = 595 - element.width
          if (alignment === "top") y = 0
          if (alignment === "middle") y = Math.round((842 - element.height) / 2)
          if (alignment === "bottom") y = 842 - element.height
          return { ...element, x, y }
        }),
      })
    ),
  selectFlowBlock: (id) =>
    set({
      selection: {
        kind: id ? "flow" : null,
        id,
      },
    }),
  selectFloatingElement: (id) =>
    set({
      selection: {
        kind: id ? "floating" : null,
        id,
      },
    }),
  clearSelection: () =>
    set({
      selection: {
        kind: null,
        id: null,
      },
    }),
  loadFromTemplate: (state) =>
    set((current) =>
      withHistory(current, {
        documentSettings: state.documentSettings,
        flowBlocks: normalizeImportedFlowBlocks(state.flowBlocks),
        floatingElements: state.floatingElements,
        selection: {
          kind: null,
          id: null,
        },
        snapToGrid: state.snapToGrid ?? true,
      })
    ),
  replaceBuilderState: (state) =>
    set({
      documentSettings: state.documentSettings,
      flowBlocks: normalizeImportedFlowBlocks(state.flowBlocks),
      floatingElements: state.floatingElements,
      selection: { kind: null, id: null },
      snapToGrid: state.snapToGrid ?? true,
      past: [],
      future: [],
    }),
  setSnapToGrid: (enabled) => set((state) => withHistory(state, { snapToGrid: enabled })),
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return {}
      const previous = state.past[state.past.length - 1]
      return {
        ...previous,
        past: state.past.slice(0, -1),
        future: [snapshotState(state), ...state.future],
      }
    }),
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return {}
      const [next, ...rest] = state.future
      return {
        ...next,
        past: [...state.past, snapshotState(state)],
        future: rest,
      }
    }),
}))

