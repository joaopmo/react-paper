import { describe, expect, it } from 'vitest';
import { paginateTree } from '../paginate';
import { type LineBox, type PreparedNode } from '../types';
import { createPageGeometry, normalizeBreakRules } from '../units';

function makeAtomic(
  id: string,
  height: number,
  options: Partial<PreparedNode> & { keepWithNext?: boolean; breakBefore?: 'auto' | 'page'; breakAfter?: 'auto' | 'page' | 'avoid' } = {},
): PreparedNode {
  return {
    id,
    kind: 'atomic',
    height,
    marginTop: options.marginTop ?? 0,
    marginBottom: options.marginBottom ?? 0,
    chromeTop: options.chromeTop ?? 0,
    chromeBottom: options.chromeBottom ?? 0,
    rowGap: 0,
    breakRules: normalizeBreakRules({
      breakInside: 'avoid',
      keepWithNext: options.keepWithNext,
      breakBefore: options.breakBefore,
      breakAfter: options.breakAfter,
      ...options.breakRules,
    }),
  };
}

function makeLinesNode(
  id: string,
  lineCount: number,
  lineHeight: number,
  options: {
    orphans?: number;
    widows?: number;
    chromeTop?: number;
    chromeBottom?: number;
    marginTop?: number;
    marginBottom?: number;
    boxDecorationBreak?: 'slice' | 'clone';
  } = {},
): PreparedNode {
  const chromeTop = options.chromeTop ?? 0;
  const chromeBottom = options.chromeBottom ?? 0;
  const lines: LineBox[] = Array.from({ length: lineCount }, (_, idx) => ({
    index: idx,
    top: idx * lineHeight,
    bottom: (idx + 1) * lineHeight,
    height: lineHeight,
  }));

  return {
    id,
    kind: 'lines',
    height: chromeTop + lineCount * lineHeight + chromeBottom,
    marginTop: options.marginTop ?? 0,
    marginBottom: options.marginBottom ?? 0,
    chromeTop,
    chromeBottom,
    rowGap: 0,
    lines,
    breakRules: normalizeBreakRules({
      breakInside: 'auto',
      orphans: options.orphans ?? 2,
      widows: options.widows ?? 2,
      boxDecorationBreak: options.boxDecorationBreak ?? 'slice',
    }),
  };
}

function makeContainer(
  id: string,
  children: PreparedNode[],
  options: {
    chromeTop?: number;
    chromeBottom?: number;
    marginTop?: number;
    marginBottom?: number;
    rowGap?: number;
    isFlexOrGrid?: boolean;
    boxDecorationBreak?: 'slice' | 'clone';
    continuationHeaderHeight?: number;
    breakInside?: 'auto' | 'avoid';
  } = {},
): PreparedNode {
  const chromeTop = options.chromeTop ?? 0;
  const chromeBottom = options.chromeBottom ?? 0;
  const rowGap = options.rowGap ?? 0;
  const childrenHeight = children.reduce(
    (sum, c, idx) => sum + c.height + c.marginTop + c.marginBottom + (idx > 0 ? rowGap : 0),
    0,
  );

  return {
    id,
    kind: 'container',
    height: chromeTop + childrenHeight + chromeBottom,
    marginTop: options.marginTop ?? 0,
    marginBottom: options.marginBottom ?? 0,
    chromeTop,
    chromeBottom,
    rowGap,
    isFlexOrGrid: options.isFlexOrGrid ?? true,
    continuationHeaderHeight: options.continuationHeaderHeight,
    children,
    breakRules: normalizeBreakRules({
      breakInside: options.breakInside ?? 'auto',
      boxDecorationBreak: options.boxDecorationBreak ?? 'slice',
    }),
  };
}

describe('core/paginate', () => {
  const baseGeometry = createPageGeometry({
    size: { width: 600, height: 500 },
    padding: 0,
    columnCount: 1,
  });

  it('allocates atomic blocks across pages when height exceeds freeHeight', () => {
    const doc = paginateTree(
      {
        columns: [[makeAtomic('b1', 200), makeAtomic('b2', 200), makeAtomic('b3', 200)]],
      },
      baseGeometry,
    );

    expect(doc.totalPages).toBe(2);
    expect(doc.pages[0].columns[0].slices.map((s) => s.nodeId)).toEqual(['b1', 'b2']);
    expect(doc.pages[0].columns[0].usedHeight).toBe(400);
    expect(doc.pages[0].columns[0].freeHeight).toBe(100);

    expect(doc.pages[1].columns[0].slices.map((s) => s.nodeId)).toEqual(['b3']);
    expect(doc.pages[1].columns[0].usedHeight).toBe(200);
  });

  it('handles oversized atomic blocks (> page height) without infinite loops', () => {
    const doc = paginateTree(
      {
        columns: [[makeAtomic('intro', 100), makeAtomic('huge', 650), makeAtomic('outro', 100)]],
      },
      baseGeometry,
    );

    expect(doc.totalPages).toBe(3);
    expect(doc.pages[0].columns[0].slices.map((s) => s.nodeId)).toEqual(['intro']);
    expect(doc.pages[1].columns[0].slices.map((s) => s.nodeId)).toEqual(['huge']);
    expect(doc.pages[2].columns[0].slices.map((s) => s.nodeId)).toEqual(['outro']);
  });

  it('enforces keepWithNext so headings are never stranded at the bottom of a page', () => {
    // Page height = 500. b1 takes 420 -> 80px left.
    // Heading is 40px (fits in 80px!), but next item is 100px (40 + 100 = 140 > 80).
    // Because heading has keepWithNext: true, BOTH heading and item move to Page 2!
    const doc = paginateTree(
      {
        columns: [
          [
            makeAtomic('b1', 420),
            makeAtomic('heading', 40, { keepWithNext: true }),
            makeAtomic('first-job', 100),
          ],
        ],
      },
      baseGeometry,
    );

    expect(doc.totalPages).toBe(2);
    expect(doc.pages[0].columns[0].slices.map((s) => s.nodeId)).toEqual(['b1']);
    expect(doc.pages[1].columns[0].slices.map((s) => s.nodeId)).toEqual(['heading', 'first-job']);
  });

  it('enforces chained keepWithNext (H1 -> H2 -> first paragraph)', () => {
    // Page height = 500. b1 takes 380 -> 120px left.
    // H1 (40px) + H2 (30px) = 70px <= 120px, but first paragraph needs 2 orphan lines (2 * 30 = 60px).
    // Total chain min height = 40 + 30 + 60 = 130px > 120px!
    const doc = paginateTree(
      {
        columns: [
          [
            makeAtomic('b1', 380),
            makeAtomic('h1', 40, { keepWithNext: true }),
            makeAtomic('h2', 30, { keepWithNext: true }),
            makeLinesNode('p1', 5, 30, { orphans: 2, widows: 2 }),
          ],
        ],
      },
      baseGeometry,
    );

    expect(doc.totalPages).toBe(2);
    expect(doc.pages[0].columns[0].slices.map((s) => s.nodeId)).toEqual(['b1']);
    expect(doc.pages[1].columns[0].slices.map((s) => s.nodeId)).toEqual(['h1', 'h2', 'p1']);
  });

  it('splits line nodes across pages while respecting orphans and widows', () => {
    // Page height = 500.
    // b1 takes 400 -> 100px left on Page 1.
    // Paragraph has 5 lines of 25px each (total 125px).
    // 4 lines (100px) would fit on Page 1, leaving 1 line on Page 2.
    // With widows: 2 and orphans: 2, Page 1 must borrow 1 line so Page 1 gets 3 lines (0..2) and Page 2 gets 2 lines (3..4)!
    const doc = paginateTree(
      {
        columns: [[makeAtomic('b1', 400), makeLinesNode('para', 5, 25, { orphans: 2, widows: 2 })]],
      },
      baseGeometry,
    );

    expect(doc.totalPages).toBe(2);
    const p1Para = doc.pages[0].columns[0].slices[1];
    expect(p1Para.nodeId).toBe('para');
    expect(p1Para.fragmentPosition).toBe('start');
    expect(p1Para.fragmentIndex).toBe(0);
    expect(p1Para.fragmentCount).toBe(2);
    expect(p1Para.lineRange).toEqual({
      startLine: 0,
      endLine: 2,
      offsetTop: 0,
      clipHeight: 75,
    });

    const p2Para = doc.pages[1].columns[0].slices[0];
    expect(p2Para.nodeId).toBe('para');
    expect(p2Para.fragmentPosition).toBe('end');
    expect(p2Para.fragmentIndex).toBe(1);
    expect(p2Para.fragmentCount).toBe(2);
    expect(p2Para.lineRange).toEqual({
      startLine: 3,
      endLine: 4,
      offsetTop: 75,
      clipHeight: 50,
    });
  });

  it('moves entire line node to next page if fewer than orphans lines fit', () => {
    // Page height = 500. b1 takes 460 -> 40px left (only 1 line of 25px fits, but orphans = 2).
    const doc = paginateTree(
      {
        columns: [[makeAtomic('b1', 460), makeLinesNode('para', 4, 25, { orphans: 2, widows: 2 })]],
      },
      baseGeometry,
    );

    expect(doc.totalPages).toBe(2);
    expect(doc.pages[0].columns[0].slices.map((s) => s.nodeId)).toEqual(['b1']);
    const p2Para = doc.pages[1].columns[0].slices[0];
    expect(p2Para.nodeId).toBe('para');
    expect(p2Para.fragmentPosition).toBe('single');
    expect(p2Para.lineRange).toEqual({
      startLine: 0,
      endLine: 3,
      offsetTop: 0,
      clipHeight: 100,
    });
  });

  it('splits containers across pages with start/middle/end fragment metadata and boxDecorationBreak', () => {
    // Container has chromeTop: 20, chromeBottom: 20, and 5 children of 200px each.
    // With boxDecorationBreak: 'clone', every page fragment reserves 20px top and 20px bottom chrome (460px left for children -> 2 children per page).
    const container = makeContainer(
      'timeline',
      [
        makeAtomic('item-1', 200),
        makeAtomic('item-2', 200),
        makeAtomic('item-3', 200),
        makeAtomic('item-4', 200),
        makeAtomic('item-5', 200),
      ],
      {
        chromeTop: 20,
        chromeBottom: 20,
        boxDecorationBreak: 'clone',
      },
    );

    const doc = paginateTree({ columns: [[container]] }, baseGeometry);

    expect(doc.totalPages).toBe(3);

    const f0 = doc.pages[0].columns[0].slices[0];
    expect(f0.nodeId).toBe('timeline');
    expect(f0.fragmentPosition).toBe('start');
    expect(f0.fragmentIndex).toBe(0);
    expect(f0.fragmentCount).toBe(3);
    expect(f0.chromeTop).toBe(20);
    expect(f0.chromeBottom).toBe(20);
    expect(f0.allocatedHeight).toBe(440);
    expect(f0.children?.map((c) => c.nodeId)).toEqual(['item-1', 'item-2']);

    const f1 = doc.pages[1].columns[0].slices[0];
    expect(f1.fragmentPosition).toBe('middle');
    expect(f1.fragmentIndex).toBe(1);
    expect(f1.chromeTop).toBe(20);
    expect(f1.chromeBottom).toBe(20);
    expect(f1.allocatedHeight).toBe(440);
    expect(f1.children?.map((c) => c.nodeId)).toEqual(['item-3', 'item-4']);

    const f2 = doc.pages[2].columns[0].slices[0];
    expect(f2.fragmentPosition).toBe('end');
    expect(f2.fragmentIndex).toBe(2);
    expect(f2.chromeTop).toBe(20);
    expect(f2.chromeBottom).toBe(20);
    expect(f2.allocatedHeight).toBe(240);
    expect(f2.children?.map((c) => c.nodeId)).toEqual(['item-5']);
  });

  it('handles margin collapsing in standard block flow vs flex/grid flow', () => {
    const n1 = makeAtomic('n1', 100, { marginBottom: 30 });
    const n2 = makeAtomic('n2', 100, { marginTop: 20 });

    // Standard block flow: margins collapse to max(30, 20) = 30 -> total height = 100 + 30 + 100 = 230
    const blockDoc = paginateTree(
      { columns: [[n1, n2]], columnIsFlexOrGrid: [false] },
      baseGeometry,
    );
    expect(blockDoc.pages[0].columns[0].usedHeight).toBe(230);

    // Flex flow: margins do not collapse -> total height = 100 + 30 + 20 + 100 = 250
    const flexDoc = paginateTree(
      { columns: [[n1, n2]], columnIsFlexOrGrid: [true] },
      baseGeometry,
    );
    expect(flexDoc.pages[0].columns[0].usedHeight).toBe(250);
  });

  it('accounts for first-page header, running header, and footer heights per page', () => {
    const geo = createPageGeometry({
      size: { width: 600, height: 500 },
      firstPageHeaderHeight: 150,
      runningHeaderHeight: 50,
      footerHeight: 50,
    });
    // Page 0 contentHeight = 500 - 150 - 50 - 50 = 250
    // Page 1 contentHeight = 500 - 0 - 50 - 50 = 400
    const doc = paginateTree(
      {
        columns: [[makeAtomic('a', 200), makeAtomic('b', 200), makeAtomic('c', 180)]],
      },
      geo,
    );

    expect(doc.totalPages).toBe(2);
    expect(doc.pages[0].contentHeight).toBe(250);
    expect(doc.pages[0].hasFirstPageHeader).toBe(true);
    expect(doc.pages[0].columns[0].slices.map((s) => s.nodeId)).toEqual(['a']);

    expect(doc.pages[1].contentHeight).toBe(400);
    expect(doc.pages[1].hasFirstPageHeader).toBe(false);
    expect(doc.pages[1].columns[0].slices.map((s) => s.nodeId)).toEqual(['b', 'c']);
  });

  it('paginates 1,000 blocks across many pages in under 50ms', () => {
    const items = Array.from({ length: 1000 }, (_, i) => makeAtomic(`item-${i}`, 80));
    const start = performance.now();
    const doc = paginateTree({ columns: [items] }, baseGeometry);
    const elapsed = performance.now() - start;

    // 500px per page / 80px = 6 items per page -> ceil(1000 / 6) = 167 pages
    expect(doc.totalPages).toBe(167);
    expect(elapsed).toBeLessThan(50);
  });

  it('parallel inside a container with continuation header reserves header space and does not overflow continuation pages', () => {
    const cell = (id: string): PreparedNode => ({
      id,
      kind: 'container',
      height: 400,
      marginTop: 0,
      marginBottom: 0,
      chromeTop: 0,
      chromeBottom: 0,
      rowGap: 0,
      isFlexOrGrid: true,
      children: [
        makeAtomic(`${id}a`, 100),
        makeAtomic(`${id}b`, 100),
        makeAtomic(`${id}c`, 100),
        makeAtomic(`${id}d`, 100),
      ],
      breakRules: normalizeBreakRules({ breakInside: 'auto' }),
    });

    const parallelNode: PreparedNode = {
      id: 'par',
      kind: 'parallel',
      height: 400,
      marginTop: 0,
      marginBottom: 0,
      chromeTop: 0,
      chromeBottom: 0,
      rowGap: 0,
      children: [cell('L'), cell('R')],
      breakRules: normalizeBreakRules({ breakInside: 'auto' }),
    };

    const section: PreparedNode = {
      id: 'sec',
      kind: 'container',
      height: 400,
      marginTop: 0,
      marginBottom: 0,
      chromeTop: 0,
      chromeBottom: 0,
      rowGap: 0,
      isFlexOrGrid: true,
      continuationHeaderHeight: 50,
      children: [parallelNode],
      breakRules: normalizeBreakRules({ breakInside: 'auto' }),
    };

    const geometry = createPageGeometry({ size: { width: 500, height: 200 } });
    const doc = paginateTree({ columns: [[section]] }, geometry);

    // Every page's usedHeight must strictly fit within its contentHeight (no overflow)
    for (let p = 0; p < doc.pages.length; p++) {
      const page = doc.pages[p];
      expect(page.columns[0].usedHeight).toBeLessThanOrEqual(page.contentHeight);
    }
  });

  it('container whose first child does not fit on page 0 opens as first fragment on page 1 without premature continuation header', () => {
    // Lead-in item on page 0 leaves only 100px free
    const leadIn = makeAtomic('lead', 400);

    // Section with 20px chromeTop, 40px continuation header, and child of 200px
    // Cannot start on page 0 (needs 20 + 200 = 220px, only 100px free)
    const child1 = makeAtomic('child-1', 200);
    const child2 = makeAtomic('child-2', 400);
    const section = makeContainer('section', [child1, child2], {
      chromeTop: 20,
      chromeBottom: 15,
      continuationHeaderHeight: 40,
    });

    const geometry = createPageGeometry({ size: { width: 500, height: 500 } });
    const doc = paginateTree({ columns: [[leadIn, section]] }, geometry);

    expect(doc.totalPages).toBe(3);
    // Page 0: only leadIn
    expect(doc.pages[0].columns[0].slices.map((s) => s.nodeId)).toEqual(['lead']);

    // Page 1: section's first fragment starts here. Must have chromeTop = 20, fragmentPosition = 'start', and NO continuationHeader
    const p1Section = doc.pages[1].columns[0].slices.find((s) => s.nodeId === 'section');
    expect(p1Section).toBeDefined();
    expect(p1Section?.fragmentPosition).toBe('start');
    expect(p1Section?.fragmentIndex).toBe(0);
    expect(p1Section?.chromeTop).toBe(20);

    // Page 2: section's continuation fragment. Has continuation header height (40px)
    const p2Section = doc.pages[2].columns[0].slices.find((s) => s.nodeId === 'section');
    expect(p2Section).toBeDefined();
    expect(p2Section?.fragmentPosition).toBe('end');
    expect(p2Section?.fragmentIndex).toBe(1);
    expect(p2Section?.chromeTop).toBe(40); // continuation header height applied
  });

  it('recovers gracefully from unrecognized node kind without dropping content', () => {
    const bogusNode = {
      id: 'bogus-1',
      kind: 'unknown-kind' as any,
      height: 120,
      marginTop: 0,
      marginBottom: 0,
      chromeTop: 0,
      chromeBottom: 0,
      rowGap: 0,
      breakRules: normalizeBreakRules({ breakInside: 'avoid' }),
    };

    const doc = paginateTree({ columns: [[bogusNode]] }, baseGeometry);
    expect(doc.pages[0].columns[0].slices).toHaveLength(1);
    expect(doc.pages[0].columns[0].slices[0].nodeId).toBe('bogus-1');
  });
});
