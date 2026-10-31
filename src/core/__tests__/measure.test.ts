// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  findDirectChildNodes,
  measureDomColumn,
  measureDomNode,
  measureElementLines,
  readElementBreakRules,
  readElementStyleMetrics,
} from '../measure';

describe('core/measure', () => {
  it('reads declarative data-rp-* break attributes and merges with CSS break rules', () => {
    const el = document.createElement('div');
    el.setAttribute('data-rp-break-inside', 'avoid');
    el.setAttribute('data-rp-keep-with-next', 'true');
    el.setAttribute('data-rp-orphans', '3');
    el.setAttribute('data-rp-widows', '4');
    el.setAttribute('data-rp-box-decoration-break', 'clone');

    const rules = readElementBreakRules(el);
    expect(rules).toEqual({
      breakInside: 'avoid',
      keepWithNext: true,
      orphans: 3,
      widows: 4,
      boxDecorationBreak: 'clone',
    });
  });

  it('finds direct [data-rp-node] descendants without descending into nested [data-rp-node] subtrees', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div class="wrapper">
        <div data-rp-node data-rp-id="child-1">
          <div data-rp-node data-rp-id="grandchild-1"></div>
        </div>
      </div>
      <div data-rp-node data-rp-id="child-2"></div>
    `;

    const direct = findDirectChildNodes(root);
    expect(direct.map((el) => el.getAttribute('data-rp-id'))).toEqual(['child-1', 'child-2']);
  });

  it('falls back to lineHeight subdivision when Range.getClientRects is empty in jsdom', () => {
    const el = document.createElement('p');
    el.textContent = 'Line 1 Line 2 Line 3 Line 4';
    el.style.lineHeight = '24px';
    el.style.paddingTop = '10px';
    el.style.paddingBottom = '10px';

    const metrics = readElementStyleMetrics(el);
    // Content height = 116 - 20 = 96px -> 96 / 24 = 4 lines
    const fakeRect = {
      top: 0,
      bottom: 116,
      left: 0,
      right: 300,
      width: 300,
      height: 116,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;

    const lines = measureElementLines(el, fakeRect, metrics);
    expect(lines).toHaveLength(4);
    expect(lines[0]).toEqual({ index: 0, top: 0, bottom: 24, height: 24 });
    expect(lines[3]).toEqual({ index: 3, top: 72, bottom: 96, height: 24 });
  });

  it('coalesces overlapping inline Range.getClientRects on the same visual line', () => {
    const el = document.createElement('p');
    el.innerHTML = '<span>Hello </span><strong>world</strong>';

    const origCreateRange = document.createRange;
    let callIdx = 0;
    document.createRange = vi.fn(() => {
      return {
        selectNodeContents: () => {},
        getClientRects: () => {
          callIdx++;
          if (callIdx === 1) {
            // "Hello " on line 0
            return [
              { top: 100, bottom: 120, width: 50, height: 20 },
            ] as unknown as DOMRectList;
          }
          // "world" on line 0 (slightly taller strong tag) and wrapping onto line 1
          return [
            { top: 99, bottom: 121, width: 60, height: 22 },
            { top: 125, bottom: 145, width: 80, height: 20 },
          ] as unknown as DOMRectList;
        },
      } as unknown as Range;
    });

    try {
      const fakeRect = {
        top: 100,
        bottom: 145,
        left: 0,
        right: 300,
        width: 300,
        height: 45,
        x: 0,
        y: 100,
        toJSON: () => ({}),
      } as DOMRect;

      const metrics = readElementStyleMetrics(el);
      const lines = measureElementLines(el, fakeRect, metrics);
      expect(lines).toHaveLength(2);
      expect(lines[0].top).toBe(0);
      expect(lines[0].bottom).toBe(23);
      expect(lines[1].top).toBe(23);
      expect(lines[1].bottom).toBe(45);
    } finally {
      document.createRange = origCreateRange;
    }
  });

  it('measures atomic and container DOM nodes into a PreparedNode tree', () => {
    const col = document.createElement('div');
    col.style.display = 'flex';
    col.style.flexDirection = 'column';
    col.style.rowGap = '12px';

    const container = document.createElement('div');
    container.setAttribute('data-rp-node', '');
    container.setAttribute('data-rp-id', 'section-1');
    container.style.paddingTop = '8px';
    container.style.paddingBottom = '8px';
    container.getBoundingClientRect = () =>
      ({ top: 0, bottom: 156, height: 156, width: 400 }) as DOMRect;

    const child1 = document.createElement('div');
    child1.setAttribute('data-rp-node', '');
    child1.setAttribute('data-rp-id', 'item-1');
    child1.setAttribute('data-rp-break-inside', 'avoid');
    child1.getBoundingClientRect = () =>
      ({ top: 8, bottom: 78, height: 70, width: 400 }) as DOMRect;

    const child2 = document.createElement('div');
    child2.setAttribute('data-rp-node', '');
    child2.setAttribute('data-rp-id', 'item-2');
    child2.setAttribute('data-rp-break-inside', 'avoid');
    child2.getBoundingClientRect = () =>
      ({ top: 78, bottom: 148, height: 70, width: 400 }) as DOMRect;

    container.appendChild(child1);
    container.appendChild(child2);
    col.appendChild(container);

    const measured = measureDomColumn(col, 0);
    expect(measured.rowGap).toBe(12);
    expect(measured.isFlexOrGrid).toBe(true);
    expect(measured.nodes).toHaveLength(1);
    expect(measured.nodes[0].id).toBe('section-1');
    expect(measured.nodes[0].kind).toBe('container');
    expect(measured.nodes[0].chromeTop).toBe(8);
    expect(measured.nodes[0].chromeBottom).toBe(8);
    expect(measured.nodes[0].children?.map((c) => c.id)).toEqual(['item-1', 'item-2']);
    expect(measured.nodes[0].children?.[0].kind).toBe('atomic');
    expect(measured.nodes[0].children?.[0].height).toBe(70);
  });

  it('treats hidden elements (display: none or data-rp-display="none") as zero-height atomic nodes', () => {
    const hidden = document.createElement('div');
    hidden.setAttribute('data-rp-id', 'hidden-1');
    hidden.setAttribute('data-rp-display', 'none');
    const node = measureDomNode(hidden, 'fallback');
    expect(node.height).toBe(0);
    expect(node.kind).toBe('atomic');
  });

  it('sanitizes and ignores invalid data-rp-* attribute values', () => {
    const el = document.createElement('div');
    el.setAttribute('data-rp-node', '');
    el.setAttribute('data-rp-id', 'test-invalid');
    el.setAttribute('data-rp-kind', 'unsupported_mode');
    el.setAttribute('data-rp-break-inside', 'random_string');
    el.setAttribute('data-rp-orphans', 'not-a-number');
    el.setAttribute('data-rp-widows', '-5');
    el.setAttribute('data-rp-box-decoration-break', 'invalid_val');

    const node = measureDomNode(el, 'fallback');
    // Invalid kind is sanitized; defaults to atomic if no children and breakInside is avoid
    expect(node.kind).toBe('atomic');
    // Invalid orphans/widows fall back to default (2)
    expect(node.breakRules.orphans).toBe(2);
    expect(node.breakRules.widows).toBe(2);
    expect(node.breakRules.boxDecorationBreak).toBe('slice');
  });

  it('measures continuation header height including vertical margins', () => {
    const container = document.createElement('div');
    container.setAttribute('data-rp-node', '');
    container.setAttribute('data-rp-id', 'cont-section');

    const contHeader = document.createElement('div');
    contHeader.setAttribute('data-rp-continuation-header', '');
    contHeader.style.marginTop = '10px';
    contHeader.style.marginBottom = '5px';
    contHeader.getBoundingClientRect = () =>
      ({ top: 0, bottom: 25, height: 25, width: 300 }) as DOMRect;

    const child = document.createElement('div');
    child.setAttribute('data-rp-node', '');
    child.setAttribute('data-rp-id', 'child');

    container.appendChild(contHeader);
    container.appendChild(child);

    const node = measureDomNode(container, 'fallback');
    // Height 25 + marginTop 10 + marginBottom 5 = 40px
    expect(node.continuationHeaderHeight).toBe(40);
  });
});
