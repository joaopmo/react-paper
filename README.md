<p align="center">
  <img src="https://raw.githubusercontent.com/joaopmo/react-paper/main/.github/assets/logo-green.png" alt="React Paper Logo" />
</p>
<p align="center">
  <strong>React Paper</strong> is a React library and headless pagination engine for allocating React components into layouts that simulate physical paper sheets.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@joaopmo/react-paper"><img src="https://img.shields.io/npm/v/@joaopmo/react-paper.svg" alt="npm version" /></a>
  <a href="https://joaopmo.github.io/react-paper/"><img src="https://img.shields.io/badge/demo-live%20examples-brightgreen.svg" alt="Live Examples" /></a>
  <a href="https://github.com/joaopmo/react-paper/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" /></a>
</p>

---

## Table of Contents

- [Live Examples & Demo](#live-examples--demo)
- [Why React Paper?](#why-react-paper)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Building Complex Layouts](#building-complex-layouts)
  - [Multi-Column Layouts](#multi-column-layouts)
  - [Preventing Stranded Headings (`keepWithNext`)](#preventing-stranded-headings-keepwithnext)
  - [Splitting Paragraphs (`orphans` and `widows`)](#splitting-paragraphs-orphans-and-widows)
  - [Side-by-Side Synchronized Rows (`<Parallel>`)](#side-by-side-synchronized-rows-parallel)
  - [Split Containers & Continuations (`useFragment` and `continuationHeader`)](#split-containers--continuations-usefragment-and-continuationheader)
  - [Headers, Footers, and Dynamic Page Numbers](#headers-footers-and-dynamic-page-numbers)
  - [Page Underlays and Overlays](#page-underlays-and-overlays)
- [Paper Sizes & Printing](#paper-sizes--printing)
  - [Paper Sizes and Orientation](#paper-sizes-and-orientation)
  - [Visual Scaling and Previews](#visual-scaling-and-previews)
  - [Printing to PDF (`usePaperPrint`)](#printing-to-pdf-usepaperprint)
- [Performance & Reactivity](#performance--reactivity)
- [API Reference](#api-reference)
  - [\<Document /> / \<Paper />](#document---paper)
  - [\<Columns />](#columns)
  - [\<Column />](#column)
  - [\<Block />](#block)
  - [\<Section />](#section)
  - [\<Text />](#text)
  - [\<Parallel />](#parallel)
  - [\<KeepTogether />](#keeptogether)
  - [\<Header />](#header)
  - [\<Footer />](#footer)
  - [\<PageUnderlay /> & \<PageOverlay />](#pageunderlay---pageoverlay)
  - [useFragment()](#usefragment)
  - [usePageInfo()](#usepageinfo)
  - [useDocument()](#usedocument)
  - [usePaperPrint()](#usepaperprint)
  - [CSS Stylesheets & Classes](#css-stylesheets--classes)
- [V1 Compatibility Guide](#v1-compatibility-guide)
  - [Running Existing V1 Code](#running-existing-v1-code)
  - [Migrating from V1 to V2](#migrating-from-v1-to-v2)
- [Headless Core Engine (`@joaopmo/react-paper/core`)](#headless-core-engine-joaopmoreact-papercore)
- [License](#license)

---

## Live Examples & Demo

You can explore and interact with full-featured multi-page document examples on GitHub Pages:

👉 **[https://joaopmo.github.io/react-paper/](https://joaopmo.github.io/react-paper/)**

Available live fixtures in the interactive playground:
- **[Executive & Financial Report](https://joaopmo.github.io/react-paper/?example=executive-report)**: Corporate executive report with KPI sidebar, multi-page financial table, continuation headers, and underlay watermark.
- **[Academic Conference Research Paper](https://joaopmo.github.io/react-paper/?example=academic)**: Two-column IEEE/ACM conference format with abstract, theorem box, algorithm, SVG figures, and continuation headers.
- **[Creative Designer & Developer Portfolio](https://joaopmo.github.io/react-paper/?example=portfolio)**: Multi-page portfolio with full-bleed sidebar underlay, project continuation timeline rail, and running footer.
- **[Multi-Page Resume](https://joaopmo.github.io/react-paper/?example=resume)**: Two-page resume with sidebar underlay, continuation banners, and timeline rail.
- **[Project Timeline](https://joaopmo.github.io/react-paper/?example=timeline)**: Multi-page timeline with `keepWithNext` headings and continuation header.
- **[Memoization & React State Benchmark](https://joaopmo.github.io/react-paper/?example=memoization)**: Interactive state counter demonstrating sub-millisecond re-render performance and state preservation.

---

## Why React Paper?

Building multi-page printable documents in web applications (resumes, invoices, financial statements, contracts, research papers, and executive reports) is notoriously difficult:

1. **Browser CSS Print Limitations**: Standard CSS `@media print` offers no programmatic control over where page breaks fall, cannot synchronize multi-column content across page breaks, and cannot render dynamic page metadata such as `"Page X of Y"` or repeating continuation headers.
2. **Canvas and PDF Generators**: Alternative solutions like `@react-pdf/renderer` or `pdfmake` force you into a proprietary layout engine, sacrificing standard HTML/CSS, web fonts, CSS grid/flexbox, SVG icons, and interactive browser component state.

**React Paper delivers the best of both worlds**:
- Build your document using **standard React components, CSS, flexbox, and HTML elements**.
- React Paper automatically measures your DOM elements, computes clean page breaks, and allocates components onto pixel-perfect virtual sheets of paper.
- What you see on screen is **100% faithful to the printed output** when using `window.print()` or exporting to PDF.

---

## Features

- **Natural JSX Composition**: Compose multi-page documents declaratively with `<Document>`, `<Columns>`, `<Column>`, `<Section>`, `<Block>`, `<Text>`, and `<Parallel>` using standard React `children`—no manual registry hooks or element wrappers required.
- **Zero $O(P \times N)$ Tree Duplication**: Atomic blocks mount only on the specific page where they are placed. Containers split cleanly around their allocated children on each page.
- **CSS Fragmentation Controls**:
  - `keepWithNext` (`breakAfter="avoid"`): Guarantees section headings are never stranded alone at the bottom of a page.
  - `breakInside="avoid"`: Prevents cards, images, or signature blocks from breaking across page boundaries.
  - `orphans` and `widows`: Controls minimum line counts when splitting long text paragraphs.
  - `boxDecorationBreak`: Controls whether borders and padding are sliced at breaks (`slice`) or cloned across each fragment (`clone`).
- **Dynamic Headers, Footers & Layers**:
  - First-page, running, and continuation headers (`<Header mode="first" | "all" | "continuation">`).
  - Dynamic footers with page counters: `({ pageNumber, totalPages }) => ...`.
  - Full-bleed background underlays (`<PageUnderlay>`) and overlays (`<PageOverlay>`).
- **Continuation Handling & Fragment State**:
  - `useFragment()` hook gives every block access to its fragmentation state (`isFirst`, `isLast`, `isContinuation`, `isSplit`, `position`, `index`, `count`).
  - `continuationHeader` prop allows repeating table headers or rendering `"(continued)"` banners on subsequent pages.
- **Paper Formats & Print Styles**:
  - Standard ISO (`A3`, `A4`, `A5`) and North American (`Letter`, `Legal`) formats, plus custom millimeter, inch, or pixel dimensions.
  - Portrait and landscape orientations.
  - Interactive preview scaling (`scale="fit-width"`, `scale="auto"`, or explicit scale ratio).
  - Production-ready print styles with `@joaopmo/react-paper/css/print`.
- **100% Backwards-Compatible**: Existing V1 code (`<Paper>`, `<Root>`, `<Level>`, `<Node>`, `useRegister()`) runs directly without changes.
- **Headless Core Engine**: The pure arithmetic pagination solver is decoupled from React under `@joaopmo/react-paper/core` for server-side layout and automated testing.

---

## Installation

Install the library using your preferred package manager:

```bash
# npm
npm install @joaopmo/react-paper

# pnpm
pnpm add @joaopmo/react-paper

# yarn
yarn add @joaopmo/react-paper
```

Ensure `react` and `react-dom` (v18 or v19) are installed in your project:

```bash
npm install react react-dom
```

---

## Quick Start

In general, your document uses `<Document>`, `<Columns>`, `<Column>`, and one or more `<Block>` or `<Section>` components, along with the `@joaopmo/react-paper/css/base` stylesheet:

```tsx
import React from 'react';
import {
  Document,
  Columns,
  Column,
  Section,
  Block,
  Text,
  Footer,
} from '@joaopmo/react-paper';

// Import essential base styles and optional print stylesheet
import '@joaopmo/react-paper/css/base';
import '@joaopmo/react-paper/css/print';

export function InvoiceDocument() {
  return (
    <Document size="A4" orientation="portrait" padding="20mm">
      <Columns>
        <Column gap="16px">
          {/* Header block: kept together on a single page */}
          <Block breakInside="avoid">
            <h1>Acme Corporation</h1>
            <p>Invoice #1042 &bull; Issued October 31, 2026</p>
          </Block>

          {/* Section with keepWithNext heading: heading will never be orphaned at the bottom */}
          <Section>
            <Block keepWithNext>
              <h2>Bill To</h2>
            </Block>
            <Block breakInside="avoid">
              <strong>Wayne Enterprises</strong>
              <p>1007 Mountain Drive, Gotham City</p>
            </Block>
          </Section>

          {/* Long narrative text paragraph that splits cleanly between lines */}
          <Section>
            <Block keepWithNext>
              <h2>Terms & Conditions</h2>
            </Block>
            <Text orphans={2} widows={2}>
              Payment is due within 30 days of invoice date. All late balances
              are subject to a monthly service charge. By accepting these terms,
              the client acknowledges full agreement with the standard service
              level specifications described herein...
            </Text>
          </Section>
        </Column>
      </Columns>

      {/* Dynamic footer with page numbers */}
      <Footer>
        {({ pageNumber, totalPages }) => (
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            Page {pageNumber} of {totalPages}
          </div>
        )}
      </Footer>
    </Document>
  );
}
```

---

## How It Works

React Paper uses a **two-phase pagination architecture**:

1. **Phase 1: Measurement (Staging)**
   The document is mounted once inside a hidden, off-screen staging DOM tree (`.rp-staging`). React Paper measures layout geometry:
   - Atomic element heights (`getBoundingClientRect()`).
   - Line-by-line bounding rects for splittable text using browser native `Range.getClientRects()`.
   - Margins, paddings, borders, and CSS flex/grid gaps.
   - Fragmentation constraints (`breakInside`, `keepWithNext`, `orphans`, `widows`, `boxDecorationBreak`).

2. **Phase 2: Pure Arithmetic Pagination & Targeted Mounting**
   The pure pagination engine calculates exact page breaks arithmetically without trial-and-error DOM reflows.
   - **Targeted Mounting**: Unlike naive solutions that duplicate the entire React tree across all pages and hide overflows with CSS offsets, React Paper mounts atomic blocks **only on the specific page where they are placed**.
   - **Clean Container Slicing**: When a `<Section>` spans multiple pages, only the child blocks allocated to that page are rendered, and the container receives fragment state (`useFragment()`).

---

## Building Complex Layouts

### Multi-Column Layouts

To create multi-column layouts (such as resumes, academic articles, or financial dashboards), use `<Columns>` with the `widths` prop:

```tsx
<Document size="A4" padding="15mm">
  <Columns widths={['32%', '68%']} gap="24px">
    {/* Left Column (e.g. Contact, Skills, Languages) */}
    <Column gap="16px">
      <Block breakInside="avoid">
        <h3>Contact</h3>
        <p>developer@example.com</p>
      </Block>
      <Block breakInside="avoid">
        <h3>Skills</h3>
        <ul>
          <li>React & TypeScript</li>
          <li>Node.js</li>
        </ul>
      </Block>
    </Column>

    {/* Right Column (e.g. Experience, Education) */}
    <Column gap="20px">
      <Section>
        <Block keepWithNext>
          <h2>Professional Experience</h2>
        </Block>
        <Block breakInside="avoid">
          <h4>Principal Engineer — TechCorp</h4>
          <p>2022 — Present</p>
        </Block>
      </Section>
    </Column>
  </Columns>
</Document>
```

Column widths can be expressed as:
- Percentages: `widths={['30%', '70%']}`
- Fractions: `widths={['1fr', '2fr']}`
- Fixed lengths: `widths={['240px', '1fr']}`

---

### Preventing Stranded Headings (`keepWithNext`)

In standard web printing, a section heading may end up on the last line of a page, while its first paragraph gets pushed to the next page.

Adding `keepWithNext` to any `<Block>` guarantees that the block will be moved to the next page if there is not enough room for both the heading and at least one subsequent child block:

```tsx
<Section>
  {/* Guaranteed to stay on the same page as the first entry below */}
  <Block keepWithNext>
    <h2>Work Experience</h2>
  </Block>

  <Block breakInside="avoid">
    <h3>First Experience Entry</h3>
    <p>Detailed responsibilities...</p>
  </Block>
</Section>
```

---

### Splitting Paragraphs (`orphans` and `widows`)

Long paragraphs of body text can be split across page breaks using `<Text>`.

The `<Text>` component uses native browser `Range.getClientRects()` to measure each wrapped visual line. It splits text cleanly between lines while respecting typographic constraints:
- `orphans`: Minimum number of lines that must remain at the bottom of the originating page (default: `2`).
- `widows`: Minimum number of lines that must be carried over to the top of the next page (default: `2`).

```tsx
<Text orphans={3} widows={3} style={{ lineHeight: 1.6, fontSize: '14px' }}>
  This long paragraph can be safely divided across pages. The pagination solver
  measures the line boxes and guarantees that at least 3 lines remain on the first
  page and at least 3 lines appear on the continuation page, avoiding awkward
  single-line typographic breaks.
</Text>
```

---

### Side-by-Side Synchronized Rows (`<Parallel>`)

When rendering comparative columns, bilingual documents, or multi-cell form rows where side-by-side elements must advance together across page breaks, use `<Parallel>`:

```tsx
import { Parallel, Block } from '@joaopmo/react-paper';

<Parallel style={{ display: 'flex', gap: '16px' }}>
  <Block style={{ flex: 1 }} breakInside="avoid">
    <h4>English Version</h4>
    <p>All parties agree to the following provisions...</p>
  </Block>

  <Block style={{ flex: 1 }} breakInside="avoid">
    <h4>Spanish Version</h4>
    <p>Todas las partes acuerdan las siguientes disposiciones...</p>
  </Block>
</Parallel>
```

---

### Split Containers & Continuations (`useFragment` and `continuationHeader`)

When a `<Section>` splits across multiple pages (for example, a multi-page timeline or an itemized table), child components can adapt their styling using the `useFragment()` hook or provide a `continuationHeader`.

#### 1. Custom Fragment Styling with `useFragment()`

```tsx
import { useFragment } from '@joaopmo/react-paper';

function TimelineContainer({ children }: { children: React.ReactNode }) {
  const { isContinuation, isLast, position } = useFragment();

  return (
    <div
      style={{
        borderLeft: '2px solid #2563eb',
        paddingLeft: '16px',
        paddingTop: isContinuation ? '16px' : 0,
      }}
      data-fragment={position}
    >
      {/* Show badge only on continuation pages (page 2, 3, etc.) */}
      {isContinuation && (
        <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '12px' }}>
          Experience (continued)
        </div>
      )}
      {children}
    </div>
  );
}

// In your layout:
<Section as={TimelineContainer}>
  {items.map(item => (
    <Block key={item.id} breakInside="avoid">...</Block>
  ))}
</Section>
```

#### 2. Automatic Continuation Headers with `continuationHeader`

You can also pass `continuationHeader` directly to any `<Section>` or `<Block>`. It will automatically be rendered at the top of subsequent fragments:

```tsx
<Section
  continuationHeader={
    <div className="table-continuation-header">
      <span>Item</span>
      <span>Quantity</span>
      <span>Price (continued from previous page)</span>
    </div>
  }
>
  {/* Table rows */}
</Section>
```

---

### Headers, Footers, and Dynamic Page Numbers

React Paper provides dedicated slots for document headers and footers:

```tsx
<Document size="A4">
  {/* Header rendered ONLY on page 1 */}
  <Header mode="first">
    <h1>Quarterly Performance Review</h1>
  </Header>

  {/* Header rendered on EVERY page (pages 1, 2, 3...) */}
  {/* <Header mode="all"> ... </Header> */}

  {/* Header rendered ONLY on continuation pages (pages 2, 3...) */}
  {/* <Header mode="continuation"> ... </Header> */}

  <Columns>
    <Column>...</Column>
  </Columns>

  {/* Footer with page numbering render prop */}
  <Footer>
    {({ pageNumber, totalPages, pageIndex }) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
        <span>Confidential</span>
        <span>Page {pageNumber} of {totalPages}</span>
      </div>
    )}
  </Footer>
</Document>
```

---

### Page Underlays and Overlays

You can render full-bleed layers behind or in front of your document content on every page:

- **`<PageUnderlay>`**: Positioned absolutely behind the page content (`z-index: 0`). Ideal for sidebar background colors, accent borders, or letterhead art.
- **`<PageOverlay>`**: Positioned absolutely in front of the page content (`z-index: 2; pointer-events: none`). Ideal for watermarks (e.g. `"DRAFT"`, `"CONFIDENTIAL"`), corner stamps, or page borders.

```tsx
<Document size="A4">
  {/* Underlay: colored background behind a 30% left column */}
  <PageUnderlay>
    <div style={{ width: '30%', height: '100%', backgroundColor: '#f8fafc' }} />
  </PageUnderlay>

  {/* Overlay: diagonal watermark on every page */}
  <PageOverlay>
    {({ pageNumber }) => (
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '25%',
        transform: 'rotate(-30deg)',
        fontSize: '64px',
        color: 'rgba(226, 232, 240, 0.5)',
        fontWeight: 900,
      }}>
        DRAFT
      </div>
    )}
  </PageOverlay>

  <Columns widths={['30%', '70%']}>
    <Column>...</Column>
    <Column>...</Column>
  </Columns>
</Document>
```

---

## Paper Sizes & Printing

### Paper Sizes and Orientation

Configure standard paper presets or arbitrary custom dimensions via the `size` and `orientation` props on `<Document>`:

```tsx
// Standard A4 portrait (default)
<Document size="A4" orientation="portrait" padding="15mm">

// US Letter landscape
<Document size="Letter" orientation="landscape" padding="0.5in">

// Custom dimensions (e.g. 200mm x 200mm square)
<Document
  size={{ width: '200mm', height: '200mm' }}
  padding={{ top: '20mm', bottom: '15mm', left: '15mm', right: '15mm' }}
>
```

Supported presets:
- `'A3'` (297mm &times; 420mm)
- `'A4'` (210mm &times; 297mm)
- `'A5'` (148mm &times; 210mm)
- `'Letter'` (8.5in &times; 11in)
- `'Legal'` (8.5in &times; 14in)

---

### Visual Scaling and Previews

In interactive web applications, paper sheets can be scaled to fit the user's viewport preview:

```tsx
// Scale to fit the container width automatically (default)
<Document scale="fit-width" pageWidth={0.8}>

// Fixed visual zoom (e.g. 75%)
<Document scale={0.75}>

// Original 1:1 physical size
<Document scale="auto">
```

- `scale="fit-width"`: Dynamically adjusts scale so the document fits within its parent container width.
- `pageWidth`: Fraction (`0.1` to `1`) of container width occupied when `scale="fit-width"` (default: `1` for `<Document>`, `0.6` for legacy `<Paper>`).

---

### Printing to PDF (`usePaperPrint`)

React Paper includes a dedicated print stylesheet:

```tsx
import '@joaopmo/react-paper/css/print';
```

When `@joaopmo/react-paper/css/print` is loaded:
- The hidden staging pass is automatically hidden from print.
- Screen shadows, margins, and canvas scaling are removed.
- Each page is assigned exact physical `@page` dimensions with CSS `break-after: page`.
- Browser headers and footers can be suppressed.

To trigger the browser print dialog from a button, use the `usePaperPrint` hook:

```tsx
import { usePaperPrint } from '@joaopmo/react-paper';

export function PrintButton() {
  const print = usePaperPrint();

  return (
    <button onClick={print}>
      Print / Save as PDF
    </button>
  );
}
```

> [!TIP]
> In the browser's print dialog, select **Margins: None** (or "Minimum") so that React Paper's configured `padding` defines the exact margins on the physical sheet.

---

## Performance & Reactivity

React Paper is built for high-performance interactive applications (such as real-time form inputs and CV editors):

1. **State Preservation Across Re-renders**: Form fields, inputs, and interactive widgets placed inside `<Block>` retain their local React state and DOM focus during parent re-renders.
2. **Layout Memoization**: When a parent component updates state that does not change document geometry, the pagination layout is preserved without recalculating DOM measurements.
3. **Optimizing Frequent Updates**: For rapidly-changing props (such as live slider values or keystroke counters), wrap frequently-updating leaf components in standard `React.memo` to skip unnecessary DOM measurement cycles:

```tsx
const UserProfileHeading = React.memo(function UserProfileHeading({ name }: { name: string }) {
  return <h1>{name}</h1>;
});
```

---

## API Reference

### `<Document />` / `<Paper />`

The root container for all multi-page paper documents. `<Paper />` is a backwards-compatible alias that defaults `pageWidth` to `0.6`.

#### Props

```ts
interface DocumentProps {
  /** Paper preset ('A3' | 'A4' | 'A5' | 'Letter' | 'Legal') or custom { width, height }. Default: 'A4' */
  size?: PageSizeInput;
  /** Page orientation ('portrait' | 'landscape'). Default: 'portrait' */
  orientation?: PageOrientation;
  /** Inner page padding/margins (e.g. '15mm', [20, 15], { top: '15mm', ... }). Default: 0 */
  padding?: SpacingInput;
  /** Preview scaling mode ('fit-width' | 'auto' | number). Default: 'fit-width' */
  scale?: 'fit-width' | 'auto' | number;
  /** Width fraction (0.1 to 1) occupied when scale="fit-width". Default: 1 (0.6 for <Paper>) */
  pageWidth?: number;
  /** Horizontal gap between columns (e.g. '16px'). Default: 0 */
  columnGap?: CssLength;
  /** Default vertical row-gap between items in columns. Default: 0 */
  rowGap?: CssLength;
  /** When true, offscreen pages virtualize inner DOM mounting. Default: false */
  virtualize?: boolean;
  /** Legacy V1 prop: enable memoization. Default: false */
  memoize?: boolean;
  /** Callback fired whenever pagination recalculates */
  onPaginate?: (doc: PaginatedDocument) => void;
  className?: string;
  pageClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

---

### `<Columns />`

Defines a multi-column row across the document pages.

#### Props

```ts
interface ColumnsProps {
  /** Horizontal gap between columns (e.g. '16px', '10mm', 16) */
  gap?: CssLength;
  /** Explicit column widths (e.g. ['30%', '70%'], ['1fr', '2fr'], ['240px', '1fr']) */
  widths?: ColumnWidthInput[];
  /** Default vertical row-gap between items in each column */
  rowGap?: CssLength;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

---

### `<Column />`

Represents an individual column of flowable content within `<Columns>`.

#### Props

```ts
interface ColumnProps {
  /** Column width (e.g. '30%', '200px', '1fr'). Default: '1 1 0px' */
  width?: ColumnWidthInput;
  /** Vertical gap between items in this column (e.g. '16px') */
  gap?: CssLength;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
```

---

### `<Block />`

The fundamental layout block. Can represent atomic items (cards, images, headings) or splittable containers.

#### Props

```ts
interface BlockProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML tag or custom React component to render. Default: 'div' */
  as?: React.ElementType;
  /** Explicit node ID */
  id?: string;
  /** Layout kind ('atomic' | 'container' | 'lines' | 'parallel') */
  kind?: PreparedNodeKind;
  /** Whether this block can break across pages ('avoid' | 'auto'). Default: 'avoid' */
  breakInside?: 'auto' | 'avoid';
  /** Forces or avoids a page break before this block ('auto' | 'page') */
  breakBefore?: 'auto' | 'page';
  /** Forces a page break after, or keeps with next sibling ('auto' | 'page' | 'avoid') */
  breakAfter?: 'auto' | 'page' | 'avoid';
  /** Shorthand for breakAfter="avoid": prevents heading from being stranded at page bottom */
  keepWithNext?: boolean;
  /** Minimum lines remaining on originating page when splitting text. Default: 2 */
  orphans?: number;
  /** Minimum lines carried over to continuation page when splitting text. Default: 2 */
  widows?: number;
  /** How padding and borders behave across page breaks ('slice' | 'clone'). Default: 'slice' */
  boxDecorationBreak?: 'slice' | 'clone';
  /** Header rendered at top of continuation fragments (pages >= 2) */
  continuationHeader?: React.ReactNode | ((fragment: FragmentContextValue) => React.ReactNode);
  /** Whether the block is visible. Default: true */
  display?: boolean;
  /** Standard children or render prop receiving FragmentContextValue */
  children?: React.ReactNode | ((fragment: FragmentContextValue) => React.ReactNode);
}
```

---

### `<Section />`

A semantic container block (`as="section"`) configured by default with `breakInside="auto"`. Children placed inside a `<Section>` can flow across page boundaries.

```tsx
<Section style={{ borderLeft: '2px solid #3b82f6', paddingLeft: '16px' }}>
  <Block keepWithNext><h2>Experience</h2></Block>
  {entries.map(e => <Block key={e.id} breakInside="avoid">...</Block>)}
</Section>
```

---

### `<Text />`

A line-splittable text paragraph (`as="p"`, `breakInside="auto"`, `splittableText={true}`). Measures wrapped line boxes via `Range.getClientRects()` and splits cleanly at inter-line boundaries while honoring `orphans` and `widows`.

```tsx
<Text orphans={2} widows={2} style={{ fontSize: '14px', lineHeight: 1.5 }}>
  Lorem ipsum dolor sit amet...
</Text>
```

---

### `<Parallel />`

A synchronized row container (`kind="parallel"`). Child cells are laid out side-by-side and advance together across page boundaries.

```tsx
<Parallel style={{ display: 'flex', gap: '16px' }}>
  <Block breakInside="avoid">Column A</Block>
  <Block breakInside="avoid">Column B</Block>
</Parallel>
```

---

### `<KeepTogether />`

An alias for `<Block breakInside="avoid">`, explicitly marking content that should never be broken across pages.

---

### `<Header />`

Defines a document header slot.

#### Props

```ts
interface HeaderProps {
  /**
   * When the header appears:
   * - 'first': Only on page 1 (default)
   * - 'all': Repeats on every page
   * - 'continuation': Only on continuation pages (pages >= 2)
   */
  mode?: 'first' | 'all' | 'continuation';
  children?: React.ReactNode | ((page: PageInfoContextValue) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
}
```

---

### `<Footer />`

Defines a document footer slot rendered at the bottom of every page. Supports a render function receiving page metadata.

#### Props

```ts
interface FooterProps {
  children?: React.ReactNode | ((page: PageInfoContextValue) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
}
```

---

### `<PageUnderlay />` & `<PageOverlay />`

Full-bleed layer slots positioned absolutely (`inset: 0`) on every page:
- `<PageUnderlay>`: Rendered behind content (`z-index: 0`).
- `<PageOverlay>`: Rendered in front of content (`z-index: 2; pointer-events: none`).

Both accept standard React children or a render prop: `({ pageIndex, pageNumber, totalPages }) => React.ReactNode`.

---

### `useFragment()`

Hook returning the fragmentation state of the nearest enclosing `<Block>` or `<Section>`.

```ts
interface FragmentContextValue {
  /** 'single' | 'start' | 'middle' | 'end' */
  position: 'single' | 'start' | 'middle' | 'end';
  /** 0-based index of this fragment slice */
  index: number;
  /** Total number of fragments this node was split into */
  count: number;
  /** True when index === 0 */
  isFirst: boolean;
  /** True when index === count - 1 */
  isLast: boolean;
  /** True when index > 0 (continuation on page 2, 3...) */
  isContinuation: boolean;
  /** True when count > 1 */
  isSplit: boolean;
}
```

---

### `usePageInfo()`

Hook returning metadata about the current page:

```ts
interface PageInfoContextValue {
  /** 0-based page index */
  pageIndex: number;
  /** 1-based page number */
  pageNumber: number;
  /** Total number of pages in the document */
  totalPages: number;
  /** True during the hidden measurement pass */
  isMeasurementPass: boolean;
}
```

---

### `useDocument()`

Hook returning the full `PaginatedDocument` model, current visual preview scale, and the `print()` function:

```ts
const { document, scale, print } = useDocument();
```

---

### `usePaperPrint()`

Hook returning a function that invokes the browser print dialog (`window.print()`) with print layout styles applied:

```tsx
const print = usePaperPrint();
```

---

### CSS Stylesheets & Classes

React Paper provides two stylesheets:
- `@joaopmo/react-paper/css/base`: Core layout, staging isolation, and page shadow styles.
- `@joaopmo/react-paper/css/print`: Exact `@page` media queries, page breaks, and print layout.

Generated DOM classes available for custom styling:

| Class Name | Element Description |
|---|---|
| `.rp-dimension` | Outer centering container wrapping all pages. |
| `.rp-container` | Container housing the generated page cards. |
| `.rp-page` | Individual physical paper sheet card. |
| `.rp-page-underlay` | Full-bleed underlay layer (`z-index: 0`). |
| `.rp-page-overlay` | Full-bleed overlay layer (`z-index: 2`). |
| `.rp-header` | Header slot container. |
| `.rp-header-running` | Running header present on every page. |
| `.rp-header-continuation` | Continuation header present on pages &ge; 2. |
| `.rp-columns` | Multi-column flex container. |
| `.rp-column` | Individual column container. |
| `.rp-column-<idx>` | Column at index `<idx>` (e.g. `.rp-column-0`, `.rp-column-1`). |
| `.rp-footer` | Footer slot container. |
| `.rp-continuation-header` | Continuation header rendered above split blocks. |

---

## V1 Compatibility Guide

### Running Existing V1 Code

Existing code written for React Paper V1 continues to work without modification. The legacy primitives (`<Paper>`, `<Root>`, `<Level>`, `<Node>`, `<Header>`, and `useRegister()`) are fully supported:

```tsx
// V1 code works out of the box in V2
import React from 'react';
import { Paper, Column, Root, useRegister } from '@joaopmo/react-paper';
import '@joaopmo/react-paper/css/base';

function MyText() {
  const { register } = useRegister();
  return <p {...register()} style={{ lineHeight: 1.5 }}>Hello World</p>;
}

export function LegacyApp() {
  return (
    <Paper pageWidth={0.6}>
      <Column>
        <Root element={<MyText />} content="text" />
      </Column>
    </Paper>
  );
}
```

---

### Migrating from V1 to V2

You can incrementally modernize your codebase to V2's cleaner declarative primitives:

| V1 Legacy Pattern | V2 Modern Equivalent | Benefits in V2 |
|---|---|---|
| `<Paper pageWidth={0.6}>` | `<Document size="A4" scale="fit-width">` | Standard ISO & ANSI page sizes, custom units, padding controls. |
| `<Root element={<Card />} content="block" />` | `<Block breakInside="avoid"><Card /></Block>` | Natural JSX children, no `element={}` prop wrapper. |
| `<Root element={<Text />} content="text" />` | `<Text orphans={2} widows={2}>...</Text>` | Sub-pixel line box measurement with orphan & widow controls. |
| `<Level><Node ... /><Node ... /></Level>` | `<Section><Block ... /><Block ... /></Section>` | Semantic nesting, full CSS flex/grid gap support. |
| `<Level parallel><Node ... /><Node ... /></Level>` | `<Parallel><Block ... /><Block ... /></Parallel>` | Native side-by-side synchronization. |
| `useRegister()` hook | *Not needed* | Elements are tracked automatically without ref attachments. |

---

## Headless Core Engine (`@joaopmo/react-paper/core`)

For server-side document generation, testing, or custom rendering pipelines, the pure arithmetic pagination engine can be used without React:

```ts
import {
  createPageGeometry,
  paginateTree,
  type PreparedDocumentInput,
} from '@joaopmo/react-paper/core';

// 1. Define page geometry
const geometry = createPageGeometry({
  size: 'A4',
  orientation: 'portrait',
  padding: '15mm',
  columnCount: 2,
  columnWidths: ['30%', '70%'],
  columnGap: '16px',
});

// 2. Prepare measured node tree (measurements in canonical CSS px)
const documentInput: PreparedDocumentInput = {
  columns: [
    [
      {
        id: 'sidebar-1',
        kind: 'atomic',
        height: 120,
        marginTop: 0,
        marginBottom: 16,
        chromeTop: 0,
        chromeBottom: 0,
        rowGap: 0,
        breakRules: {
          breakInside: 'avoid',
          breakBefore: 'auto',
          breakAfter: 'auto',
          keepWithNext: false,
          orphans: 2,
          widows: 2,
          boxDecorationBreak: 'slice',
        },
      },
    ],
    [
      {
        id: 'main-1',
        kind: 'atomic',
        height: 250,
        marginTop: 0,
        marginBottom: 16,
        chromeTop: 0,
        chromeBottom: 0,
        rowGap: 0,
        breakRules: {
          breakInside: 'avoid',
          breakBefore: 'auto',
          breakAfter: 'auto',
          keepWithNext: false,
          orphans: 2,
          widows: 2,
          boxDecorationBreak: 'slice',
        },
      },
    ],
  ],
};

// 3. Paginate purely arithmetically (0 DOM dependencies)
const result = paginateTree(documentInput, geometry);

console.log(`Allocated ${result.totalPages} pages.`);
```

---

## License

This project is licensed under the [MIT License](LICENSE).

