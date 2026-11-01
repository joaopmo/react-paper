import {
  type BoxDecorationBreakMode,
  type BreakEdgeMode,
  type BreakInsideMode,
  type BreakRules,
  type LineBox,
  type PreparedNode,
  type PreparedNodeKind,
} from './types';
import { normalizeBreakRules } from './units';

function parsePx(value: string | null | undefined): number {
  if (value == null || value === '') return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface ElementStyleMetrics {
  display: string;
  isFlexOrGrid: boolean;
  marginTop: number;
  marginBottom: number;
  paddingTop: number;
  paddingBottom: number;
  borderTop: number;
  borderBottom: number;
  chromeTop: number;
  chromeBottom: number;
  rowGap: number;
  lineHeight: number;
  cssBreakRules: Partial<BreakRules>;
}

/**
 * Extracts box metrics and CSS fragmentation properties from an element in a single `getComputedStyle` read.
 */
export function readElementStyleMetrics(el: Element): ElementStyleMetrics {
  const style = window.getComputedStyle(el);
  const display = style.display || 'block';
  const isFlexOrGrid =
    display === 'flex' ||
    display === 'inline-flex' ||
    display === 'grid' ||
    display === 'inline-grid';

  const marginTop = parsePx(style.marginTop);
  const marginBottom = parsePx(style.marginBottom);
  const paddingTop = parsePx(style.paddingTop);
  const paddingBottom = parsePx(style.paddingBottom);
  const borderTop = parsePx(style.borderTopWidth);
  const borderBottom = parsePx(style.borderBottomWidth);
  const chromeTop = paddingTop + borderTop;
  const chromeBottom = paddingBottom + borderBottom;
  const rowGap = parsePx(style.rowGap);

  let lineHeight = parsePx(style.lineHeight);
  if (lineHeight <= 0) {
    const fontSize = parsePx(style.fontSize);
    lineHeight = fontSize > 0 ? fontSize * 1.2 : 16;
  }

  const cssBreakRules: Partial<BreakRules> = {};
  const rawBreakInside = (
    style.getPropertyValue('break-inside') || style.getPropertyValue('page-break-inside')
  ).trim();
  if (rawBreakInside === 'avoid' || rawBreakInside === 'avoid-page' || rawBreakInside === 'avoid-column') {
    cssBreakRules.breakInside = 'avoid';
  }

  const rawBreakBefore = (
    style.getPropertyValue('break-before') || style.getPropertyValue('page-break-before')
  ).trim();
  if (rawBreakBefore === 'page' || rawBreakBefore === 'always' || rawBreakBefore === 'column') {
    cssBreakRules.breakBefore = 'page';
  }

  const rawBreakAfter = (
    style.getPropertyValue('break-after') || style.getPropertyValue('page-break-after')
  ).trim();
  if (rawBreakAfter === 'page' || rawBreakAfter === 'always' || rawBreakAfter === 'column') {
    cssBreakRules.breakAfter = 'page';
  } else if (rawBreakAfter === 'avoid' || rawBreakAfter === 'avoid-page') {
    cssBreakRules.breakAfter = 'avoid';
    cssBreakRules.keepWithNext = true;
  }

  const orphans = Number.parseInt(style.getPropertyValue('orphans'), 10);
  if (Number.isFinite(orphans) && orphans >= 1) {
    cssBreakRules.orphans = orphans;
  }

  const widows = Number.parseInt(style.getPropertyValue('widows'), 10);
  if (Number.isFinite(widows) && widows >= 1) {
    cssBreakRules.widows = widows;
  }

  const boxDecBreak = (
    style.getPropertyValue('box-decoration-break') ||
    style.getPropertyValue('-webkit-box-decoration-break')
  ).trim();
  if (boxDecBreak === 'clone' || boxDecBreak === 'slice') {
    cssBreakRules.boxDecorationBreak = boxDecBreak;
  }

  return {
    display,
    isFlexOrGrid,
    marginTop,
    marginBottom,
    paddingTop,
    paddingBottom,
    borderTop,
    borderBottom,
    chromeTop,
    chromeBottom,
    rowGap,
    lineHeight,
    cssBreakRules,
  };
}

/**
 * Reads declarative `data-rp-*` attributes from a DOM element and merges them with CSS break rules.
 */
export function readElementBreakRules(
  el: Element,
  cssBreakRules: Partial<BreakRules> = {},
  explicitRules?: BreakRules,
): BreakRules {
  const rawBreakInside = el.getAttribute('data-rp-break-inside');
  const attrBreakInside: BreakInsideMode | undefined =
    rawBreakInside === 'auto' || rawBreakInside === 'avoid' ? rawBreakInside : undefined;

  const rawBreakBefore = el.getAttribute('data-rp-break-before');
  const attrBreakBefore: ('auto' | 'page') | undefined =
    rawBreakBefore === 'auto' || rawBreakBefore === 'page' ? rawBreakBefore : undefined;

  const rawBreakAfter = el.getAttribute('data-rp-break-after');
  const attrBreakAfter: BreakEdgeMode | undefined =
    rawBreakAfter === 'auto' || rawBreakAfter === 'page' || rawBreakAfter === 'avoid'
      ? rawBreakAfter
      : undefined;

  const attrKeepWithNext = el.getAttribute('data-rp-keep-with-next');

  const rawOrphans = el.getAttribute('data-rp-orphans');
  const parsedOrphans = rawOrphans != null ? Number.parseInt(rawOrphans, 10) : NaN;
  const attrOrphans = Number.isFinite(parsedOrphans) && parsedOrphans >= 1 ? parsedOrphans : undefined;

  const rawWidows = el.getAttribute('data-rp-widows');
  const parsedWidows = rawWidows != null ? Number.parseInt(rawWidows, 10) : NaN;
  const attrWidows = Number.isFinite(parsedWidows) && parsedWidows >= 1 ? parsedWidows : undefined;

  const rawBoxDecBreak = el.getAttribute('data-rp-box-decoration-break');
  const attrBoxDecorationBreak: BoxDecorationBreakMode | undefined =
    rawBoxDecBreak === 'slice' || rawBoxDecBreak === 'clone' ? rawBoxDecBreak : undefined;

  return {
    ...cssBreakRules,
    ...(attrBreakInside != null ? { breakInside: attrBreakInside } : {}),
    ...(attrBreakBefore != null ? { breakBefore: attrBreakBefore } : {}),
    ...(attrBreakAfter != null ? { breakAfter: attrBreakAfter } : {}),
    ...(attrKeepWithNext != null
      ? { keepWithNext: attrKeepWithNext === '' || attrKeepWithNext === 'true' }
      : {}),
    ...(attrOrphans != null ? { orphans: attrOrphans } : {}),
    ...(attrWidows != null ? { widows: attrWidows } : {}),
    ...(attrBoxDecorationBreak != null ? { boxDecorationBreak: attrBoxDecorationBreak } : {}),
    ...explicitRules,
  };
}

/**
 * Measures the visual wrapped line boxes inside `el` using native DOM `Range.getClientRects()`.
 * Adjacent inline rects on the same visual line are coalesced into a single `LineBox`.
 * Falls back to `lineHeight` subdivision if `Range.getClientRects()` returns no rects (e.g. in jsdom).
 */
export function measureElementLines(
  el: Element,
  elRect: DOMRect,
  metrics: ElementStyleMetrics,
): LineBox[] {
  const contentTop = elRect.top + metrics.chromeTop;
  const contentHeight = Math.max(0, elRect.height - metrics.chromeTop - metrics.chromeBottom);
  const rawRects: Array<{ top: number; bottom: number }> = [];

  if (typeof document !== 'undefined' && typeof document.createRange === 'function') {
    const range = document.createRange();
    if (typeof range.getClientRects === 'function') {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let currentText = walker.nextNode();

      while (currentText != null) {
        if (currentText.nodeValue != null && currentText.nodeValue.trim().length > 0) {
          range.selectNodeContents(currentText);
          const clientRects = range.getClientRects();
          for (let i = 0; i < clientRects.length; i++) {
            const r = clientRects[i];
            if (r.height > 0 && r.width > 0) {
              rawRects.push({
                top: Math.max(0, r.top - contentTop),
                bottom: Math.max(0, r.bottom - contentTop),
              });
            }
          }
        }
        currentText = walker.nextNode();
      }
    }
  }

  if (rawRects.length > 0) {
    rawRects.sort((a, b) => a.top - b.top);
    const merged: LineBox[] = [];

    for (let i = 0; i < rawRects.length; i++) {
      const r = rawRects[i];
      const last = merged[merged.length - 1];
      // If vertical intervals overlap significantly, they belong to the same visual line
      if (last != null && r.top < last.bottom - 1 && r.bottom > last.top + 1) {
        last.top = Math.min(last.top, r.top);
        last.bottom = Math.max(last.bottom, r.bottom);
        last.height = last.bottom - last.top;
      } else {
        merged.push({
          index: merged.length,
          top: r.top,
          bottom: r.bottom,
          height: r.bottom - r.top,
        });
      }
    }

    // Stretch contiguous line boxes to meet at the midpoint of inter-line leading so slicing never clips ascenders or descenders
    if (merged.length > 0) {
      merged[0].top = 0;
      for (let i = 0; i + 1 < merged.length; i++) {
        const mid = (merged[i].bottom + merged[i + 1].top) / 2;
        merged[i].bottom = mid;
        merged[i + 1].top = mid;
      }
      const lastIdx = merged.length - 1;
      if (contentHeight > merged[lastIdx].bottom) {
        merged[lastIdx].bottom = contentHeight;
      }
      for (let i = 0; i < merged.length; i++) {
        merged[i].height = Math.max(0, merged[i].bottom - merged[i].top);
      }
    }

    return merged;
  }

  // Fallback for synthetic DOM environments (e.g. jsdom) or when only height + lineHeight are available
  if (contentHeight <= 0 || metrics.lineHeight <= 0) {
    return [];
  }

  const lineCount = Math.max(1, Math.round(contentHeight / metrics.lineHeight));
  const step = contentHeight / lineCount;
  const fallbackLines: LineBox[] = [];

  for (let i = 0; i < lineCount; i++) {
    const top = i * step;
    const bottom = i === lineCount - 1 ? contentHeight : (i + 1) * step;
    fallbackLines.push({
      index: i,
      top,
      bottom,
      height: bottom - top,
    });
  }

  return fallbackLines;
}

function findContinuationHeader(el: Element): Element | null {
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i];
    if (child.getAttribute('data-rp-continuation-header') != null) {
      return child;
    }
    // Only search into non-rp-node wrappers (e.g. custom component tags)
    if (!child.hasAttribute('data-rp-node')) {
      const nested = findContinuationHeader(child);
      if (nested != null) return nested;
    }
  }
  return null;
}

/**
 * Measures a single DOM element (and any nested `[data-rp-node]` children) into a `PreparedNode`.
 */
export function measureDomNode(el: Element, fallbackId: string): PreparedNode {
  const id = el.getAttribute('data-rp-id') || fallbackId;
  const metrics = readElementStyleMetrics(el);

  if (metrics.display === 'none' || el.getAttribute('data-rp-display') === 'none') {
    return {
      id,
      kind: 'atomic',
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      chromeTop: 0,
      chromeBottom: 0,
      rowGap: 0,
      isFlexOrGrid: metrics.isFlexOrGrid,
      breakRules: normalizeBreakRules({ breakInside: 'avoid' }),
    };
  }

  const rect = el.getBoundingClientRect();
  const height =
    rect.height > 0
      ? rect.height
      : parsePx(window.getComputedStyle(el).height) + metrics.chromeTop + metrics.chromeBottom;

  const rawBreakRules = readElementBreakRules(el, metrics.cssBreakRules);
  const breakRules = normalizeBreakRules(rawBreakRules);

  const rawKind = el.getAttribute('data-rp-kind');
  const explicitKind: PreparedNodeKind | null =
    rawKind === 'atomic' || rawKind === 'container' || rawKind === 'lines' || rawKind === 'parallel'
      ? rawKind
      : null;
  const directChildNodes = findDirectChildNodes(el);

  let kind: PreparedNodeKind;
  if (explicitKind != null) {
    kind = explicitKind;
  } else if (directChildNodes.length > 0) {
    kind = 'container';
  } else if (rawBreakRules.breakInside === 'auto') {
    kind = 'lines';
  } else {
    kind = 'atomic';
    breakRules.breakInside = 'avoid';
  }

  if (kind === 'container' || kind === 'parallel') {
    const children: PreparedNode[] = [];
    for (let i = 0; i < directChildNodes.length; i++) {
      children.push(measureDomNode(directChildNodes[i], `${id}.${i}`));
    }
    const contHeaderEl = findContinuationHeader(el);
    let continuationHeaderHeight: number | undefined;
    if (contHeaderEl != null) {
      const hRect = contHeaderEl.getBoundingClientRect();
      const hMetrics = readElementStyleMetrics(contHeaderEl);
      continuationHeaderHeight = hRect.height + hMetrics.marginTop + hMetrics.marginBottom;
    }

    return {
      id,
      kind,
      height,
      marginTop: metrics.marginTop,
      marginBottom: metrics.marginBottom,
      chromeTop: metrics.chromeTop,
      chromeBottom: metrics.chromeBottom,
      rowGap: metrics.rowGap,
      isFlexOrGrid: metrics.isFlexOrGrid,
      continuationHeaderHeight,
      children,
      breakRules,
    };
  }

  if (kind === 'lines') {
    const lines = measureElementLines(el, rect, metrics);
    return {
      id,
      kind: 'lines',
      height,
      marginTop: metrics.marginTop,
      marginBottom: metrics.marginBottom,
      chromeTop: metrics.chromeTop,
      chromeBottom: metrics.chromeBottom,
      rowGap: metrics.rowGap,
      isFlexOrGrid: metrics.isFlexOrGrid,
      lines,
      breakRules,
    };
  }

  return {
    id,
    kind: 'atomic',
    height,
    marginTop: metrics.marginTop,
    marginBottom: metrics.marginBottom,
    chromeTop: metrics.chromeTop,
    chromeBottom: metrics.chromeBottom,
    rowGap: metrics.rowGap,
    isFlexOrGrid: metrics.isFlexOrGrid,
    breakRules,
  };
}

/**
 * Finds the nearest descendant elements marked with `[data-rp-node]` without traversing inside
 * nested `[data-rp-node]` subtrees.
 */
export function findDirectChildNodes(root: Element): Element[] {
  const results: Element[] = [];

  function walk(parent: Element): void {
    const children = parent.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.hasAttribute('data-rp-continuation-header')) {
        continue;
      }
      if (child.hasAttribute('data-rp-node')) {
        results.push(child);
      } else {
        walk(child);
      }
    }
  }

  walk(root);
  return results;
}

/**
 * Measures all top-level nodes inside a column element.
 * If children are not explicitly annotated with `[data-rp-node]`, measures direct element children of the column.
 */
export function measureDomColumn(
  columnEl: Element,
  columnIndex: number,
): { nodes: PreparedNode[]; rowGap: number; isFlexOrGrid: boolean } {
  const colMetrics = readElementStyleMetrics(columnEl);
  let childElements = findDirectChildNodes(columnEl);
  if (childElements.length === 0) {
    childElements = Array.from(columnEl.children);
  }

  const nodes: PreparedNode[] = [];
  for (let i = 0; i < childElements.length; i++) {
    nodes.push(measureDomNode(childElements[i], `${columnIndex}.${i}`));
  }

  return {
    nodes,
    rowGap: colMetrics.rowGap,
    isFlexOrGrid: colMetrics.isFlexOrGrid,
  };
}
