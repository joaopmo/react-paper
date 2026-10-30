import React from 'react';
import {
  type BoxDecorationBreakMode,
  type BreakEdgeMode,
  type BreakInsideMode,
  type PreparedNodeKind,
} from '../core';
import {
  BlockPathContext,
  FragmentContext,
  type FragmentContextValue,
  PageSliceContext,
} from './context';

export interface BlockProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** HTML tag or custom React component to render (defaults to `'div'`) */
  as?: React.ElementType;
  /** Optional explicit node ID */
  id?: string;
  /** Explicit node layout kind (`'atomic' | 'container' | 'lines' | 'parallel'`) */
  kind?: PreparedNodeKind;
  /** Controls whether this block can break across pages (`'avoid' | 'auto'`) */
  breakInside?: BreakInsideMode;
  /** Forces or avoids a page break before this block (`'auto' | 'page'`) */
  breakBefore?: 'auto' | 'page';
  /** Forces a page break after, or keeps this block with the next sibling (`'auto' | 'page' | 'avoid'`) */
  breakAfter?: BreakEdgeMode;
  /** Shorthand for `breakAfter="avoid"`: prevents this block (e.g. a heading) from being stranded at the bottom of a page */
  keepWithNext?: boolean;
  /** Minimum lines left at the bottom of a page when splitting text (default: 2) */
  orphans?: number;
  /** Minimum lines carried over to the top of the next page when splitting text (default: 2) */
  widows?: number;
  /** Whether padding and borders are sliced at page breaks (`'slice'`) or cloned on each fragment (`'clone'`) */
  boxDecorationBreak?: BoxDecorationBreakMode;
  /** Marks this block as containing line-splittable text */
  splittableText?: boolean;
  /** Whether the block is visible (default `true`) */
  display?: boolean;
  /** Optional header rendered at the top of continuation fragments (`index > 0`) when a container splits across pages */
  continuationHeader?: React.ReactNode | ((fragment: FragmentContextValue) => React.ReactNode);
  /** Children or render prop receiving the current `FragmentContextValue` */
  children?: React.ReactNode | ((fragment: FragmentContextValue) => React.ReactNode);
}

export const Block = React.forwardRef<HTMLElement, BlockProps>(function Block(
  {
    as: Component = 'div',
    id,
    kind,
    breakInside,
    breakBefore,
    breakAfter,
    keepWithNext,
    orphans,
    widows,
    boxDecorationBreak = 'slice',
    splittableText = false,
    display = true,
    continuationHeader,
    style,
    children,
    ...rest
  },
  forwardedRef,
) {
  const parentPath = React.useContext(BlockPathContext);
  const { isMeasurementPass, sliceMap } = React.useContext(PageSliceContext);

  const assignedIndexRef = React.useRef<{ passId: number; index: number } | null>(null);
  if (parentPath != null) {
    if (
      assignedIndexRef.current == null ||
      assignedIndexRef.current.passId !== parentPath.passId
    ) {
      assignedIndexRef.current = {
        passId: parentPath.passId,
        index: parentPath.childCounter.nextIndex++,
      };
    }
  }

  const myIndex = assignedIndexRef.current?.index ?? 0;
  const nodeId = id ?? (parentPath != null ? `${parentPath.parentId}.${myIndex}` : `0.${myIndex}`);

  const ownPassIdRef = React.useRef(0);
  ownPassIdRef.current += 1;
  const childCounter = { nextIndex: 0 };

  const slice = !isMeasurementPass && sliceMap != null ? sliceMap.get(nodeId) : undefined;

  const fragmentValue: FragmentContextValue = React.useMemo(() => {
    const position = slice?.fragmentPosition ?? 'single';
    const index = slice?.fragmentIndex ?? 0;
    const count = slice?.fragmentCount ?? 1;
    return {
      position,
      index,
      count,
      isFirst: index === 0,
      isLast: index === count - 1,
      isContinuation: index > 0,
      isSplit: count > 1,
    };
  }, [slice?.fragmentPosition, slice?.fragmentIndex, slice?.fragmentCount]);

  if (!isMeasurementPass && sliceMap != null && slice == null) {
    return null;
  }

  const resolvedKind: PreparedNodeKind | undefined =
    kind ?? (splittableText ? 'lines' : undefined);
  const resolvedBreakInside: BreakInsideMode | undefined =
    breakInside ?? (splittableText ? 'auto' : undefined);

  const computedStyle: React.CSSProperties = { ...style };
  if (!display) {
    computedStyle.display = 'none';
  }

  if (!isMeasurementPass && fragmentValue.isSplit) {
    if (!fragmentValue.isFirst) {
      computedStyle.marginTop = 0;
      if (boxDecorationBreak === 'slice') {
        computedStyle.paddingTop = 0;
        computedStyle.borderTopWidth = 0;
        computedStyle.borderTopLeftRadius = 0;
        computedStyle.borderTopRightRadius = 0;
      }
    }
    if (!fragmentValue.isLast) {
      computedStyle.marginBottom = 0;
      if (boxDecorationBreak === 'slice') {
        computedStyle.paddingBottom = 0;
        computedStyle.borderBottomWidth = 0;
        computedStyle.borderBottomLeftRadius = 0;
        computedStyle.borderBottomRightRadius = 0;
      }
    }
  }

  const renderedChildren =
    typeof children === 'function' ? children(fragmentValue) : children;

  const renderedContinuationHeader =
    continuationHeader != null
      ? typeof continuationHeader === 'function'
        ? continuationHeader(fragmentValue)
        : continuationHeader
      : null;

  const isSplitLinesSlice =
    !isMeasurementPass &&
    slice != null &&
    slice.kind === 'lines' &&
    slice.lineRange != null &&
    fragmentValue.isSplit;

  return (
    <BlockPathContext.Provider
      value={{
        parentId: nodeId,
        passId: ownPassIdRef.current,
        childCounter,
      }}
    >
      <FragmentContext.Provider value={fragmentValue}>
        <Component
          ref={forwardedRef}
          data-rp-node=""
          data-rp-id={nodeId}
          data-rp-kind={resolvedKind}
          data-rp-break-inside={resolvedBreakInside}
          data-rp-break-before={breakBefore}
          data-rp-break-after={breakAfter ?? (keepWithNext ? 'avoid' : undefined)}
          data-rp-keep-with-next={keepWithNext ? 'true' : undefined}
          data-rp-orphans={orphans}
          data-rp-widows={widows}
          data-rp-box-decoration-break={boxDecorationBreak}
          data-rp-display={display ? 'visible' : 'none'}
          data-rp-fragment={fragmentValue.position}
          data-rp-fragment-index={fragmentValue.index}
          data-rp-fragment-count={fragmentValue.count}
          style={computedStyle}
          {...rest}
        >
          {isMeasurementPass && renderedContinuationHeader != null && (
            <div
              data-rp-continuation-header=""
              aria-hidden="true"
              style={{
                position: 'absolute',
                visibility: 'hidden',
                pointerEvents: 'none',
                left: 0,
                right: 0,
              }}
            >
              {renderedContinuationHeader}
            </div>
          )}
          {!isMeasurementPass && fragmentValue.isContinuation && renderedContinuationHeader != null && (
            <div className="rp-continuation-header">{renderedContinuationHeader}</div>
          )}
          {isSplitLinesSlice && slice.lineRange != null ? (
            <span
              className="rp-line-slice-window"
              style={{
                display: 'block',
                overflow: 'hidden',
                height: slice.lineRange.clipHeight,
                maxHeight: slice.lineRange.clipHeight,
              }}
            >
              <span
                className="rp-line-slice-inner"
                style={{
                  display: 'block',
                  position: 'relative',
                  top: -slice.lineRange.offsetTop,
                }}
              >
                {renderedChildren}
              </span>
            </span>
          ) : (
            renderedChildren
          )}
        </Component>
      </FragmentContext.Provider>
    </BlockPathContext.Provider>
  );
});

/**
 * Semantic container block that defaults to `breakInside="auto"` so its child blocks can split across pages.
 */
export const Section = React.forwardRef<HTMLElement, BlockProps>(function Section(
  { as = 'section', breakInside = 'auto', ...props },
  ref,
) {
  return <Block ref={ref} as={as} breakInside={breakInside} {...props} />;
});

/**
 * Semantic atomic block that defaults to `breakInside="avoid"` so its contents are never split across a page boundary.
 */
export const KeepTogether = React.forwardRef<HTMLElement, BlockProps>(function KeepTogether(
  { breakInside = 'avoid', ...props },
  ref,
) {
  return <Block ref={ref} breakInside={breakInside} {...props} />;
});

/**
 * Line-splittable text block (`breakInside="auto"`, `splittableText={true}`).
 * Measures wrapped text lines via `Range.getClientRects()` and splits cleanly between lines while honoring `orphans` and `widows`.
 */
export const Text = React.forwardRef<HTMLElement, BlockProps>(function Text(
  { as = 'p', breakInside = 'auto', splittableText = true, ...props },
  ref,
) {
  return (
    <Block
      ref={ref}
      as={as}
      breakInside={breakInside}
      splittableText={splittableText}
      {...props}
    />
  );
});

/**
 * Side-by-side synchronized row where child cells break in lockstep across pages.
 */
export const Parallel = React.forwardRef<HTMLElement, BlockProps>(function Parallel(
  { kind = 'parallel', breakInside = 'auto', ...props },
  ref,
) {
  return <Block ref={ref} kind={kind} breakInside={breakInside} {...props} />;
});
