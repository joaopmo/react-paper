import React from 'react';
import {
  type ColumnWidthInput,
  type CssLength,
  type FragmentSlice,
  type PageOrientation,
  type PageSizeInput,
  type PaginatedDocument,
  type PaginatedPage,
  type PreparedNode,
  type SpacingInput,
  createPageGeometry,
  measureDomColumn,
  paginateTree,
  readElementStyleMetrics,
  resolveBoxSpacing,
  resolvePageSize,
  toPx,
} from '../core';
import { Block, KeepTogether, Parallel, Section, Text } from './Block';
import {
  BlockPathContext,
  DocumentContext,
  PageInfoContext,
  type PageInfoContextValue,
  PageSliceContext,
} from './context';
import {
  Column,
  type ColumnProps,
  Columns,
  type ColumnsProps,
  Footer,
  type FooterProps,
  Header,
  type HeaderProps,
  PageOverlay,
  PageUnderlay,
  type PageLayerProps,
  Root,
} from './slots';

export interface DocumentProps {
  /** Paper size preset (`'A3' | 'A4' | 'A5' | 'Letter' | 'Legal'`) or custom `{ width, height }`. Defaults to `'A4'`. */
  size?: PageSizeInput;
  /** Page orientation (`'portrait' | 'landscape'`). Defaults to `'portrait'`. */
  orientation?: PageOrientation;
  /** Inner page padding/margins (e.g. `'15mm'`, `[20, 15]`, `{ top: '15mm', left: '15mm', ... }`). Defaults to `0`. */
  padding?: SpacingInput;
  /** Visual preview scaling mode (`'fit-width' | 'auto' | number`). Defaults to `'fit-width'`. */
  scale?: 'fit-width' | 'auto' | number;
  /** Fraction (`0.1` to `1`) of outer container width occupied by the scaled page when `scale="fit-width"`. Defaults to `1` (`0.6` in legacy `<Paper>`). */
  pageWidth?: number;
  /** Default horizontal gap between columns (e.g. `'16px'`). Defaults to `0`. */
  columnGap?: CssLength;
  /** Default vertical gap between items in a column. Defaults to `0`. */
  rowGap?: CssLength;
  /** When `true`, offscreen pages only mount their inner React tree when near the viewport (always mounts all pages when printing). */
  virtualize?: boolean;
  /** Legacy v1/v3 prop (no-op in v4 as layout is automatically memoized). */
  memoize?: boolean;
  className?: string;
  pageClassName?: string;
  style?: React.CSSProperties;
  /** Callback fired whenever pagination recalculates. */
  onPaginate?: (doc: PaginatedDocument) => void;
  children?: React.ReactNode;
}

interface ExtractedColumn {
  width?: ColumnWidthInput;
  gap?: CssLength;
  className?: string;
  style?: React.CSSProperties;
  items: React.ReactNode[];
}

interface ExtractedLayout {
  firstPageHeaders: HeaderProps[];
  runningHeaders: HeaderProps[];
  continuationHeaders: HeaderProps[];
  footers: FooterProps[];
  underlays: PageLayerProps[];
  overlays: PageLayerProps[];
  columns: ExtractedColumn[];
  columnsGap?: CssLength;
  columnsWidths?: ColumnWidthInput[];
  columnsRowGap?: CssLength;
}

function isComponentType(el: React.ReactElement, target: any, displayName: string): boolean {
  return (
    el.type === target ||
    (typeof el.type === 'function' && (el.type as any).displayName === displayName)
  );
}

function isKnownBlockElement(node: React.ReactNode): boolean {
  if (!React.isValidElement(node)) return false;
  return (
    node.type === Block ||
    node.type === Section ||
    node.type === KeepTogether ||
    node.type === Text ||
    node.type === Parallel ||
    isComponentType(node, Root, 'ReactPaperRoot')
  );
}

function flattenColumnChildren(children: React.ReactNode): React.ReactNode[] {
  const items: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === 'boolean') return;
    if (React.isValidElement(child) && child.type === React.Fragment) {
      items.push(...flattenColumnChildren(child.props.children));
      return;
    }
    items.push(child);
  });
  return items;
}

function extractDocumentLayout(children: React.ReactNode): ExtractedLayout {
  const layout: ExtractedLayout = {
    firstPageHeaders: [],
    runningHeaders: [],
    continuationHeaders: [],
    footers: [],
    underlays: [],
    overlays: [],
    columns: [],
  };

  const looseFlowItems: React.ReactNode[] = [];

  function walk(nodes: React.ReactNode): void {
    React.Children.forEach(nodes, (child) => {
      if (child == null || typeof child === 'boolean') return;

      if (!React.isValidElement(child)) {
        looseFlowItems.push(child);
        return;
      }

      if (child.type === React.Fragment) {
        walk(child.props.children);
        return;
      }

      if (isComponentType(child, Header, 'ReactPaperHeader')) {
        const props = child.props as HeaderProps;
        if (props.mode === 'all') {
          layout.runningHeaders.push(props);
        } else if (props.mode === 'continuation') {
          layout.continuationHeaders.push(props);
        } else {
          layout.firstPageHeaders.push(props);
        }
        return;
      }

      if (isComponentType(child, Footer, 'ReactPaperFooter')) {
        layout.footers.push(child.props as FooterProps);
        return;
      }

      if (isComponentType(child, PageUnderlay, 'ReactPaperPageUnderlay')) {
        layout.underlays.push(child.props as PageLayerProps);
        return;
      }

      if (isComponentType(child, PageOverlay, 'ReactPaperPageOverlay')) {
        layout.overlays.push(child.props as PageLayerProps);
        return;
      }

      if (isComponentType(child, Columns, 'ReactPaperColumns')) {
        const colsProps = child.props as ColumnsProps;
        if (colsProps.gap != null) layout.columnsGap = colsProps.gap;
        if (colsProps.widths != null) layout.columnsWidths = colsProps.widths;
        if (colsProps.rowGap != null) layout.columnsRowGap = colsProps.rowGap;
        walk(colsProps.children);
        return;
      }

      if (isComponentType(child, Column, 'ReactPaperColumn')) {
        const colProps = child.props as ColumnProps;
        layout.columns.push({
          width: colProps.width,
          gap: colProps.gap,
          className: colProps.className,
          style: colProps.style,
          items: flattenColumnChildren(colProps.children),
        });
        return;
      }

      looseFlowItems.push(child);
    });
  }

  walk(children);

  if (looseFlowItems.length > 0) {
    if (layout.columns.length === 0) {
      layout.columns.push({ items: looseFlowItems });
    } else {
      layout.columns[0].items.push(...looseFlowItems);
    }
  }

  if (layout.columns.length === 0) {
    layout.columns.push({ items: [] });
  }

  return layout;
}

function buildSliceMapForPage(page: PaginatedPage): Map<string, FragmentSlice> {
  const map = new Map<string, FragmentSlice>();

  function visit(slices: FragmentSlice[]): void {
    for (let i = 0; i < slices.length; i++) {
      const s = slices[i];
      map.set(s.nodeId, s);
      if (s.children != null && s.children.length > 0) {
        visit(s.children);
      }
    }
  }

  for (let c = 0; c < page.columns.length; c++) {
    visit(page.columns[c].slices);
  }

  return map;
}

function measureSlotHeight(el: HTMLElement | null): number {
  if (el == null) return 0;
  const rect = el.getBoundingClientRect();
  const metrics = readElementStyleMetrics(el);
  const h = rect.height > 0 ? rect.height : Number.parseFloat(window.getComputedStyle(el).height) || 0;
  return h + metrics.marginTop + metrics.marginBottom;
}

function renderSlotContent(
  content: React.ReactNode | ((page: PageInfoContextValue) => React.ReactNode) | undefined,
  fallbackElement: React.ReactNode | undefined,
  pageInfo: PageInfoContextValue,
): React.ReactNode {
  if (typeof content === 'function') {
    return content(pageInfo);
  }
  return content ?? fallbackElement ?? null;
}

interface ColumnItemsRendererProps {
  colIdx: number;
  items: React.ReactNode[];
}

function ColumnItemsRenderer({
  colIdx,
  items,
}: ColumnItemsRendererProps): React.ReactElement {
  const childCounter = {
    nextIndex: 0,
    byToken: new WeakMap<object, number>(),
  };

  return (
    <BlockPathContext.Provider
      value={{
        parentId: String(colIdx),
        childCounter,
      }}
    >
      {items.map((item, idx) => {
        if (isKnownBlockElement(item)) {
          return <React.Fragment key={idx}>{item}</React.Fragment>;
        }
        // Automatically wrap plain JSX elements inside a <Block> so they get a deterministic ID and per-page filtering
        return (
          <Block key={idx} id={`${colIdx}.${idx}`}>
            {item}
          </Block>
        );
      })}
    </BlockPathContext.Provider>
  );
}

export function Document({
  size = 'A4',
  orientation = 'portrait',
  padding = 0,
  scale: scaleProp = 'fit-width',
  pageWidth = 1,
  columnGap: columnGapProp = 0,
  rowGap: rowGapProp = 0,
  virtualize = false,
  memoize = false,
  className,
  pageClassName,
  style,
  onPaginate,
  children,
}: DocumentProps): React.ReactElement {
  const clampedPageWidth = Math.min(1, Math.max(0.1, pageWidth));
  const onPaginateRef = React.useRef(onPaginate);
  onPaginateRef.current = onPaginate;

  const layout = React.useMemo(() => extractDocumentLayout(children), [children]);

  const pageDims = React.useMemo(
    () => resolvePageSize(size, orientation),
    [size, orientation],
  );
  const resolvedPadding = React.useMemo(() => resolveBoxSpacing(padding), [padding]);

  const effectiveColumnGap = layout.columnsGap ?? columnGapProp;
  const effectiveRowGap = layout.columnsRowGap ?? rowGapProp;
  const effectiveColumnWidths = React.useMemo(() => {
    if (layout.columnsWidths != null) return layout.columnsWidths;
    const perCol = layout.columns.map((c) => c.width);
    return perCol.some((w) => w != null) ? (perCol as ColumnWidthInput[]) : undefined;
  }, [layout.columns, layout.columnsWidths]);

  const baseGeometry = React.useMemo(
    () =>
      createPageGeometry({
        size,
        orientation,
        padding,
        columnCount: layout.columns.length,
        columnWidths: effectiveColumnWidths,
        columnGap: effectiveColumnGap,
        rowGap: effectiveRowGap,
      }),
    [
      size,
      orientation,
      padding,
      layout.columns.length,
      effectiveColumnWidths,
      effectiveColumnGap,
      effectiveRowGap,
    ],
  );

  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const stagingFirstHeaderRef = React.useRef<HTMLDivElement | null>(null);
  const stagingRunningHeaderRef = React.useRef<HTMLDivElement | null>(null);
  const stagingContinuationHeaderRef = React.useRef<HTMLDivElement | null>(null);
  const stagingFooterRef = React.useRef<HTMLDivElement | null>(null);
  const stagingColumnRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const lastPaginationSignatureRef = React.useRef<string>('');

  const [visualScale, setVisualScale] = React.useState<number>(() =>
    typeof scaleProp === 'number' ? scaleProp : 1,
  );
  const [isPrinting, setIsPrinting] = React.useState(false);

  const [paginatedDoc, setPaginatedDoc] = React.useState<PaginatedDocument>(() =>
    paginateTree(
      { columns: layout.columns.map(() => []) },
      baseGeometry,
    ),
  );

  // Measure outer container width for responsive preview scaling
  const updateVisualScale = React.useCallback(() => {
    if (typeof scaleProp === 'number') {
      setVisualScale(scaleProp);
      return;
    }
    const container = outerRef.current;
    if (container == null || pageDims.width <= 0) return;
    const availableWidth = container.clientWidth || container.offsetWidth;
    if (availableWidth <= 0) return;

    const targetWidth = availableWidth * clampedPageWidth;
    const nextScale =
      scaleProp === 'auto'
        ? Math.min(1, targetWidth / pageDims.width)
        : targetWidth / pageDims.width;

    setVisualScale((prev) => (Math.abs(prev - nextScale) > 0.001 ? nextScale : prev));
  }, [scaleProp, pageDims.width, clampedPageWidth]);

  React.useLayoutEffect(() => {
    updateVisualScale();
    if (typeof window === 'undefined') return;

    const handleResize = () => updateVisualScale();
    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && outerRef.current != null) {
      ro = new ResizeObserver(handleResize);
      ro.observe(outerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      ro?.disconnect();
    };
  }, [updateVisualScale]);

  // Core two-phase measurement + pure pagination pass
  const runLayoutPass = React.useCallback(() => {
    const firstPageHeaderHeight = measureSlotHeight(stagingFirstHeaderRef.current);
    const runningHeaderHeight = measureSlotHeight(stagingRunningHeaderRef.current);
    const continuationHeaderHeight = measureSlotHeight(stagingContinuationHeaderRef.current);
    const footerHeight = measureSlotHeight(stagingFooterRef.current);

    const measuredColumns: PreparedNode[][] = [];
    const columnRowGaps: number[] = [];
    const columnIsFlexOrGrid: boolean[] = [];

    for (let i = 0; i < layout.columns.length; i++) {
      const colEl = stagingColumnRefs.current[i];
      if (colEl != null) {
        const res = measureDomColumn(colEl, i);
        measuredColumns.push(res.nodes);
        const explicitColGap = layout.columns[i].gap;
        columnRowGaps.push(
          explicitColGap != null ? toPx(explicitColGap) : res.rowGap || baseGeometry.rowGap,
        );
        columnIsFlexOrGrid.push(res.isFlexOrGrid);
      } else {
        measuredColumns.push([]);
        columnRowGaps.push(baseGeometry.rowGap);
        columnIsFlexOrGrid.push(false);
      }
    }

    const fullGeometry = {
      ...baseGeometry,
      firstPageHeaderHeight,
      continuationHeaderHeight,
      runningHeaderHeight,
      footerHeight,
    };

    const nextDoc = paginateTree(
      {
        columns: measuredColumns,
        columnRowGaps,
        columnIsFlexOrGrid,
      },
      fullGeometry,
    );

    const signature = JSON.stringify({
      pages: nextDoc.pages.map((p) => ({
        ch: Math.round(p.contentHeight * 100),
        cols: p.columns.map((c) => ({
          u: Math.round(c.usedHeight * 100),
          s: c.slices,
        })),
      })),
    });

    if (signature !== lastPaginationSignatureRef.current) {
      lastPaginationSignatureRef.current = signature;
      setPaginatedDoc(nextDoc);
      onPaginateRef.current?.(nextDoc);
    }
  }, [baseGeometry, layout]);

  React.useLayoutEffect(() => {
    runLayoutPass();
  }, [runLayoutPass]);

  // Observe dynamic resize / image load / font changes inside the staging area
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    let rafId: number | null = null;
    const ro = new ResizeObserver(() => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        runLayoutPass();
      });
    });

    if (stagingFirstHeaderRef.current != null) ro.observe(stagingFirstHeaderRef.current);
    if (stagingRunningHeaderRef.current != null) ro.observe(stagingRunningHeaderRef.current);
    if (stagingContinuationHeaderRef.current != null) ro.observe(stagingContinuationHeaderRef.current);
    if (stagingFooterRef.current != null) ro.observe(stagingFooterRef.current);
    for (let i = 0; i < stagingColumnRefs.current.length; i++) {
      const colEl = stagingColumnRefs.current[i];
      if (colEl != null) {
        ro.observe(colEl);
        const nodes = colEl.querySelectorAll('[data-rp-node], img');
        nodes.forEach((n) => ro.observe(n));
      }
    }

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [runLayoutPass, layout.columns.length]);

  // Listen for print media events so virtualized pages un-virtualize automatically
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onBeforePrint = () => setIsPrinting(true);
    const onAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  const triggerPrint = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 20);
  }, []);

  const docContextValue = React.useMemo(
    () => ({
      document: paginatedDoc,
      scale: visualScale,
      memoize,
      print: triggerPrint,
    }),
    [paginatedDoc, visualScale, memoize, triggerPrint],
  );

  const stagingPageInfo: PageInfoContextValue = React.useMemo(
    () => ({
      pageIndex: 0,
      pageNumber: 1,
      totalPages: 1,
      isMeasurementPass: true,
    }),
    [],
  );

  const stagingSliceContext = React.useMemo(
    () => ({
      isMeasurementPass: true,
      sliceMap: null,
    }),
    [],
  );

  const innerContentWidth = Math.max(
    0,
    pageDims.width - resolvedPadding.left - resolvedPadding.right,
  );

  return (
    <DocumentContext.Provider value={docContextValue}>
      <style data-rp-page-style="">
        {`@page { size: ${pageDims.cssWidth} ${pageDims.cssHeight}; margin: 0; } .rp-legacy-slice-inner > [data-rp-node], .rp-legacy-slice-inner [data-rp-node] { margin-top: 0 !important; margin-bottom: 0 !important; }`}
      </style>
      <div
        ref={outerRef}
        className={['rp-dimension', className].filter(Boolean).join(' ')}
        style={
          {
            '--rp-page-width': `${pageDims.width}px`,
            '--rp-page-height': `${pageDims.height}px`,
            '--rp-page-css-width': pageDims.cssWidth,
            '--rp-page-css-height': pageDims.cssHeight,
            '--rp-scale': String(visualScale),
            ...style,
          } as React.CSSProperties
        }
      >
        {/* Phase 1: Single-Pass Hidden Measurement Stage */}
        <div
          className="rp-staging"
          aria-hidden="true"
          onLoadCapture={runLayoutPass}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: pageDims.width,
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -9999,
            overflow: 'hidden',
            height: 0,
          }}
        >
          <PageInfoContext.Provider value={stagingPageInfo}>
            <PageSliceContext.Provider value={stagingSliceContext}>
              {layout.firstPageHeaders.length > 0 && (
                <div
                  ref={stagingFirstHeaderRef}
                  className="rp-header rp-header-first"
                  style={{ width: innerContentWidth, display: 'flow-root' }}
                >
                  {layout.firstPageHeaders.map((h, i) => (
                    <div key={i} className={h.className} style={h.style}>
                      {renderSlotContent(h.children, h.element, stagingPageInfo)}
                    </div>
                  ))}
                </div>
              )}

              {layout.runningHeaders.length > 0 && (
                <div
                  ref={stagingRunningHeaderRef}
                  className="rp-header rp-header-running"
                  style={{ width: innerContentWidth, display: 'flow-root' }}
                >
                  {layout.runningHeaders.map((h, i) => (
                    <div key={i} className={h.className} style={h.style}>
                      {renderSlotContent(h.children, h.element, stagingPageInfo)}
                    </div>
                  ))}
                </div>
              )}

              {layout.continuationHeaders.length > 0 && (
                <div
                  ref={stagingContinuationHeaderRef}
                  className="rp-header rp-header-continuation"
                  style={{ width: innerContentWidth, display: 'flow-root' }}
                >
                  {layout.continuationHeaders.map((h, i) => (
                    <div key={i} className={h.className} style={h.style}>
                      {renderSlotContent(h.children, h.element, stagingPageInfo)}
                    </div>
                  ))}
                </div>
              )}

              <div
                className="rp-staging-columns"
                style={{
                  display: 'flex',
                  columnGap: baseGeometry.columnGap,
                  width: innerContentWidth,
                }}
              >
                {layout.columns.map((col, colIdx) => {
                  const colW = baseGeometry.columnWidths[colIdx] ?? innerContentWidth;
                  return (
                    <div
                      key={colIdx}
                      ref={(el) => {
                        stagingColumnRefs.current[colIdx] = el;
                      }}
                      className={[
                        'rp-column',
                        `rp-column-${colIdx}`,
                        col.className,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        width: colW,
                        flexBasis: colW,
                        flexShrink: 0,
                        flexGrow: 0,
                        overflow: 'hidden',
                        ...(col.gap != null
                          ? { display: 'flex', flexDirection: 'column', rowGap: toPx(col.gap) }
                          : {}),
                        ...col.style,
                      }}
                    >
                      <ColumnItemsRenderer
                        colIdx={colIdx}
                        items={col.items}
                      />
                    </div>
                  );
                })}
              </div>

              {layout.footers.length > 0 && (
                <div
                  ref={stagingFooterRef}
                  className="rp-footer"
                  style={{ width: innerContentWidth, display: 'flow-root' }}
                >
                  {layout.footers.map((f, i) => (
                    <div key={i} className={f.className} style={f.style}>
                      {renderSlotContent(f.children, undefined, stagingPageInfo)}
                    </div>
                  ))}
                </div>
              )}
            </PageSliceContext.Provider>
          </PageInfoContext.Provider>
        </div>

        {/* Phase 2: Paginated Pages Output */}
        <div className="rp-container">
          {paginatedDoc.pages.map((page) => (
            <RenderedPageSheet
              key={page.pageIndex}
              page={page}
              totalPages={paginatedDoc.totalPages}
              pageDims={pageDims}
              padding={resolvedPadding}
              visualScale={visualScale}
              columnGap={baseGeometry.columnGap}
              layout={layout}
              pageClassName={pageClassName}
              virtualize={virtualize && !isPrinting}
            />
          ))}
        </div>
      </div>
    </DocumentContext.Provider>
  );
}

interface RenderedPageSheetProps {
  page: PaginatedPage;
  totalPages: number;
  pageDims: { width: number; height: number };
  padding: { top: number; right: number; bottom: number; left: number };
  visualScale: number;
  columnGap: number;
  layout: ExtractedLayout;
  pageClassName?: string;
  virtualize: boolean;
}

const RenderedPageSheet = React.memo(function RenderedPageSheet({
  page,
  totalPages,
  pageDims,
  padding,
  visualScale,
  columnGap,
  layout,
  pageClassName,
  virtualize,
}: RenderedPageSheetProps): React.ReactElement {
  const pageRef = React.useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(!virtualize || page.pageIndex < 2);

  React.useEffect(() => {
    if (!virtualize) {
      setIsVisible(true);
      return;
    }
    const el = pageRef.current;
    if (el == null || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [virtualize]);

  const pageInfo: PageInfoContextValue = React.useMemo(
    () => ({
      pageIndex: page.pageIndex,
      pageNumber: page.pageNumber,
      totalPages,
      isMeasurementPass: false,
    }),
    [page.pageIndex, page.pageNumber, totalPages],
  );

  const sliceMap = React.useMemo(() => buildSliceMapForPage(page), [page]);

  const pageSliceContextValue = React.useMemo(
    () => ({
      isMeasurementPass: false,
      sliceMap,
    }),
    [sliceMap],
  );

  const marginRight = pageDims.width * visualScale - pageDims.width;
  const marginBottom = pageDims.height * visualScale - pageDims.height;

  const pageColVars: Record<string, string> = {};
  let accumulatedLeft = padding.left;
  for (let c = 0; c < page.columns.length; c++) {
    const w = page.columns[c].width;
    pageColVars[`--rp-col-${c}-width`] = `${w}px`;
    pageColVars[`--rp-col-${c}-left`] = `${accumulatedLeft}px`;
    accumulatedLeft += w + columnGap;
  }

  return (
    <div
      ref={pageRef}
      className={['rp-page', `rp-page-${page.pageIndex}`, pageClassName]
        .filter(Boolean)
        .join(' ')}
      data-rp-page-index={page.pageIndex}
      data-rp-page-number={page.pageNumber}
      style={{
        ...pageColVars,
        width: pageDims.width,
        height: pageDims.height,
        paddingTop: padding.top,
        paddingRight: padding.right,
        paddingBottom: padding.bottom,
        paddingLeft: padding.left,
        transform: `scale(${visualScale})`,
        marginRight,
        marginBottom,
        position: 'relative',
      } as React.CSSProperties}
    >
      {isVisible && (
        <PageInfoContext.Provider value={pageInfo}>
          <PageSliceContext.Provider value={pageSliceContextValue}>
            {/* Underlay Layer */}
            {layout.underlays.length > 0 && (
              <div className="rp-page-underlay" aria-hidden="true">
                {layout.underlays.map((u, i) => (
                  <div key={i} className={u.className} style={u.style}>
                    {renderSlotContent(u.children, undefined, pageInfo)}
                  </div>
                ))}
              </div>
            )}

            {/* First-Page Header */}
            {page.pageIndex === 0 && layout.firstPageHeaders.length > 0 && (
              <div
                className="rp-header rp-header-first"
                style={{ display: 'flow-root', flexShrink: 0, width: '100%' }}
              >
                {layout.firstPageHeaders.map((h, i) => (
                  <div key={i} className={h.className} style={h.style}>
                    {renderSlotContent(h.children, h.element, pageInfo)}
                  </div>
                ))}
              </div>
            )}

            {/* Running Header */}
            {layout.runningHeaders.length > 0 && (
              <div
                className="rp-header rp-header-running"
                style={{ display: 'flow-root', flexShrink: 0, width: '100%' }}
              >
                {layout.runningHeaders.map((h, i) => (
                  <div key={i} className={h.className} style={h.style}>
                    {renderSlotContent(h.children, h.element, pageInfo)}
                  </div>
                ))}
              </div>
            )}

            {/* Continuation Header (pages >= 2) */}
            {page.pageIndex > 0 && layout.continuationHeaders.length > 0 && (
              <div
                className="rp-header rp-header-continuation"
                style={{ display: 'flow-root', flexShrink: 0, width: '100%' }}
              >
                {layout.continuationHeaders.map((h, i) => (
                  <div key={i} className={h.className} style={h.style}>
                    {renderSlotContent(h.children, h.element, pageInfo)}
                  </div>
                ))}
              </div>
            )}

            {/* Columns Area */}
            <div
              className="rp-columns"
              style={{
                display: 'flex',
                columnGap,
                width: '100%',
                height: page.contentHeight,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {page.columns.map((col, colIdx) => {
                const colDef = layout.columns[colIdx];
                if (colDef == null) return null;
                return (
                  <div
                    key={colIdx}
                    className={[
                      'rp-column',
                      `rp-column-${colIdx}`,
                      colDef.className,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{
                      width: col.width,
                      flexBasis: col.width,
                      flexShrink: 0,
                      flexGrow: 0,
                      height: '100%',
                      overflow: 'hidden',
                      ...(colDef.gap != null
                        ? { display: 'flex', flexDirection: 'column', rowGap: toPx(colDef.gap) }
                        : {}),
                      ...colDef.style,
                    }}
                  >
                    <ColumnItemsRenderer
                      colIdx={colIdx}
                      items={colDef.items}
                    />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {layout.footers.length > 0 && (
              <div
                className="rp-footer"
                style={{ display: 'flow-root', flexShrink: 0, width: '100%' }}
              >
                {layout.footers.map((f, i) => (
                  <div key={i} className={f.className} style={f.style}>
                    {renderSlotContent(f.children, undefined, pageInfo)}
                  </div>
                ))}
              </div>
            )}

            {/* Overlay Layer */}
            {layout.overlays.length > 0 && (
              <div className="rp-page-overlay">
                {layout.overlays.map((o, i) => (
                  <div key={i} className={o.className} style={o.style}>
                    {renderSlotContent(o.children, undefined, pageInfo)}
                  </div>
                ))}
              </div>
            )}
          </PageSliceContext.Provider>
        </PageInfoContext.Provider>
      )}
    </div>
  );
});

/**
 * Legacy v1/v3 `<Paper>` component wrapper around `<Document>` (defaults `pageWidth` to `0.6`).
 */
export interface PaperProps extends DocumentProps {
  pageWidth?: number;
  memoize?: boolean;
}

export function Paper({ pageWidth = 0.6, ...props }: PaperProps): React.ReactElement {
  return <Document pageWidth={pageWidth} {...props} />;
}

/**
 * Hook returning a helper to print the current `<Document>`.
 */
export function usePaperPrint(): () => void {
  const { print } = React.useContext(DocumentContext);
  return print;
}
