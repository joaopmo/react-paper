export type PageSizePreset = 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal';

export type PageOrientation = 'portrait' | 'landscape';

export type CssLength = number | `${number}${'px' | 'mm' | 'cm' | 'in' | 'pt'}`;

export interface CustomPageSize {
  width: CssLength;
  height: CssLength;
}

export type PageSizeInput = PageSizePreset | CustomPageSize;

export interface BoxSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SpacingInput =
  | CssLength
  | [CssLength, CssLength]
  | [CssLength, CssLength, CssLength, CssLength]
  | Partial<Record<keyof BoxSpacing, CssLength>>;

export type ColumnWidthInput = CssLength | `${number}%` | `${number}fr`;

export type FragmentPosition = 'single' | 'start' | 'middle' | 'end';

export type BreakInsideMode = 'auto' | 'avoid';
export type BreakEdgeMode = 'auto' | 'page' | 'avoid';
export type BoxDecorationBreakMode = 'slice' | 'clone';

export interface BreakRules {
  breakInside?: BreakInsideMode;
  breakBefore?: 'auto' | 'page';
  breakAfter?: BreakEdgeMode;
  keepWithNext?: boolean;
  orphans?: number;
  widows?: number;
  boxDecorationBreak?: BoxDecorationBreakMode;
}

export interface NormalizedBreakRules {
  breakInside: BreakInsideMode;
  breakBefore: 'auto' | 'page';
  breakAfter: BreakEdgeMode;
  keepWithNext: boolean;
  orphans: number;
  widows: number;
  boxDecorationBreak: BoxDecorationBreakMode;
}

/**
 * Represents a single visual line box inside a text/inline block.
 * Coordinates (`top`, `bottom`, `height`) are relative to the node's content box top (in canonical CSS px).
 */
export interface LineBox {
  index: number;
  top: number;
  bottom: number;
  height: number;
  text?: string;
}

export type PreparedNodeKind = 'atomic' | 'container' | 'lines' | 'parallel';

/**
 * Serializable, DOM-free representation of a measured layout node ("prepare" phase output).
 * All numeric measurements are in canonical CSS pixels (96 DPI).
 */
export interface PreparedNode {
  id: string;
  kind: PreparedNodeKind;
  /** Total border-box height of the node in px */
  height: number;
  /** Top margin in px */
  marginTop: number;
  /** Bottom margin in px */
  marginBottom: number;
  /** Top border + top padding in px */
  chromeTop: number;
  /** Bottom border + bottom padding in px */
  chromeBottom: number;
  /** Vertical gap between children (e.g. CSS flex/grid row-gap) in px */
  rowGap: number;
  /** Whether the container uses flex/grid layout (disables sibling margin collapsing) */
  isFlexOrGrid?: boolean;
  /** Optional height reserved at the top of continuation fragments (e.g. repeating section header) */
  continuationHeaderHeight?: number;
  /** Measured line boxes when kind === 'lines' */
  lines?: LineBox[];
  /** Child nodes when kind === 'container' or kind === 'parallel' */
  children?: PreparedNode[];
  /** Pagination & fragmentation rules for this node */
  breakRules: NormalizedBreakRules;
}

/**
 * Complete measured document input for the pure pagination solver.
 */
export interface PreparedDocumentInput {
  columns: PreparedNode[][];
  columnRowGaps?: number[];
  columnIsFlexOrGrid?: boolean[];
}

/**
 * Resolved page geometry in canonical CSS pixels.
 */
export interface PageGeometry {
  /** Total page width in px */
  width: number;
  /** Total page height in px */
  height: number;
  /** Page inner padding/margins in px */
  padding: BoxSpacing;
  /** Computed width of each column in px */
  columnWidths: number[];
  /** Horizontal gap between columns in px */
  columnGap: number;
  /** Default vertical gap between root nodes in a column in px */
  rowGap: number;
  /** Height occupied by a first-page-only header (including its bottom gap/margin) in px */
  firstPageHeaderHeight: number;
  /** Height occupied by a continuation header on pages >= 2 in px */
  continuationHeaderHeight?: number;
  /** Height occupied by a repeating header on every page (including its bottom gap/margin) in px */
  runningHeaderHeight: number;
  /** Height occupied by a footer on every page (including its top gap/margin) in px */
  footerHeight: number;
}

export interface LineRangeSlice {
  startLine: number;
  endLine: number;
  /** Pixel offset from the start of the node's content box to `startLine` */
  offsetTop: number;
  /** Exact pixel height of the lines [startLine..endLine] */
  clipHeight: number;
}

/**
 * Lightweight descriptor of a node (or slice of a node) allocated to a specific page and column.
 */
export interface FragmentSlice {
  nodeId: string;
  kind: PreparedNodeKind;
  fragmentPosition: FragmentPosition;
  /** 0-based index of this fragment among all fragments for `nodeId` */
  fragmentIndex: number;
  /** Total number of fragments `nodeId` was split into across the document */
  fragmentCount: number;
  /** Total vertical space consumed by this slice on the page (including effective margins & chrome) */
  allocatedHeight: number;
  /** Effective top margin applied on this page */
  marginTop: number;
  /** Effective bottom margin applied on this page */
  marginBottom: number;
  /** Effective top border+padding applied on this page */
  chromeTop: number;
  /** Effective bottom border+padding applied on this page */
  chromeBottom: number;
  /** Present when kind === 'lines' and the block is sliced by line ranges */
  lineRange?: LineRangeSlice;
  /** Present when kind === 'container' or 'parallel': only the child slices placed on this page */
  children?: FragmentSlice[];
}

export interface PaginatedColumn {
  columnIndex: number;
  width: number;
  usedHeight: number;
  freeHeight: number;
  slices: FragmentSlice[];
}

export interface PaginatedPage {
  /** 0-based page index */
  pageIndex: number;
  /** 1-based page number */
  pageNumber: number;
  width: number;
  height: number;
  contentHeight: number;
  hasFirstPageHeader: boolean;
  hasRunningHeader: boolean;
  hasFooter: boolean;
  columns: PaginatedColumn[];
}

export interface PaginatedDocument {
  pages: PaginatedPage[];
  totalPages: number;
  geometry: PageGeometry;
}
