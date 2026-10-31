import {
  type FragmentPosition,
  type FragmentSlice,
  type LineBox,
  type PageGeometry,
  type PaginatedColumn,
  type PaginatedDocument,
  type PaginatedPage,
  type PreparedDocumentInput,
  type PreparedNode,
} from './types';

const EPSILON = 0.01;

export function getPageContentHeight(pageIndex: number, geometry: PageGeometry): number {
  const innerHeight = geometry.height - geometry.padding.top - geometry.padding.bottom;
  const headerHeight =
    (pageIndex === 0
      ? geometry.firstPageHeaderHeight
      : (geometry.continuationHeaderHeight ?? 0)) + geometry.runningHeaderHeight;
  const footerHeight = geometry.footerHeight;
  return Math.max(1, innerHeight - headerHeight - footerHeight);
}

/**
 * Computes the height of a contiguous range of line boxes `[startLine..endLine]` inclusive.
 */
function getLinesRangeHeight(lines: LineBox[], startLine: number, endLine: number): number {
  if (lines.length === 0 || startLine > endLine) return 0;
  const first = lines[startLine];
  const last = lines[endLine];
  return Math.max(0, last.bottom - first.top);
}

/**
 * Computes the minimum vertical space (border-box, excluding outer marginTop) required
 * to start rendering `node` on the current page without violating `breakInside`, `orphans`, or `keepWithNext`.
 */
export function getMinStartHeight(node: PreparedNode): number {
  const { breakRules } = node;

  if (node.kind === 'atomic' || breakRules.breakInside === 'avoid') {
    return node.height;
  }

  if (node.kind === 'lines') {
    const lines = node.lines ?? [];
    if (lines.length === 0) return node.height;
    const minLines = Math.min(lines.length, Math.max(1, breakRules.orphans));
    const linesHeight = getLinesRangeHeight(lines, 0, minLines - 1);
    const needBottomChrome = minLines === lines.length || breakRules.boxDecorationBreak === 'clone';
    return node.chromeTop + linesHeight + (needBottomChrome ? node.chromeBottom : 0);
  }

  if (node.kind === 'container') {
    const children = node.children ?? [];
    if (children.length === 0) return node.height;
    const childChainHeight = getKeepWithNextChainMinHeight(
      children,
      0,
      node.rowGap,
      node.isFlexOrGrid ?? false,
    );
    const needBottomChrome =
      (children.length === 1 && childChainHeight >= children[0].height) ||
      breakRules.boxDecorationBreak === 'clone';
    return node.chromeTop + childChainHeight + (needBottomChrome ? node.chromeBottom : 0);
  }

  if (node.kind === 'parallel') {
    const children = node.children ?? [];
    if (children.length === 0) return node.height;
    let maxChildStart = 0;
    for (let i = 0; i < children.length; i++) {
      const h = getMinStartHeight(children[i]);
      if (h > maxChildStart) maxChildStart = h;
    }
    const needBottomChrome = breakRules.boxDecorationBreak === 'clone';
    return node.chromeTop + maxChildStart + (needBottomChrome ? node.chromeBottom : 0);
  }

  return node.height;
}

/**
 * Computes the minimum vertical space required to start `nodes[startIndex]` AND satisfy any
 * `keepWithNext` (`breakAfter: 'avoid'`) chain following it.
 */
function getKeepWithNextChainMinHeight(
  nodes: PreparedNode[],
  startIndex: number,
  parentRowGap: number,
  isFlexOrGrid: boolean,
): number {
  let total = 0;
  let prevMarginBottom = 0;

  for (let i = startIndex; i < nodes.length; i++) {
    const node = nodes[i];
    const isFirst = i === startIndex;
    const effMarginTop = isFirst
      ? node.marginTop
      : isFlexOrGrid
        ? node.marginTop
        : Math.max(0, node.marginTop - prevMarginBottom);
    const gap = isFirst ? 0 : parentRowGap;

    const hasNext = i + 1 < nodes.length;
    const mustKeepWithNext = hasNext && node.breakRules.keepWithNext;

    if (mustKeepWithNext) {
      total += gap + effMarginTop + node.height + node.marginBottom;
      prevMarginBottom = node.marginBottom;
    } else {
      total += gap + effMarginTop + getMinStartHeight(node);
      break;
    }
  }

  return total;
}

interface ColumnCursorState {
  pageIndex: number;
  usedHeight: number;
  pages: FragmentSlice[][];
}

function createCursorState(): ColumnCursorState {
  return {
    pageIndex: 0,
    usedHeight: 0,
    pages: [[]],
  };
}

function advancePage(state: ColumnCursorState): void {
  state.pageIndex += 1;
  state.usedHeight = 0;
  while (state.pages.length <= state.pageIndex) {
    state.pages.push([]);
  }
}

function getFreeHeight(state: ColumnCursorState, geometry: PageGeometry): number {
  const pageCap = getPageContentHeight(state.pageIndex, geometry);
  return Math.max(0, pageCap - state.usedHeight);
}

function isAtTopOfPage(state: ColumnCursorState): boolean {
  return state.usedHeight <= EPSILON;
}

/**
 * Computes the effective spacing (rowGap + marginTop) before placing `node` on the current page.
 */
function computeEffectiveTopSpacing(
  node: PreparedNode,
  hasPrevSiblingOnSamePage: boolean,
  prevMarginBottomOnSamePage: number,
  parentRowGap: number,
  isFlexOrGrid: boolean,
  isAtPageStart: boolean,
): { gapBefore: number; effMarginTop: number } {
  if (!hasPrevSiblingOnSamePage) {
    // First item in this parent on the current page.
    // On continuation pages (pageIndex > 0 and at top of page), top margin collapses with page top.
    const effMarginTop = isAtPageStart ? 0 : node.marginTop;
    return { gapBefore: 0, effMarginTop };
  }

  const gapBefore = parentRowGap;
  const effMarginTop = isFlexOrGrid
    ? node.marginTop
    : Math.max(0, node.marginTop - prevMarginBottomOnSamePage);

  return { gapBefore, effMarginTop };
}

function buildWholeSubtreeSlices(nodes: PreparedNode[] | undefined): FragmentSlice[] | undefined {
  if (nodes == null || nodes.length === 0) return undefined;
  return nodes.map((child) => ({
    nodeId: child.id,
    kind: child.kind,
    fragmentPosition: 'single',
    fragmentIndex: 0,
    fragmentCount: 1,
    allocatedHeight: child.marginTop + child.height + child.marginBottom,
    marginTop: child.marginTop,
    marginBottom: child.marginBottom,
    chromeTop: child.chromeTop,
    chromeBottom: child.chromeBottom,
    children: buildWholeSubtreeSlices(child.children),
  }));
}

/**
 * Allocates a list of sibling nodes into `targetPages` (indexed by `state.pageIndex`),
 * updating `state.pageIndex` and `state.usedHeight`.
 */
function allocateNodeList(
  nodes: PreparedNode[],
  parentRowGap: number,
  isFlexOrGrid: boolean,
  state: ColumnCursorState,
  geometry: PageGeometry,
  emitSlice: (pageIndex: number, slice: FragmentSlice) => void,
  getReservedBottomOnCurrentPage: () => number,
  parentAdvance: () => void,
  onBeforePageAdvance?: () => void,
  onAfterPageAdvance?: () => void,
): void {
  let hasPrevOnPage = false;
  let prevMarginBottomOnPage = 0;

  const advance = () => {
    onBeforePageAdvance?.();
    parentAdvance();
    onAfterPageAdvance?.();
    hasPrevOnPage = false;
    prevMarginBottomOnPage = 0;
  };

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const { breakRules } = node;

    // 1. Explicit page break before
    if (breakRules.breakBefore === 'page' && !isAtTopOfPage(state)) {
      advance();
    }

    // 2. Check if this node (plus any keepWithNext chain) can start on the current page
    const checkSpacing = computeEffectiveTopSpacing(
      node,
      hasPrevOnPage,
      prevMarginBottomOnPage,
      parentRowGap,
      isFlexOrGrid,
      state.pageIndex > 0 && isAtTopOfPage(state),
    );

    const chainMinHeight = getKeepWithNextChainMinHeight(nodes, i, parentRowGap, isFlexOrGrid);
    const minNeededToStart =
      checkSpacing.gapBefore +
      checkSpacing.effMarginTop +
      (chainMinHeight - node.marginTop) +
      getReservedBottomOnCurrentPage();

    if (!isAtTopOfPage(state) && minNeededToStart > getFreeHeight(state, geometry) + EPSILON) {
      advance();
    }

    // 3. Allocate the node itself according to its kind & breakRules
    const startPageBeforeNode = state.pageIndex;
    const lastSliceRef: { slice: FragmentSlice | null } = { slice: null };

    allocateSingleNode(
      node,
      hasPrevOnPage,
      prevMarginBottomOnPage,
      parentRowGap,
      isFlexOrGrid,
      state,
      geometry,
      (pageIdx, slice) => {
        lastSliceRef.slice = slice;
        emitSlice(pageIdx, slice);
      },
      getReservedBottomOnCurrentPage,
      advance,
    );

    if (state.pageIndex !== startPageBeforeNode) {
      hasPrevOnPage = lastSliceRef.slice != null;
      prevMarginBottomOnPage = lastSliceRef.slice?.marginBottom ?? 0;
    } else if (lastSliceRef.slice != null) {
      hasPrevOnPage = true;
      prevMarginBottomOnPage = lastSliceRef.slice.marginBottom;
    }

    // 4. Explicit page break after
    if (breakRules.breakAfter === 'page' && i + 1 < nodes.length && !isAtTopOfPage(state)) {
      advance();
    }
  }
}

function allocateSingleNode(
  node: PreparedNode,
  hasPrevOnPage: boolean,
  prevMarginBottomOnPage: number,
  parentRowGap: number,
  isFlexOrGrid: boolean,
  state: ColumnCursorState,
  geometry: PageGeometry,
  emitSlice: (pageIndex: number, slice: FragmentSlice) => void,
  getReservedBottomOnCurrentPage: () => number,
  advance: () => void,
): void {
  const { breakRules } = node;

  // Case A: Atomic block (or any block with breakInside === 'avoid')
  if (node.kind === 'atomic' || breakRules.breakInside === 'avoid') {
    let spacing = computeEffectiveTopSpacing(
      node,
      hasPrevOnPage,
      prevMarginBottomOnPage,
      parentRowGap,
      isFlexOrGrid,
      state.pageIndex > 0 && isAtTopOfPage(state),
    );
    let required =
      spacing.gapBefore +
      spacing.effMarginTop +
      node.height +
      node.marginBottom +
      getReservedBottomOnCurrentPage();

    if (!isAtTopOfPage(state) && required > getFreeHeight(state, geometry) + EPSILON) {
      advance();
      spacing = computeEffectiveTopSpacing(
        node,
        false,
        0,
        parentRowGap,
        isFlexOrGrid,
        state.pageIndex > 0 && isAtTopOfPage(state),
      );
      required =
        spacing.gapBefore +
        spacing.effMarginTop +
        node.height +
        node.marginBottom +
        getReservedBottomOnCurrentPage();
    }

    const allocatedHeight =
      spacing.gapBefore + spacing.effMarginTop + node.height + node.marginBottom;
    state.usedHeight += allocatedHeight;

    emitSlice(state.pageIndex, {
      nodeId: node.id,
      kind: node.kind,
      fragmentPosition: 'single',
      fragmentIndex: 0,
      fragmentCount: 1,
      allocatedHeight,
      marginTop: spacing.gapBefore + spacing.effMarginTop,
      marginBottom: node.marginBottom,
      chromeTop: node.chromeTop,
      chromeBottom: node.chromeBottom,
      children: buildWholeSubtreeSlices(node.children),
    });
    return;
  }

  // Case B: Line-breakable text/inline block
  if (node.kind === 'lines') {
    const lines = node.lines ?? [];
    if (lines.length === 0) {
      const spacing = computeEffectiveTopSpacing(
        node,
        hasPrevOnPage,
        prevMarginBottomOnPage,
        parentRowGap,
        isFlexOrGrid,
        state.pageIndex > 0 && isAtTopOfPage(state),
      );
      const allocatedHeight =
        spacing.gapBefore + spacing.effMarginTop + node.height + node.marginBottom;
      state.usedHeight += allocatedHeight;
      emitSlice(state.pageIndex, {
        nodeId: node.id,
        kind: 'lines',
        fragmentPosition: 'single',
        fragmentIndex: 0,
        fragmentCount: 1,
        allocatedHeight,
        marginTop: spacing.gapBefore + spacing.effMarginTop,
        marginBottom: node.marginBottom,
        chromeTop: node.chromeTop,
        chromeBottom: node.chromeBottom,
      });
      return;
    }

    let lineCursor = 0;
    let curHasPrev = hasPrevOnPage;
    let curPrevMarginBottom = prevMarginBottomOnPage;

    while (lineCursor < lines.length) {
      const isFirstSlice = lineCursor === 0;
      const spacing = isFirstSlice
        ? computeEffectiveTopSpacing(
            node,
            curHasPrev,
            curPrevMarginBottom,
            parentRowGap,
            isFlexOrGrid,
            state.pageIndex > 0 && isAtTopOfPage(state),
          )
        : { gapBefore: 0, effMarginTop: 0 };

      const chromeTop =
        isFirstSlice || breakRules.boxDecorationBreak === 'clone' ? node.chromeTop : 0;
      const freeHeight = getFreeHeight(state, geometry) - getReservedBottomOnCurrentPage();

      // Check if all remaining lines fit on this page
      const remainingLinesHeight = getLinesRangeHeight(lines, lineCursor, lines.length - 1);
      const totalToFinish =
        spacing.gapBefore +
        spacing.effMarginTop +
        chromeTop +
        remainingLinesHeight +
        node.chromeBottom +
        node.marginBottom;

      if (totalToFinish <= freeHeight + EPSILON) {
        const allocatedHeight = totalToFinish;
        state.usedHeight += allocatedHeight;
        emitSlice(state.pageIndex, {
          nodeId: node.id,
          kind: 'lines',
          fragmentPosition: isFirstSlice ? 'single' : 'end',
          fragmentIndex: 0,
          fragmentCount: 1,
          allocatedHeight,
          marginTop: spacing.gapBefore + spacing.effMarginTop,
          marginBottom: node.marginBottom,
          chromeTop,
          chromeBottom: node.chromeBottom,
          lineRange: {
            startLine: lineCursor,
            endLine: lines.length - 1,
            offsetTop: lines[lineCursor].top,
            clipHeight: remainingLinesHeight,
          },
        });
        break;
      }

      // Otherwise, find how many lines fit on this page
      const sliceChromeBottom = breakRules.boxDecorationBreak === 'clone' ? node.chromeBottom : 0;
      const availableForLines =
        freeHeight - spacing.gapBefore - spacing.effMarginTop - chromeTop - sliceChromeBottom;

      let maxEndLine = lineCursor - 1;
      for (let l = lineCursor; l < lines.length; l++) {
        const h = getLinesRangeHeight(lines, lineCursor, l);
        if (h <= availableForLines + EPSILON) {
          maxEndLine = l;
        } else {
          break;
        }
      }

      let fitCount = maxEndLine - lineCursor + 1;

      // Enforce orphans on the first slice
      const minOrphans = isFirstSlice ? Math.min(lines.length, breakRules.orphans) : 1;
      if (fitCount < minOrphans) {
        if (!isAtTopOfPage(state)) {
          advance();
          curHasPrev = false;
          curPrevMarginBottom = 0;
          continue;
        }
        // At top of an empty page and even 1 line overflows: force at least 1 line to make progress
        fitCount = Math.max(1, fitCount);
        maxEndLine = Math.min(lines.length - 1, lineCursor + fitCount - 1);
      }

      // Enforce widows on the remaining lines
      const remainingAfter = lines.length - (lineCursor + fitCount);
      if (remainingAfter > 0 && remainingAfter < breakRules.widows) {
        const neededBorrow = breakRules.widows - remainingAfter;
        if (fitCount - neededBorrow >= minOrphans) {
          fitCount -= neededBorrow;
          maxEndLine = lineCursor + fitCount - 1;
        } else if (!isAtTopOfPage(state)) {
          // Cannot satisfy both orphans and widows on this page; push to next page
          advance();
          curHasPrev = false;
          curPrevMarginBottom = 0;
          continue;
        }
      }

      const sliceLinesHeight = getLinesRangeHeight(lines, lineCursor, maxEndLine);
      const isLastSlice = maxEndLine === lines.length - 1;
      const finalChromeBottom = isLastSlice ? node.chromeBottom : sliceChromeBottom;
      const finalMarginBottom = isLastSlice ? node.marginBottom : 0;
      const allocatedHeight =
        spacing.gapBefore +
        spacing.effMarginTop +
        chromeTop +
        sliceLinesHeight +
        finalChromeBottom +
        finalMarginBottom;

      state.usedHeight += allocatedHeight;
      emitSlice(state.pageIndex, {
        nodeId: node.id,
        kind: 'lines',
        fragmentPosition: isFirstSlice && isLastSlice ? 'single' : isFirstSlice ? 'start' : 'middle',
        fragmentIndex: 0,
        fragmentCount: 1,
        allocatedHeight,
        marginTop: spacing.gapBefore + spacing.effMarginTop,
        marginBottom: finalMarginBottom,
        chromeTop,
        chromeBottom: finalChromeBottom,
        lineRange: {
          startLine: lineCursor,
          endLine: maxEndLine,
          offsetTop: lines[lineCursor].top,
          clipHeight: sliceLinesHeight,
        },
      });

      lineCursor = maxEndLine + 1;
      if (lineCursor < lines.length) {
        advance();
        curHasPrev = false;
        curPrevMarginBottom = 0;
      }
    }
    return;
  }

  // Case C: Splittable Container (`kind === 'container'`)
  if (node.kind === 'container') {
    const children = node.children ?? [];
    if (children.length === 0) {
      const spacing = computeEffectiveTopSpacing(
        node,
        hasPrevOnPage,
        prevMarginBottomOnPage,
        parentRowGap,
        isFlexOrGrid,
        state.pageIndex > 0 && isAtTopOfPage(state),
      );
      const allocatedHeight =
        spacing.gapBefore + spacing.effMarginTop + node.height + node.marginBottom;
      state.usedHeight += allocatedHeight;
      emitSlice(state.pageIndex, {
        nodeId: node.id,
        kind: 'container',
        fragmentPosition: 'single',
        fragmentIndex: 0,
        fragmentCount: 1,
        allocatedHeight,
        marginTop: spacing.gapBefore + spacing.effMarginTop,
        marginBottom: node.marginBottom,
        chromeTop: node.chromeTop,
        chromeBottom: node.chromeBottom,
        children: [],
      });
      return;
    }

    const openSpacing = computeEffectiveTopSpacing(
      node,
      hasPrevOnPage,
      prevMarginBottomOnPage,
      parentRowGap,
      isFlexOrGrid,
      state.pageIndex > 0 && isAtTopOfPage(state),
    );

    let currentContainerSlice: FragmentSlice = {
      nodeId: node.id,
      kind: 'container',
      fragmentPosition: 'single',
      fragmentIndex: 0,
      fragmentCount: 1,
      allocatedHeight: openSpacing.gapBefore + openSpacing.effMarginTop + node.chromeTop,
      marginTop: openSpacing.gapBefore + openSpacing.effMarginTop,
      marginBottom: 0,
      chromeTop: node.chromeTop,
      chromeBottom: 0,
      children: [],
    };
    let currentContainerPageIndex = state.pageIndex;
    let usedHeightBeforeChildren = state.usedHeight + currentContainerSlice.allocatedHeight;
    state.usedHeight = usedHeightBeforeChildren;

    const closeContainerOnCurrentPage = (isFinalFragment: boolean) => {
      const addBottomChrome =
        isFinalFragment || breakRules.boxDecorationBreak === 'clone' ? node.chromeBottom : 0;
      const addMarginBottom = isFinalFragment ? node.marginBottom : 0;

      if (currentContainerSlice.children != null && currentContainerSlice.children.length > 0) {
        const childrenUsed = state.usedHeight - usedHeightBeforeChildren;
        currentContainerSlice.chromeBottom = addBottomChrome;
        currentContainerSlice.marginBottom = addMarginBottom;
        currentContainerSlice.allocatedHeight =
          currentContainerSlice.marginTop +
          currentContainerSlice.chromeTop +
          childrenUsed +
          addBottomChrome +
          addMarginBottom;
        state.usedHeight += addBottomChrome + addMarginBottom;
        emitSlice(currentContainerPageIndex, currentContainerSlice);
      } else {
        // Reclaim unused opening chrome if no children were emitted on this page
        state.usedHeight -= currentContainerSlice.allocatedHeight;
      }
    };

    const openContinuationOnNewPage = () => {
      const contChromeTop =
        (breakRules.boxDecorationBreak === 'clone' ? node.chromeTop : 0) +
        (node.continuationHeaderHeight ?? 0);
      currentContainerPageIndex = state.pageIndex;
      currentContainerSlice = {
        nodeId: node.id,
        kind: 'container',
        fragmentPosition: 'middle',
        fragmentIndex: 0,
        fragmentCount: 1,
        allocatedHeight: contChromeTop,
        marginTop: 0,
        marginBottom: 0,
        chromeTop: contChromeTop,
        chromeBottom: 0,
        children: [],
      };
      usedHeightBeforeChildren = state.usedHeight + contChromeTop;
      state.usedHeight = usedHeightBeforeChildren;
    };

    allocateNodeList(
      children,
      node.rowGap,
      node.isFlexOrGrid ?? false,
      state,
      geometry,
      (_pageIdx, childSlice) => {
        currentContainerSlice.children!.push(childSlice);
      },
      () =>
        getReservedBottomOnCurrentPage() +
        (breakRules.boxDecorationBreak === 'clone' ? node.chromeBottom : 0),
      advance,
      () => closeContainerOnCurrentPage(false),
      () => openContinuationOnNewPage(),
    );

    closeContainerOnCurrentPage(true);
    return;
  }

  // Case D: Parallel row (`kind === 'parallel'`)
  if (node.kind === 'parallel') {
    const children = node.children ?? [];
    const spacing = computeEffectiveTopSpacing(
      node,
      hasPrevOnPage,
      prevMarginBottomOnPage,
      parentRowGap,
      isFlexOrGrid,
      state.pageIndex > 0 && isAtTopOfPage(state),
    );

    const startPage = state.pageIndex;
    const startUsed = state.usedHeight + spacing.gapBefore + spacing.effMarginTop + node.chromeTop;

    const childBranchStates: ColumnCursorState[] = children.map(() => {
      const branch = createCursorState();
      branch.pageIndex = startPage;
      branch.usedHeight = startUsed;
      while (branch.pages.length <= startPage) {
        branch.pages.push([]);
      }
      return branch;
    });

    for (let c = 0; c < children.length; c++) {
      const child = children[c];
      const branch = childBranchStates[c];
      allocateSingleNode(
        child,
        false,
        0,
        0,
        true,
        branch,
        geometry,
        (pageIdx, slice) => {
          while (branch.pages.length <= pageIdx) {
            branch.pages.push([]);
          }
          branch.pages[pageIdx].push(slice);
        },
        getReservedBottomOnCurrentPage,
        () => advancePage(branch),
      );
    }

    let maxEndPage = startPage;
    for (let c = 0; c < childBranchStates.length; c++) {
      if (childBranchStates[c].pageIndex > maxEndPage) {
        maxEndPage = childBranchStates[c].pageIndex;
      }
    }

    for (let p = startPage; p <= maxEndPage; p++) {
      if (p > startPage) {
        advance();
      }
      const isFirst = p === startPage;
      const isLast = p === maxEndPage;
      const pageChromeTop =
        isFirst || breakRules.boxDecorationBreak === 'clone' ? node.chromeTop : 0;
      const pageChromeBottom =
        isLast || breakRules.boxDecorationBreak === 'clone' ? node.chromeBottom : 0;
      const pageMarginTop = isFirst ? spacing.gapBefore + spacing.effMarginTop : 0;
      const pageMarginBottom = isLast ? node.marginBottom : 0;

      const pageChildren: FragmentSlice[] = [];
      let maxChildAllocated = 0;

      for (let c = 0; c < childBranchStates.length; c++) {
        const slicesOnPage = childBranchStates[c].pages[p] ?? [];
        for (let s = 0; s < slicesOnPage.length; s++) {
          pageChildren.push(slicesOnPage[s]);
          if (slicesOnPage[s].allocatedHeight > maxChildAllocated) {
            maxChildAllocated = slicesOnPage[s].allocatedHeight;
          }
        }
      }

      const allocatedHeight =
        pageMarginTop + pageChromeTop + maxChildAllocated + pageChromeBottom + pageMarginBottom;

      if (isFirst) {
        state.usedHeight = (p === startPage ? startUsed - spacing.gapBefore - spacing.effMarginTop - node.chromeTop : 0) + allocatedHeight;
      } else {
        state.usedHeight += allocatedHeight;
      }

      emitSlice(p, {
        nodeId: node.id,
        kind: 'parallel',
        fragmentPosition: isFirst && isLast ? 'single' : isFirst ? 'start' : isLast ? 'end' : 'middle',
        fragmentIndex: 0,
        fragmentCount: 1,
        allocatedHeight,
        marginTop: pageMarginTop,
        marginBottom: pageMarginBottom,
        chromeTop: pageChromeTop,
        chromeBottom: pageChromeBottom,
        children: pageChildren,
      });
    }
  }
}

/**
 * Post-pass to compute exact `fragmentIndex`, `fragmentCount`, and `fragmentPosition`
 * (`'single' | 'start' | 'middle' | 'end'`) for every slice across all pages of a column.
 */
function finalizeFragmentPositions(pages: FragmentSlice[][]): void {
  const occurrences = new Map<string, FragmentSlice[]>();

  function collect(slices: FragmentSlice[]): void {
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      let list = occurrences.get(slice.nodeId);
      if (list == null) {
        list = [];
        occurrences.set(slice.nodeId, list);
      }
      list.push(slice);
      if (slice.children != null && slice.children.length > 0) {
        collect(slice.children);
      }
    }
  }

  for (let p = 0; p < pages.length; p++) {
    collect(pages[p]);
  }

  for (const list of occurrences.values()) {
    const count = list.length;
    for (let idx = 0; idx < count; idx++) {
      const slice = list[idx];
      slice.fragmentIndex = idx;
      slice.fragmentCount = count;
      let pos: FragmentPosition = 'single';
      if (count > 1) {
        if (idx === 0) pos = 'start';
        else if (idx === count - 1) pos = 'end';
        else pos = 'middle';
      }
      slice.fragmentPosition = pos;
    }
  }
}

function sumSlicesHeight(slices: FragmentSlice[]): number {
  let sum = 0;
  for (let i = 0; i < slices.length; i++) {
    sum += slices[i].allocatedHeight;
  }
  return sum;
}

/**
 * Pure arithmetic pagination solver ("layout" phase).
 * Takes a `PreparedDocumentInput` and `PageGeometry` and returns a `PaginatedDocument`
 * with zero DOM reads or side effects.
 */
export function paginateTree(
  input: PreparedDocumentInput,
  geometry: PageGeometry,
): PaginatedDocument {
  const columnCount = Math.max(1, input.columns.length, geometry.columnWidths.length);
  const perColumnPages: FragmentSlice[][][] = [];
  let maxPageCount = 1;

  for (let colIdx = 0; colIdx < columnCount; colIdx++) {
    const colNodes = input.columns[colIdx] ?? [];
    const colRowGap = input.columnRowGaps?.[colIdx] ?? geometry.rowGap;
    const colIsFlex = input.columnIsFlexOrGrid?.[colIdx] ?? false;

    const state = createCursorState();
    allocateNodeList(
      colNodes,
      colRowGap,
      colIsFlex,
      state,
      geometry,
      (pageIdx, slice) => {
        while (state.pages.length <= pageIdx) {
          state.pages.push([]);
        }
        state.pages[pageIdx].push(slice);
      },
      () => 0,
      () => advancePage(state),
    );

    // Trim trailing empty pages if > 1
    while (state.pages.length > 1 && state.pages[state.pages.length - 1].length === 0) {
      state.pages.pop();
    }

    finalizeFragmentPositions(state.pages);
    perColumnPages.push(state.pages);
    if (state.pages.length > maxPageCount) {
      maxPageCount = state.pages.length;
    }
  }

  const pages: PaginatedPage[] = [];

  for (let pageIdx = 0; pageIdx < maxPageCount; pageIdx++) {
    const contentHeight = getPageContentHeight(pageIdx, geometry);
    const columns: PaginatedColumn[] = [];

    for (let colIdx = 0; colIdx < columnCount; colIdx++) {
      const colSlices = perColumnPages[colIdx]?.[pageIdx] ?? [];
      const usedHeight = sumSlicesHeight(colSlices);
      const colWidth =
        geometry.columnWidths[colIdx] ??
        geometry.columnWidths[0] ??
        Math.max(0, geometry.width - geometry.padding.left - geometry.padding.right) / columnCount;

      columns.push({
        columnIndex: colIdx,
        width: colWidth,
        usedHeight,
        freeHeight: Math.max(0, contentHeight - usedHeight),
        slices: colSlices,
      });
    }

    pages.push({
      pageIndex: pageIdx,
      pageNumber: pageIdx + 1,
      width: geometry.width,
      height: geometry.height,
      contentHeight,
      hasFirstPageHeader: pageIdx === 0 && geometry.firstPageHeaderHeight > 0,
      hasRunningHeader: geometry.runningHeaderHeight > 0,
      hasFooter: geometry.footerHeight > 0,
      columns,
    });
  }

  return {
    pages,
    totalPages: pages.length,
    geometry,
  };
}
