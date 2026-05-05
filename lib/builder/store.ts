"use client"

import { create } from "zustand"
import { createDefaultBlock, createDefaultFloatingElement, initialBuilderState } from "@/lib/builder/default-template"
import type { BuilderState, FloatingElementType, FlowBlock, FlowBlockType } from "@/lib/builder/types"

interface BuilderActions {
  setTitle: (title: string) => void
  setDocumentSettings: (partial: Partial<BuilderState["documentSettings"]>) => void
  addFlowBlock: (type: FlowBlockType) => void
  updateFlowBlock: (id: string, updater: (block: FlowBlock) => FlowBlock) => void
  updateDynamicTableProps: (id: string, partial: Partial<Extract<FlowBlock, { type: "dynamic-table" }>["props"]>) => void
  removeFlowBlock: (id: string) => void
  reorderFlowBlocks: (fromIndex: number, toIndex: number) => void
  addFloatingElement: (type: FloatingElementType) => void
  updateFloatingElement: (id: string, partial: Partial<BuilderState["floatingElements"][number]>) => void
  removeFloatingElement: (id: string) => void
  nudgeFloatingElement: (id: string, dx: number, dy: number) => void
  bringFloatingForward: (id: string) => void
  sendFloatingBackward: (id: string) => void
  bringFloatingToFront: (id: string) => void
  sendFloatingToBack: (id: string) => void
  selectFlowBlock: (id: string | null) => void
  selectFloatingElement: (id: string | null) => void
  clearSelection: () => void
  loadFromTemplate: (state: BuilderState) => void
}

type BuilderStore = BuilderState & BuilderActions

export const useBuilderStore = create<BuilderStore>((set) => ({
  ...initialBuilderState,
  setTitle: (title) =>
    set((state) => ({
      documentSettings: {
        ...state.documentSettings,
        title,
      },
    })),
  setDocumentSettings: (partial) =>
    set((state) => ({
      documentSettings: {
        ...state.documentSettings,
        ...partial,
      },
    })),
  addFlowBlock: (type) =>
    set((state) => {
      const block = createDefaultBlock(type)
      return {
        flowBlocks: [...state.flowBlocks, block],
        selection: {
          kind: "flow",
          id: block.id,
        },
      }
    }),
  updateFlowBlock: (id, updater) =>
    set((state) => ({
      flowBlocks: state.flowBlocks.map((block) => (block.id === id ? updater(block) : block)),
    })),
  updateDynamicTableProps: (id, partial) =>
    set((state) => ({
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
    })),
  removeFlowBlock: (id) =>
    set((state) => ({
      flowBlocks: state.flowBlocks.filter((block) => block.id !== id),
      selection: state.selection.id === id ? { kind: null, id: null } : state.selection,
    })),
  reorderFlowBlocks: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.flowBlocks]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { flowBlocks: next }
    }),
  addFloatingElement: (type) =>
    set((state) => {
      const element = createDefaultFloatingElement(type)
      return {
        floatingElements: [...state.floatingElements, element],
        selection: {
          kind: "floating",
          id: element.id,
        },
      }
    }),
  updateFloatingElement: (id, partial) =>
    set((state) => ({
      floatingElements: state.floatingElements.map((element) =>
        element.id === id ? { ...element, ...partial } : element
      ),
    })),
  removeFloatingElement: (id) =>
    set((state) => ({
      floatingElements: state.floatingElements.filter((element) => element.id !== id),
      selection: state.selection.id === id ? { kind: null, id: null } : state.selection,
    })),
  nudgeFloatingElement: (id, dx, dy) =>
    set((state) => ({
      floatingElements: state.floatingElements.map((element) =>
        element.id === id ? { ...element, x: element.x + dx, y: element.y + dy } : element
      ),
    })),
  bringFloatingForward: (id) =>
    set((state) => ({
      floatingElements: state.floatingElements.map((element) =>
        element.id === id ? { ...element, zIndex: element.zIndex + 1 } : element
      ),
    })),
  sendFloatingBackward: (id) =>
    set((state) => ({
      floatingElements: state.floatingElements.map((element) =>
        element.id === id ? { ...element, zIndex: element.zIndex - 1 } : element
      ),
    })),
  bringFloatingToFront: (id) =>
    set((state) => {
      const maxZ = state.floatingElements.reduce((max, item) => Math.max(max, item.zIndex), 0)
      return {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, zIndex: maxZ + 1 } : element
        ),
      }
    }),
  sendFloatingToBack: (id) =>
    set((state) => {
      const minZ = state.floatingElements.reduce((min, item) => Math.min(min, item.zIndex), 0)
      return {
        floatingElements: state.floatingElements.map((element) =>
          element.id === id ? { ...element, zIndex: minZ - 1 } : element
        ),
      }
    }),
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
    set({
      documentSettings: state.documentSettings,
      flowBlocks: state.flowBlocks,
      floatingElements: state.floatingElements,
      selection: {
        kind: null,
        id: null,
      },
    }),
}))

