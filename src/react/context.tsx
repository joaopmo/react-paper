import React from 'react';
import { type FragmentPosition, type FragmentSlice, type PaginatedDocument } from '../core';

export interface FragmentContextValue {
  /** 'single' | 'start' | 'middle' | 'end' */
  position: FragmentPosition;
  /** 0-based index of this fragment slice */
  index: number;
  /** Total number of fragments this node was split into across pages */
  count: number;
  /** True when index === 0 */
  isFirst: boolean;
  /** True when index === count - 1 */
  isLast: boolean;
  /** True when index > 0 (this fragment is a continuation on a subsequent page) */
  isContinuation: boolean;
  /** True when count > 1 (the node was split across multiple pages) */
  isSplit: boolean;
}

const DEFAULT_FRAGMENT_CONTEXT: FragmentContextValue = {
  position: 'single',
  index: 0,
  count: 1,
  isFirst: true,
  isLast: true,
  isContinuation: false,
  isSplit: false,
};

export const FragmentContext = React.createContext<FragmentContextValue>(DEFAULT_FRAGMENT_CONTEXT);

/**
 * Hook returning fragmentation state for the nearest enclosing `<Block>` or `<Section>`.
 * Useful for styling or rendering continuation indicators (e.g., `"Experience (continued)"` or timeline caps)
 * when a container splits across multiple pages.
 */
export function useFragment(): FragmentContextValue {
  return React.useContext(FragmentContext);
}

export interface PageInfoContextValue {
  /** 0-based page index */
  pageIndex: number;
  /** 1-based page number */
  pageNumber: number;
  /** Total number of pages in the document */
  totalPages: number;
  /** True during the hidden staging measurement pass */
  isMeasurementPass: boolean;
}

const DEFAULT_PAGE_INFO: PageInfoContextValue = {
  pageIndex: 0,
  pageNumber: 1,
  totalPages: 1,
  isMeasurementPass: false,
};

export const PageInfoContext = React.createContext<PageInfoContextValue>(DEFAULT_PAGE_INFO);

/**
 * Hook returning current page metadata (`pageIndex`, `pageNumber`, `totalPages`).
 */
export function usePageInfo(): PageInfoContextValue {
  return React.useContext(PageInfoContext);
}

export interface DocumentContextValue {
  document: PaginatedDocument | null;
  scale: number;
  print: () => void;
}

export const DocumentContext = React.createContext<DocumentContextValue>({
  document: null,
  scale: 1,
  print: () => {
    if (typeof window !== 'undefined') window.print();
  },
});

/**
 * Hook providing access to the current `PaginatedDocument` layout result, visual scale, and `print()` helper.
 */
export function useDocument(): DocumentContextValue {
  return React.useContext(DocumentContext);
}

export interface PageSliceContextValue {
  isMeasurementPass: boolean;
  sliceMap: Map<string, FragmentSlice> | null;
}

export const PageSliceContext = React.createContext<PageSliceContextValue>({
  isMeasurementPass: true,
  sliceMap: null,
});

export interface BlockPathContextValue {
  parentId: string;
  passId: number;
  childCounter: { nextIndex: number };
}

export const BlockPathContext = React.createContext<BlockPathContextValue | null>(null);

export interface LegacyRegisterResult {
  ref: React.RefCallback<Element> | null;
  'data-rp-node': string;
  'data-rp-id': string;
  'data-rp-display': string;
  'data-rp-kind'?: string;
  'data-rp-break-inside'?: string;
}

export interface LegacyRegisterContextValue {
  register: (display?: boolean) => LegacyRegisterResult;
}

export const LegacyRegisterContext = React.createContext<LegacyRegisterContextValue>({
  register: (display = true) => ({
    ref: null,
    'data-rp-node': '',
    'data-rp-id': '',
    'data-rp-display': display ? 'visible' : 'none',
  }),
});

/**
 * Backwards-compatible v3 hook (`useRegister()`).
 * In v4, `<Block>`, `<Section>`, and `<Text>` do not require manual `useRegister()` calls.
 */
export function useRegister(): LegacyRegisterContextValue {
  return React.useContext(LegacyRegisterContext);
}
