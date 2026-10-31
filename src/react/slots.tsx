import React from 'react';
import { type ColumnWidthInput, type CssLength, toPx } from '../core';
import {
  BlockPathContext,
  DocumentContext,
  FragmentContext,
  type FragmentContextValue,
  LegacyRegisterContext,
  type LegacyRegisterResult,
  type PageInfoContextValue,
  PageSliceContext,
} from './context';

export interface HeaderProps {
  /**
   * Whether the header appears only on the first page (`'first'`), repeats on every page (`'all'`),
   * or appears strictly on continuation pages (`'continuation'`, pages >= 2). Defaults to `'first'`.
   */
  mode?: 'first' | 'all' | 'continuation';
  children?: React.ReactNode | ((page: PageInfoContextValue) => React.ReactNode);
  /** Legacy v3 prop: React element to render inside the header */
  element?: React.ReactNode;
  /** Legacy v3 memoization key */
  rootKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Header(_props: HeaderProps): React.ReactElement | null {
  return null;
}
Header.displayName = 'ReactPaperHeader';

export interface FooterProps {
  children?: React.ReactNode | ((page: PageInfoContextValue) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
}

export function Footer(_props: FooterProps): React.ReactElement | null {
  return null;
}
Footer.displayName = 'ReactPaperFooter';

export interface PageLayerProps {
  children?: React.ReactNode | ((page: PageInfoContextValue) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders full-page background/underlay content (`position: absolute; inset: 0`) behind the columns on each page.
 */
export function PageUnderlay(_props: PageLayerProps): React.ReactElement | null {
  return null;
}
PageUnderlay.displayName = 'ReactPaperPageUnderlay';

/**
 * Renders full-page overlay content (`position: absolute; inset: 0; pointer-events: none`) above the columns on each page.
 */
export function PageOverlay(_props: PageLayerProps): React.ReactElement | null {
  return null;
}
PageOverlay.displayName = 'ReactPaperPageOverlay';

export interface ColumnsProps {
  /** Horizontal gap between columns (e.g. `'16px'`, `'10mm'`, `16`) */
  gap?: CssLength;
  /** Explicit column widths (e.g. `['30%', '70%']`, `['1fr', '2fr']`) */
  widths?: ColumnWidthInput[];
  /** Default vertical gap between items in each column */
  rowGap?: CssLength;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Columns({ gap, className, style, children }: ColumnsProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        gap: gap != null ? toPx(gap) : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
Columns.displayName = 'ReactPaperColumns';

export interface ColumnProps {
  /** Optional width for this column (e.g. `'30%'`, `'200px'`, `'1fr'`) */
  width?: ColumnWidthInput;
  /** Optional vertical row-gap between items in this column */
  gap?: CssLength;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Column({ width, gap, className, style, children }: ColumnProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        flex: width != null ? (typeof width === 'number' ? `${width}px` : width) : '1 1 0px',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: gap != null ? toPx(gap) : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
Column.displayName = 'ReactPaperColumn';

// ============================================================================
// Legacy v3 Compatibility Primitives (<Root>, <Level>, <Node>)
// ============================================================================

export interface RootProps {
  element: React.ReactNode;
  rootKey?: string;
  content?: 'block' | 'text';
}

const MemoizedElementHost = React.memo(
  function MemoizedElementHost({ element }: { element: React.ReactNode; rootKey?: string; memoize: boolean }) {
    return <>{element}</>;
  },
  (prev, next) => prev.memoize && prev.rootKey != null && prev.rootKey === next.rootKey,
);

export function Root({ element, rootKey, content = 'text' }: RootProps): React.ReactElement | null {
  const { memoize } = React.useContext(DocumentContext);
  return (
    <LegacyNodeBridge
      element={<MemoizedElementHost element={element} rootKey={rootKey} memoize={memoize} />}
      content={content}
    />
  );
}
Root.displayName = 'ReactPaperRoot';

export interface NodeProps {
  element: React.ReactNode;
  content?: 'block' | 'text';
}

export function Node({ element, content = 'text' }: NodeProps): React.ReactElement | null {
  return <LegacyNodeBridge element={element} content={content} />;
}
Node.displayName = 'ReactPaperNode';

export interface LevelProps {
  children?: React.ReactNode;
  parallel?: boolean;
}

export function Level({ children, parallel = false }: LevelProps): React.ReactElement {
  const mapped: React.ReactNode[] = [];

  function collect(nodes: React.ReactNode): void {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;
      if (child.type === React.Fragment) {
        collect(child.props.children);
        return;
      }
      if (child.type === Node || (child.type as any)?.displayName === 'ReactPaperNode') {
        mapped.push(
          <LegacyNodeBridge
            key={mapped.length}
            element={child.props.element}
            content={parallel ? 'parallel' : (child.props.content ?? 'text')}
          />,
        );
      } else {
        mapped.push(child);
      }
    });
  }

  collect(children);
  return <>{mapped}</>;
}
Level.displayName = 'ReactPaperLevel';

interface LegacyNodeBridgeProps {
  element: React.ReactNode;
  content: 'block' | 'text' | 'parallel';
}

function LegacyNodeBridge(rawProps: LegacyNodeBridgeProps): React.ReactElement | null {
  const { element, content } = rawProps;
  const parentPath = React.useContext(BlockPathContext);
  const { isMeasurementPass, sliceMap } = React.useContext(PageSliceContext);
  const tokenRef = React.useRef<object>(rawProps);

  let myIndex = 0;
  if (parentPath != null) {
    const existing = parentPath.childCounter.byToken.get(tokenRef.current);
    if (existing != null) {
      myIndex = existing;
    } else {
      myIndex = parentPath.childCounter.nextIndex++;
      parentPath.childCounter.byToken.set(tokenRef.current, myIndex);
    }
  }

  const nodeId = parentPath != null ? `${parentPath.parentId}.${myIndex}` : `0.${myIndex}`;

  const childCounter = {
    nextIndex: 0,
    byToken: new WeakMap<object, number>(),
  };

  const slice = !isMeasurementPass && sliceMap != null ? sliceMap.get(nodeId) : undefined;

  const register = React.useCallback(
    (display = true): LegacyRegisterResult => {
      const breakInside = content === 'block' ? 'avoid' : 'auto';
      const kind = content === 'block' ? 'atomic' : content === 'parallel' ? 'parallel' : undefined;
      return {
        ref: null,
        'data-rp-node': '',
        'data-rp-id': nodeId,
        'data-rp-display': display ? 'visible' : 'none',
        ...(kind != null ? { 'data-rp-kind': kind } : {}),
        'data-rp-break-inside': breakInside,
      };
    },
    [content, nodeId],
  );

  if (!isMeasurementPass && sliceMap != null && slice == null) {
    return null;
  }

  const fragmentValue: FragmentContextValue = {
    position: slice?.fragmentPosition ?? 'single',
    index: slice?.fragmentIndex ?? 0,
    count: slice?.fragmentCount ?? 1,
    isFirst: (slice?.fragmentIndex ?? 0) === 0,
    isLast: (slice?.fragmentIndex ?? 0) === (slice?.fragmentCount ?? 1) - 1,
    isContinuation: (slice?.fragmentIndex ?? 0) > 0,
    isSplit: (slice?.fragmentCount ?? 1) > 1,
  };

  const isSplitLinesSlice =
    !isMeasurementPass &&
    slice != null &&
    slice.kind === 'lines' &&
    slice.lineRange != null &&
    fragmentValue.isSplit;

  const innerContent = (
    <BlockPathContext.Provider
      value={{
        parentId: nodeId,
        childCounter,
      }}
    >
      <FragmentContext.Provider value={fragmentValue}>
        <LegacyRegisterContext.Provider value={{ register }}>
          {element}
        </LegacyRegisterContext.Provider>
      </FragmentContext.Provider>
    </BlockPathContext.Provider>
  );

  if (isSplitLinesSlice && slice.lineRange != null) {
    const clipTop = (slice.fragmentIndex > 0 ? slice.chromeTop : 0) + slice.lineRange.offsetTop;
    const windowHeight =
      (slice.fragmentIndex === 0 ? slice.chromeTop : 0) +
      slice.lineRange.clipHeight +
      (fragmentValue.isLast ? slice.chromeBottom : 0);

    return (
      <div
        className="rp-legacy-slice-window"
        aria-hidden={slice.fragmentIndex === 0 ? undefined : true}
        style={{
          overflow: 'hidden',
          height: windowHeight,
          maxHeight: windowHeight,
          marginTop: slice.marginTop,
          marginBottom: slice.marginBottom,
        }}
      >
        <div
          className="rp-legacy-slice-inner"
          style={{
            position: 'relative',
            top: -clipTop,
          }}
        >
          {innerContent}
        </div>
      </div>
    );
  }

  return innerContent;
}
