// @vitest-environment jsdom
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Block,
  Column,
  Columns,
  Document,
  Footer,
  Header,
  Level,
  Node,
  PageUnderlay,
  Paper,
  Root,
  Section,
  Text,
  useFragment,
  useRegister,
} from '../index';

describe('react/Document & primitives', () => {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    // Allow tests to define heights via `data-test-height` or `style.height` in jsdom
    Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
      const testH = this.getAttribute('data-test-height');
      const styleH = (this as HTMLElement).style?.height;
      let height = 0;
      if (testH != null) {
        height = Number.parseFloat(testH);
      } else if (styleH != null && styleH.endsWith('px')) {
        height = Number.parseFloat(styleH);
      }
      return {
        top: 0,
        bottom: height,
        left: 0,
        right: 500,
        width: 500,
        height,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    };
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('paginates blocks across pages and mounts each atomic block only on its allocated page', async () => {
    const onPaginate = vi.fn();
    const { container } = render(
      <Document size={{ width: 500, height: 400 }} onPaginate={onPaginate}>
        <Column>
          <Block id="card-1" data-test-height="180">
            <span data-testid="card-1-text">Card 1</span>
          </Block>
          <Block id="card-2" data-test-height="180">
            <span data-testid="card-2-text">Card 2</span>
          </Block>
          <Block id="card-3" data-test-height="180">
            <span data-testid="card-3-text">Card 3</span>
          </Block>
        </Column>
      </Document>,
    );

    await waitFor(() => {
      const pages = container.querySelectorAll('.rp-page');
      expect(pages).toHaveLength(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    // Page 1 has card-1 and card-2, and NOT card-3
    expect(pages[0].querySelector('[data-testid="card-1-text"]')).not.toBeNull();
    expect(pages[0].querySelector('[data-testid="card-2-text"]')).not.toBeNull();
    expect(pages[0].querySelector('[data-testid="card-3-text"]')).toBeNull();

    // Page 2 has ONLY card-3, and NOT card-1 or card-2 (no O(P*N) duplication!)
    expect(pages[1].querySelector('[data-testid="card-1-text"]')).toBeNull();
    expect(pages[1].querySelector('[data-testid="card-2-text"]')).toBeNull();
    expect(pages[1].querySelector('[data-testid="card-3-text"]')).not.toBeNull();
  });

  it('splits a <Section> across pages with useFragment() metadata and continuationHeader', async () => {
    function TimelineStatus() {
      const fragment = useFragment();
      return (
        <div
          data-testid={`status-${fragment.index}`}
          data-position={fragment.position}
          data-continuation={String(fragment.isContinuation)}
        />
      );
    }

    const { container } = render(
      <Document size={{ width: 500, height: 300 }}>
        <Column>
          <Section
            id="exp-section"
            continuationHeader={<div data-testid="cont-header">Experience (Continued)</div>}
          >
            <TimelineStatus />
            <Block id="job-1" data-test-height="180">
              Job 1
            </Block>
            <Block id="job-2" data-test-height="180">
              Job 2
            </Block>
          </Section>
        </Column>
      </Document>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('.rp-page')).toHaveLength(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    const p1Section = pages[0].querySelector('#exp-section, [data-rp-id="exp-section"]')!;
    const p2Section = pages[1].querySelector('#exp-section, [data-rp-id="exp-section"]')!;

    expect(p1Section.getAttribute('data-rp-fragment')).toBe('start');
    expect(pages[0].querySelector('[data-testid="cont-header"]')).toBeNull();
    expect(pages[0].querySelector('[data-testid="status-0"]')?.getAttribute('data-continuation')).toBe(
      'false',
    );

    expect(p2Section.getAttribute('data-rp-fragment')).toBe('end');
    expect(pages[1].querySelector('[data-testid="cont-header"]')).not.toBeNull();
    expect(pages[1].querySelector('[data-testid="status-1"]')?.getAttribute('data-continuation')).toBe(
      'true',
    );
  });

  it('keeps keepWithNext headings attached to the following block', async () => {
    const { container } = render(
      <Document size={{ width: 500, height: 300 }}>
        <Column>
          <Block id="intro" data-test-height="240">
            Intro
          </Block>
          <Block id="heading" keepWithNext data-test-height="40">
            <h2>Section Heading</h2>
          </Block>
          <Block id="first-entry" data-test-height="100">
            First Entry
          </Block>
        </Column>
      </Document>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('.rp-page')).toHaveLength(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    // Heading (40px) would have fit in the remaining 60px of Page 1 alone,
    // but keepWithNext pushes it to Page 2 with First Entry (100px)!
    expect(pages[0].querySelector('[data-rp-id="heading"]')).toBeNull();
    expect(pages[1].querySelector('[data-rp-id="heading"]')).not.toBeNull();
    expect(pages[1].querySelector('[data-rp-id="first-entry"]')).not.toBeNull();
  });

  it('renders Header, Footer, PageUnderlay, and multi-column layouts', async () => {
    const { container } = render(
      <Document size={{ width: 600, height: 300 }}>
        <PageUnderlay>
          {({ pageNumber }) => <div data-testid={`underlay-${pageNumber}`} />}
        </PageUnderlay>
        <Header mode="first">
          <div data-testid="banner" data-test-height="60">
            Banner
          </div>
        </Header>
        <Columns widths={['30%', '70%']} gap="20px">
          <Column>
            <Block id="side-1" data-test-height="150">
              Sidebar
            </Block>
          </Column>
          <Column>
            <Block id="main-1" data-test-height="200">
              Main 1
            </Block>
            <Block id="main-2" data-test-height="200">
              Main 2
            </Block>
          </Column>
        </Columns>
        <Footer>
          {({ pageNumber, totalPages }) => (
            <div data-testid={`footer-${pageNumber}`} data-test-height="30">
              Page {pageNumber} of {totalPages}
            </div>
          )}
        </Footer>
      </Document>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('.rp-page')).toHaveLength(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    // First-page header is only on page 1
    expect(pages[0].querySelector('[data-testid="banner"]')).not.toBeNull();
    expect(pages[1].querySelector('[data-testid="banner"]')).toBeNull();

    // Footer & Underlay are on both pages with accurate page numbers
    expect(pages[0].querySelector('[data-testid="footer-1"]')?.textContent).toBe('Page 1 of 2');
    expect(pages[1].querySelector('[data-testid="footer-2"]')?.textContent).toBe('Page 2 of 2');
    expect(pages[0].querySelector('[data-testid="underlay-1"]')).not.toBeNull();
    expect(pages[1].querySelector('[data-testid="underlay-2"]')).not.toBeNull();
  });

  it('supports legacy v1/v3 Paper, Root, Level, Node, and useRegister API', async () => {
    function LegacyLeaf({ label, height }: { label: string; height: number }) {
      const { register } = useRegister();
      return (
        <div {...register()} data-test-height={String(height)}>
          {label}
        </div>
      );
    }

    function LegacyGroup() {
      const { register } = useRegister();
      return (
        <div {...register()} data-test-height="360">
          <Level>
            <Node element={<LegacyLeaf label="Item A" height={180} />} content="block" />
            <Node element={<LegacyLeaf label="Item B" height={180} />} content="block" />
          </Level>
        </div>
      );
    }

    const { container } = render(
      <Paper size={{ width: 500, height: 300 }}>
        <Column>
          <Root element={<LegacyGroup />} />
        </Column>
      </Paper>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('.rp-page')).toHaveLength(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    expect(pages[0].textContent).toContain('Item A');
    expect(pages[0].textContent).not.toContain('Item B');
    expect(pages[1].textContent).toContain('Item B');
  });

  it('splits <Text> paragraphs across pages by line ranges', async () => {
    const { container } = render(
      <Document size={{ width: 500, height: 100 }}>
        <Column>
          <Text
            id="long-text"
            data-test-height="160"
            style={{ lineHeight: '20px' }}
          >
            Line 1 Line 2 Line 3 Line 4 Line 5 Line 6 Line 7 Line 8
          </Text>
        </Column>
      </Document>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('.rp-page')).toHaveLength(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    const slice1 = pages[0].querySelector('.rp-line-slice-window') as HTMLElement;
    const slice2 = pages[1].querySelector('.rp-line-slice-window') as HTMLElement;
    expect(slice1).not.toBeNull();
    expect(slice2).not.toBeNull();
    expect(slice1.style.height).toBe('100px');
    expect(slice2.style.height).toBe('60px');
  });

  it('memoize prop does not freeze pagination when document dimensions change', async () => {
    function ResizableDoc({ pageHeight }: { pageHeight: number }) {
      return (
        <Document memoize size={{ width: 500, height: pageHeight }}>
          <Column>
            <Block id="card-1" data-test-height="180">Card 1</Block>
            <Block id="card-2" data-test-height="180">Card 2</Block>
            <Block id="card-3" data-test-height="180">Card 3</Block>
          </Column>
        </Document>
      );
    }

    const { container, rerender } = render(<ResizableDoc pageHeight={400} />);
    await waitFor(() => {
      // 400px height holds 2 cards (360px), 3rd card on page 2 -> 2 pages
      expect(container.querySelectorAll('.rp-page')).toHaveLength(2);
    });

    // Enlarge height to 1000px so all 3 cards fit on 1 page
    rerender(<ResizableDoc pageHeight={1000} />);
    await waitFor(() => {
      expect(container.querySelectorAll('.rp-page')).toHaveLength(1);
    });
  });

  it('supports custom React component passed to Block as and places className on the measured element', async () => {
    function CustomCard({ children, title }: { children?: React.ReactNode; title?: string }) {
      return (
        <article data-testid="article-card">
          <h2>{title}</h2>
          <div>{children}</div>
        </article>
      );
    }

    const { container } = render(
      <Document size={{ width: 500, height: 400 }}>
        <Column>
          <Block
            as={CustomCard}
            id="custom-1"
            className="card-custom-class"
            data-test-height="150"
            title="Custom Title"
          >
            Custom Body
          </Block>
        </Column>
      </Document>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('.rp-page')).toHaveLength(1);
    });

    const page = container.querySelector('.rp-page')!;
    const nodeEl = page.querySelector('[data-rp-id="custom-1"]');
    expect(nodeEl).not.toBeNull();
    expect(nodeEl?.classList.contains('card-custom-class')).toBe(true);
    expect(page.querySelector('[data-testid="article-card"]')).not.toBeNull();
    expect(page.textContent).toContain('Custom Title');
    expect(page.textContent).toContain('Custom Body');
  });
});
