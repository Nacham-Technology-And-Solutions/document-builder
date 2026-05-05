"use client"

import { create } from "zustand"
import { createDefaultBlock, initialBuilderState } from "@/lib/builder/default-template"
import type { BuilderState, FlowBlock, FlowBlockType } from "@/lib/builder/types"

interface BuilderActions {
  setTitle: (title: string) => void
  setDocumentSettings: (partial: Partial<BuilderState["documentSettings"]>) => void
  addFlowBlock: (type: FlowBlockType) => void
  updateFlowBlock: (id: string, updater: (block: FlowBlock) => FlowBlock) => void
  updateDynamicTableProps: (id: string, partial: Partial<Extract<FlowBlock, { type: "dynamic-table" }>["props"]>) => void
  removeFlowBlock: (id: string) => void
  reorderFlowBlocks: (fromIndex: number, toIndex: number) => void
  selectFlowBlock: (id: string | null) => void
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
  selectFlowBlock: (id) =>
    set({
      selection: {
        kind: id ? "flow" : null,
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

