# React Paper v2 — Architecture & Rewrite Plan

## 1. Diagnosis of Previous Architecture (v1)

After reviewing the current codebase (`Paper.tsx`, `Paginator.tsx`, `Page.tsx`, `Level.tsx`, `getStyle.ts`), the root causes of the usability, fragility, and scalability issues come down to five architectural bottlenecks:

### 1.1 Manual CSS Box-Model Reconstruction (`getStyle.ts` + `Paginator.tsx`)
In `Paginator.tsx` and `getStyle.ts`, the library attempts to calculate vertical positions by calling `window.getComputedStyle(el)` inside the pagination loop and manually adding `marginTop`, `borderTop`, `paddingTop`, `contentBox`, `paddingBottom`, `borderBottom`, `marginBottom`, and `rowGap`, while manually emulating CSS margin collapsing.
- **Why this is fragile:** If a user adds padding, border, margin, or CSS Grid/Flexbox to *any* intermediate wrapper DOM element that wasn't registered via `useRegister()`, the manual sum drifts from the browser's actual layout, slicing lines of text in half or overflowing pages.
- **Why DX suffers:** Users must wrap every layout tier in `<Root element={...}>`, `<Level>`, `<Node element={...}>`, and attach `{...register()}` to specific DOM elements while obeying strict CSS rules.

### 1.2 O(P × N) Content Duplication & Viewport Clipping (`Page.tsx`)
In `Page.tsx`, whenever a `<Root>` spans multiple pages, the **entire React element tree** is cloned on every page slice and shifted vertically via `position: relative; top: -upperBound` inside an `overflow: hidden; maxHeight: lowerBound - upperBound` container.
- **Performance bottleneck:** A 5-page document mounts 5 copies of the component tree, running React hooks and rendering hidden DOM nodes repeatedly.
- **Accessibility & UX issues:** Duplicated DOM nodes break cross-page text selection, duplicate `id` attributes, and leak partially clipped descenders/ascenders when line heights aren't uniform integers.

### 1.3 Strict Child Introspection (`Paper.tsx`, `Level.tsx`)
`Paper.tsx` and `Level.tsx` inspect `child.type === Column`, `child.type === Root`, `child.type === Node` and pass JSX via an `element` prop instead of standard `children`. This prevents normal React composition (custom wrapper components, conditionals, fragments, or standard HTML trees).

### 1.4 Hardcoded A4 Dimensions & Brittle Print CSS (`Dimension.tsx`, `print.css`)
- `Dimension.tsx` hardcodes A4 portrait (`297 * 3.78` × `210 * 3.78` px) with no support for `Letter`, custom page sizes, landscape orientation, or configurable page margins.
- `print.css` relies on `html, body, body * { visibility: hidden }` and `.rp-container { position: absolute; top: 0 }`, which frequently produces extra blank pages or clipped print output when the host application has its own scroll containers or layout styles.

### 1.5 Untestable Coupling to Live Browser Layout
Because pagination state (`useReducer` in `Paginator.tsx`) interleaves DOM style reads (`window.getComputedStyle`), React refs, and `ResizeObserver` callbacks inside the allocation algorithm, the core pagination logic cannot be unit-tested in Node without a browser.

---

## 2. Proposed Architecture for v2: Single Package, Headless Core + Thin React Client

We will keep **a single package (`@joaopmo/react-paper`)** with zero external runtime dependencies (only `react` and `react-dom` as peer dependencies), organized internally into a pure TypeScript headless core and a thin React client exposed via clean subpath exports:
- `@joaopmo/react-paper` — Main entry point (React components, hooks, and re-exported core types)
- `@joaopmo/react-paper/core` — Framework-agnostic headless measurement & pagination engine
- `@joaopmo/react-paper/css/base` & `@joaopmo/react-paper/css/print` — Modern stylesheet exports

---

## 3. Architectural Ideas Borrowed from `@chenglou/pretext` (Zero External Dependency)

Studying [`@chenglou/pretext`](https://github.com/chenglou/pretext) (specifically its `RESEARCH.md` and pipeline architecture) highlights several key engineering principles we can adapt directly for full DOM + text layout without adding `pretext` as a dependency:

### 3.1 Strict `prepare()` vs. `layout()` Two-Phase Separation
- **The Pretext Insight:** Interleaving DOM reads with layout calculations causes layout thrashing, cascading observer loops, and untestable code. Pretext splits work into `prepare()` (extracting raw width/break measurements once into plain arrays/numbers) and `layout()` (pure, side-effect-free arithmetic over those numbers).
- **How We Apply It in `react-paper`:**
  1. **Phase 1 — `measureLayoutTree(rootElement)` (`prepare`):** Reads the rendered geometry of nodes in a single batch read (`getBoundingClientRect()` for blocks/containers and `Range.getClientRects()` for text line boxes) and produces a plain, serializable **`PreparedNodeTree`** containing only relative coordinates, heights, and break opportunities. Zero DOM writes happen here.
  2. **Phase 2 — `paginateTree(preparedTree, pageGeometry)` (`layout`):** A 100% pure TypeScript function that takes `PreparedNodeTree` + `PageGeometry` and computes the page allocation plan using pure arithmetic. It never touches `Element`, `window`, or `getComputedStyle`.

### 3.2 Non-Materializing Cursors & Slice Ranges
- **The Pretext Insight:** Allocating/cloning objects or strings during line-breaking is expensive. Pretext's `walkLineRanges()` emits lightweight `{ start, end }` cursors first, and only materializes the slices needed for rendering.
- **How We Apply It in `react-paper`:**
  - The pagination solver outputs lightweight **`FragmentSlice`** descriptors (`{ nodeId, kind: 'full' | 'container' | 'lines', startOffset, endOffset, fragmentPosition: 'single' | 'start' | 'middle' | 'end' }`).
  - Only the React rendering layer materializes the actual React elements for each page based on the slice descriptors.

### 3.3 Direct Dependency Flow (Eliminating Cascade Loops)
- In v1, `Paginator.tsx` had a chain of `ResizeObserver` → `setLastChanges` → `useEffect` → `setLoading(true)` → `dispatch('resize')` → `useEffect` → `setLoading(false)`, causing multiple render passes and spinner flashes.
- In v2, measurement and pagination run synchronously inside `useLayoutEffect` before browser paint: when content or container size changes, we batch-read the Staging DOM, run `paginateTree()`, and commit the resulting `PaginatedDocument` in a single update—eliminating loading spinners for normal edits.

### 3.4 Exact Line-Box Geometry via Native DOM `Range.getClientRects()`
- Why did v1 require every registered text element to have a strict `line-height` and zero internal padding? Because it guessed line breaks using `freeHeight - (freeHeight % lineHeight)`.
- Instead of guessing from `line-height` or reimplementing a font engine in JS, our `measureLayoutTree()` phase inspects text-containing blocks using a shared DOM `Range` (`range.selectNodeContents(textNode); range.getClientRects()`).
- The browser's own layout engine gives us the exact `[top, bottom]` vertical bounds of every wrapped line—even when a paragraph contains bold text, links, inline badges, or varying line heights!

---

## 4. Generic Document Layout & Fragmentation Primitives

To keep the library a **general-purpose document layout engine** (suitable for reports, invoices, contracts, articles, and resumes alike) while still making complex visuals (like cross-page timelines, callout boxes, tables, or full-bleed sidebars) effortless to build in userland, v2 will build on **standard CSS Fragmentation Level 3 concepts**:

### 4.1 Container Fragmentation & Fragment Metadata (`boxDecorationBreak` & `useFragment`)
Instead of duplicating the entire `<Root>` tree on every page and shifting it with `top: -upperBound`, v2 splits **containers around their allocated children**:
- If a `<Block>` (or `<Section>`) contains 6 child items, and items 1–3 fit on Page 1 while items 4–6 flow to Page 2:
  - Page 1 renders the `<Block>` wrapper containing **only** items 1–3.
  - Page 2 renders the `<Block>` wrapper containing **only** items 4–6.
- **Generic Fragment Styling (`data-rp-fragment` + `useFragment()`):**
  - Every fragmented container automatically receives `data-rp-fragment="single" | "start" | "middle" | "end"` and `data-rp-fragment-index`.
  - **CSS `box-decoration-break` support:** By default (or via prop), a split container can either `'slice'` its top/bottom padding and border at the page break or `'clone'` them on each page.
  - **How this unlocks advanced layouts generically:**
    - *Cross-page timeline or blockquote:* A generic `<Block>` with `border-left: 2px solid blue` automatically renders on Page 1 (around items 1–3) and continues on Page 2 (around items 4–6). Using `[data-rp-fragment="start"]` or `useFragment()`, the user can optionally render a fade-out/continuation indicator at the break!
    - *Split Cards / Callouts:* A bordered card that breaks across pages can hide `border-bottom` on `[data-rp-fragment="start"]` and hide `border-top` on `[data-rp-fragment="end"]`.
    - *Repeating Section Headers (e.g. "Experience (Continued)")*: Using `useFragment().isContinuation`, any multi-page section or table can render a continuation header on subsequent pages.

### 4.2 Semantic Break Controls (General-Purpose Pagination Rules)
Any element or `<Block>` supports standard pagination constraints:
- **`breakInside: 'avoid' | 'auto'`** — Atomic blocks (`avoid`) move intact to the next page if they don't fit; `auto` allows breaking between child blocks or text lines.
- **`breakBefore: 'auto' | 'page' | 'column'`** & **`breakAfter: 'auto' | 'page' | 'column'`** — Explicit page/column breaks (or `avoid` / `keepWithNext` so headings never orphan at the bottom of a page without at least the first child/line of the following block).
- **`orphans: number`** & **`widows: number`** — Minimum lines/items kept at the bottom of a page or pushed to the top of the next page.

### 4.3 Page Chrome & Layer Slots (`Header`, `Footer`, `PageUnderlay` / `PageOverlay`)
Instead of hardcoding layout templates, `<Document>` provides generic page-level slots that accept either static JSX or a render function `({ pageIndex, pageNumber, totalPages }) => ReactNode`:
- **`<Header mode="first" | "all" | "even-odd">` / `<Footer>`**: Participates in page flow at the top/bottom of the page.
- **`<PageUnderlay>` (or `background`) / `<PageOverlay>`**: Positioned behind or above the page flow (`position: absolute; inset: 0`).
  - *Generic use cases:* Full-bleed colored column backgrounds that span 100% of the page height on every page, watermarks (`"DRAFT"`), page borders, or corner page numbers.

---

## 5. Eliminating Full-Tree Duplication (Scaling to Many Pages)

How v2 avoids v1's O(P × N) duplication while still supporting arbitrary React components:

1. **Single Offscreen/Hidden Measurement Pass + Per-Page Targeted Mounting:**
   - Leaf blocks (`breakInside="avoid"`) are **only mounted on the single page where the solver places them**. If a document has 100 blocks across 10 pages, each page mounts ~10 blocks (total 100 mounted blocks across the document, vs. 10 × 100 = 1,000 in v1).
2. **Fine-Grained Splittable Text / Leaf Slicing:**
   - When a single splittable paragraph (measured via `Range.getClientRects()`) crosses a page boundary, **only that single paragraph** is rendered in a line-aligned clip window (`[startY, endY]` from the exact `Range` line rect coordinates) on the two pages it straddles—never the parent tree or sibling components.
3. **Optional Viewport Virtualization (`virtualize` prop):**
   - For long documents (10–100+ pages), `<Document virtualize>` renders lightweight `.rp-page` placeholder frames with exact dimensions for offscreen pages and only mounts the React subtree for pages inside the viewport (automatically un-virtualizing during print).

---

## 6. Developer Experience (DX) & React API Redesign

### 6.1 Natural JSX Composition (No More `element` Props or `useRegister`)

```tsx
import { Document, Header, Footer, Columns, Column, Block, useFragment } from '@joaopmo/react-paper';

function TimelineGroup({ title, children }) {
  const { isContinuation } = useFragment();
  return (
    <div className="timeline-group">
      <Block keepWithNext>
        <h2>{title} {isContinuation && '( cont. )'}</h2>
      </Block>
      <div className="timeline-rail">{children}</div>
    </div>
  );
}

export function MyDocument({ entries }) {
  return (
    <Document size="A4" orientation="portrait" padding="15mm" scale="fit-width">
      <Header mode="first">
        <DocumentBanner />
      </Header>

      <Columns widths={['30%', '70%']} gap="16px">
        <Column>
          <SidebarContent />
        </Column>

        <Column>
          {/* Container splits across pages around its children */}
          <Block breakInside="auto" as={TimelineGroup} title="History">
            {entries.map((entry) => (
              <Block key={entry.id} breakInside="avoid">
                <h3>{entry.heading}</h3>
                <p>{entry.summary}</p>
              </Block>
            ))}
          </Block>
        </Column>
      </Columns>

      <Footer>
        {({ pageNumber, totalPages }) => <span>Page {pageNumber} of {totalPages}</span>}
      </Footer>
    </Document>
  );
}
```

### 6.2 Zero-Wrapper Auto-Discovery via HTML / CSS Attributes
Users don't even have to import `<Block>` for every item if they prefer writing plain HTML/JSX:
- Inside a `<Column>` or `<Flow>`, standard elements can be annotated with `data-rp-break-inside="avoid | auto"`, `data-rp-keep-with-next`, or standard CSS (`break-inside: avoid`, `break-after: avoid`).
- By default, direct children of `<Column>` / `<Flow>` with `break-inside: avoid` are treated as atomic blocks, and elements with `data-rp-splittable` (or `<Block breakInside="auto">`) have their children/line-boxes measured for splitting.

---

## 7. Modern CSS & Print Engine

### 7.1 Page Sizes, Units, and Responsive Scaling
- **Page Presets & Custom Dimensions:** `'A3'`, `'A4'`, `'A5'`, `'Letter'`, `'Legal'`, or `{ width: string | number, height: string | number }`, plus `orientation: 'portrait' | 'landscape'` and configurable page `padding` / `margin`.
- **Canonical CSS Pixels (96 DPI):** All internal geometry is normalized to standard CSS pixels (`1mm = 96 / 25.4 px`, `1in = 96px`), decoupled from preview zoom scale.
- **Responsive Scaling:** Driven by `ResizeObserver` on the outer container (`scale: 'fit-width' | 'fit-page' | number`) using CSS custom properties (`--rp-page-width`, `--rp-page-height`, `--rp-scale`) without distorting internal DOM measurements.

### 7.2 Bulletproof Printing (`@media print` & `usePaperPrint`)
- Dynamically injects/updates `@page { size: <width> <height>; margin: 0; }` to match `<Document>` props.
- Replaces the fragile `body * { visibility: hidden }` rule with:
  1. Clean `@media print` styles using `break-after: page; break-inside: avoid; print-color-adjust: exact;`.
  2. A built-in **`usePaperPrint()`** hook / helper that can print the document via a clean print portal or isolated print iframe so host application scrollbars, modals, or `overflow: hidden` wrappers never truncate pages 2+.

---

## 8. Multi-Layer Testing Strategy (Inspired by Pretext's Harness)

### Layer 1: Fast Offline Unit & Corpus Tests (Vitest in Node — `< 50ms`)
- Because `src/core/paginate.ts` is 100% pure arithmetic over `PreparedNodeTree` (plain JS objects of heights and line rects), we can test all complex pagination logic in Node with **zero DOM or browser overhead**:
  - Multi-column allocation and asymmetric columns
  - `keepWithNext` chains (e.g., heading + subheading + first item pushed together when near page bottom)
  - Container fragmentation (`start`, `middle`, `end`, `single` states and container padding/border overhead on each split page)
  - Line splitting with `orphans` and `widows` constraints
  - Graceful fallback when a single atomic block is taller than an entire page
  - Large-scale stress tests (e.g. paginating 1,000 blocks across 50 pages in `< 2ms`)

### Layer 2: Browser Geometry & Integration Tests (Vitest Browser Mode / Playwright)
- Automated headless browser tests verifying `measureLayoutTree()` + React rendering:
  - Verifies that arbitrary CSS Grid, Flexbox, margins, borders, and nested wrappers (with **no** manual registration) are measured with 0px drift via `getBoundingClientRect()`.
  - Verifies that `Range.getClientRects()` accurately identifies wrapped text line boundaries and never slices a line of text horizontally.
  - Verifies dynamic updates (adding/removing items, resizing columns, toggling page sizes/orientations).

### Layer 3: Print & Multi-Page PDF Verification
- Uses Playwright's `page.emulateMedia({ media: 'print' })` to verify that multi-page documents render exact page counts with zero blank overflow pages.

---

## 9. Phased Implementation Roadmap

1. **Phase 1: Tooling & Package Modernization**
   - Update `package.json`, `tsconfig.json`, and `vite.config.ts` for subpath exports (`.`, `./core`, `./css/base`, `./css/print`), React 18/19 support, and Vitest setup.
2. **Phase 2: Headless Core (`src/core/`) & Unit Test Suite**
   - Implement page dimension & unit conversion utilities (`A4`, `Letter`, `mm`/`in`/`px`).
   - Define `PreparedNodeTree`, `LayoutConstraints`, and `PaginatedDocument` data structures.
   - Implement the pure `paginateTree()` solver (supporting atomic blocks, splittable containers, line-box ranges, `keepWithNext`, `orphans`/`widows`, multi-column, headers/footers).
   - Write comprehensive offline unit tests in Vitest covering all solver behaviors and edge cases.
3. **Phase 3: DOM Geometry Collector (`src/core/measure.ts`)**
   - Implement single-pass `getBoundingClientRect()` block/container measurer and `Range.getClientRects()` text line-box collector.
4. **Phase 4: React Client & Fragmentation Primitives (`src/react/`)**
   - Implement `<Document>`, `<Header>`, `<Footer>`, `<PageUnderlay>`, `<PageOverlay>`, `<Columns>`, `<Column>`, `<Flow>`, `<Block>`, `useFragment()`, `useDocument()`, and `usePaperPrint()`.
   - Maintain a clean migration path (or compatibility aliases if desired) and update CSS (`base.css`, `print.css`).
5. **Phase 5: Storybook Examples & Browser Integration Tests**
   - Build rich generic document & resume examples in Storybook (single-column, multi-column, cross-page timeline using `useFragment` / `data-rp-fragment`, dynamic editor) and run browser layout tests.
