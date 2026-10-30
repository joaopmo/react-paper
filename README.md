<p align="center">
  <img src="https://raw.githubusercontent.com/joaopmo/react-paper/main/.github/assets/logo-green.png" alt="React Paper Logo" />
</p>
<p align="center">
  Headless pagination engine and declarative React primitives for multi-page paper layouts.
</p>

## Features

- **Natural JSX Composition**: Build multi-page documents using `<Document>`, `<Columns>`, `<Column>`, `<Section>`, `<Block>`, and `<Text>` with standard React `children`—no manual `useRegister()` hooks or `element` prop wrappers required.
- **Two-Phase Headless Engine (`@joaopmo/react-paper/core`)**: Separates batch DOM geometry measurement (`getBoundingClientRect()` + `Range.getClientRects()` for wrapped line boxes) from a pure arithmetic pagination solver.
- **No $O(P \times N)$ Tree Duplication**: Atomic blocks are mounted only on the page where they are allocated. Containers split cleanly around their allocated children on each page.
- **CSS Fragmentation Primitives**:
  - `keepWithNext` (`breakAfter="avoid"`) so section headings are never stranded at the bottom of a page.
  - `orphans` and `widows` control for line-splittable `<Text>` paragraphs.
  - `useFragment()` hook and `data-rp-fragment="single | start | middle | end"` attributes for styling split containers (such as cross-page timelines, callouts, and `continuationHeader`s).
  - `<Header mode="first" | "all">`, `<Footer>`, `<PageUnderlay>`, and `<PageOverlay>` slots with `({ pageNumber, totalPages })` render functions.
- **Print & Page Size Support**: Presets (`A3`, `A4`, `A5`, `Letter`, `Legal`) or custom dimensions (`mm`, `cm`, `in`, `pt`, `px`), `portrait` / `landscape` orientation, and automatic `@page` print styling.

## Installation

```bash
pnpm add @joaopmo/react-paper
# or
npm install @joaopmo/react-paper
```

## Quick Start

```tsx
import React from 'react';
import {
  Document,
  Header,
  Footer,
  Columns,
  Column,
  Section,
  Block,
  Text,
  PageUnderlay,
  useFragment,
} from '@joaopmo/react-paper';

import '@joaopmo/react-paper/css/base';
import '@joaopmo/react-paper/css/print';

function TimelineRail({ children }: { children?: React.ReactNode }) {
  const { isContinuation, position } = useFragment();
  return (
    <div className="timeline-rail" data-fragment={position}>
      {isContinuation && <div className="cont-badge">Continued</div>}
      {children}
    </div>
  );
}

export function MyDocument({ entries }) {
  return (
    <Document size="A4" orientation="portrait" padding="15mm" scale="fit-width">
      <PageUnderlay>
        <div style={{ width: '30%', height: '100%', background: '#f8fafc' }} />
      </PageUnderlay>

      <Header mode="first">
        <h1>Document Title</h1>
      </Header>

      <Columns widths={['30%', '70%']} gap="20px">
        <Column gap="12px">
          <Block breakInside="avoid">Sidebar Block</Block>
        </Column>

        <Column gap="16px">
          <Section>
            {/* Never stranded at the bottom of a page without the first entry */}
            <Block keepWithNext>
              <h2>Experience</h2>
            </Block>

            <Section as={TimelineRail}>
              {entries.map((entry) => (
                <Block key={entry.id} breakInside="avoid">
                  <h3>{entry.title}</h3>
                  <Text orphans={2} widows={2}>
                    {entry.description}
                  </Text>
                </Block>
              ))}
            </Section>
          </Section>
        </Column>
      </Columns>

      <Footer>
        {({ pageNumber, totalPages }) => <span>Page {pageNumber} of {totalPages}</span>}
      </Footer>
    </Document>
  );
}
```

## Headless Core (`@joaopmo/react-paper/core`)

You can use the pure pagination engine directly without React:

```ts
import { createPageGeometry, paginateTree } from '@joaopmo/react-paper/core';

const geometry = createPageGeometry({
  size: 'A4',
  orientation: 'portrait',
  padding: '15mm',
  columnCount: 2,
  columnWidths: ['30%', '70%'],
  columnGap: '16px',
});

const paginated = paginateTree({ columns: [leftNodes, rightNodes] }, geometry);
```