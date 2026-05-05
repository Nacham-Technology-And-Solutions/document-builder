# Document Builder Development Plan

## Current State

- The app layout exists: `Navbar` + `LeftSidebar` + `Canvas` + `RightSidebar`.
- The current implementation is a static UI prototype:
  - Toolbox blocks are static and not interactive.
  - Canvas content is hardcoded.
  - Property controls are not bound to app state.
  - Save and export buttons are present but not wired.
- No centralized schema/store yet.
- No HTML/Blade export pipeline yet.
- No JSON template save/load lifecycle yet.

## Target Architecture

- Central state model for:
  - `documentSettings`
  - `flowBlocks`
  - `floatingElements`
  - `selection`
  - `history`
- Interactive editor runtime:
  - drag/reorder flow blocks
  - add/remove/select blocks
  - bound property inspector
- Separate render paths:
  - editor components (interactive)
  - export components (clean static markup)
- Two-pass export engine:
  - Pass 1: static markup generation
  - Pass 2: HTML packaging + Blade translation
- Template persistence:
  - export/import JSON
  - optional local autosave

## Phased Plan

### Phase 1 - Foundation + Typed Schema

- Define builder types in `lib/builder/types.ts`.
- Create centralized store in `lib/builder/store.ts` (Zustand).
- Seed with a default invoice template state.
- Bind global title/settings to store.
- Deliverable: canvas renders from state, not hardcoded JSX.

### Phase 2 - Canvas as Real Builder

- Replace static canvas with renderer map by block type.
- Add drag-and-drop and sortable flow block ordering.
- Add block insertion from toolbox.
- Add selection behavior and visual state.
- Deliverable: users can add, reorder, and select blocks.

### Phase 3 - Property Inspector Wiring

- Convert right panel into schema-driven controls per selected element.
- Implement dynamic table controls:
  - repeater key
  - item alias
  - columns/options
- Implement theme/typography controls.
- Implement floating element anchoring (`page` vs `block`) and position.
- Deliverable: property edits update the canvas live.

### Phase 4 - HTML Export Engine

- Build export-only component tree (no editor chrome).
- Implement `generateHtmlString(state)` with full HTML document output.
- Inject print-safe CSS and inline dependencies.
- Add base64 asset packing for images/SVGs.
- Wire `Export HTML` to download.
- Deliverable: single-file offline `.html` export.

### Phase 5 - Blade Export Translation

- Emit safe tokens during export render (`[[...]]`, loop markers).
- Add translator pass for:
  - loops -> `@foreach`
  - variables -> `{{ $... }}`
  - conditionals -> `@if` / `@endif`
- Wire `Export Blade` to download `.blade.php`.
- Deliverable: backend-ready Blade template export.

### Phase 6 - Save/Load + Hardening

- Wire `Save Draft` to JSON template export.
- Add JSON import/rehydration.
- Add schema versioning + validation/migration guards.
- Validate for invoice, receipt, and proforma variants.
- Deliverable: reusable editable template workflow.

### Phase 7 - Polish + Reliability

- Add SVG pattern/background library and color injection.
- Add undo/redo history + keyboard shortcuts.
- Add end-to-end checks:
  - create/edit
  - export HTML/Blade
  - save/load JSON
- Deliverable: MVP ready for review and integration.

## First Sprint Priority Order

1. Schema + store
2. Canvas renderer from state
3. Add/reorder/select blocks
4. Property inspector binding
5. HTML export
6. Blade export
7. Save/load JSON

## Early Risks to Manage

- Blade translation correctness (especially nested logic).
- Print/PDF compatibility of exported markup/CSS.
- Anchor behavior when dynamic tables expand.
- Strict separation between editor styling and export styling.
