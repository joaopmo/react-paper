import {
  type BoxSpacing,
  type BreakRules,
  type ColumnWidthInput,
  type CssLength,
  type NormalizedBreakRules,
  type PageGeometry,
  type PageOrientation,
  type PageSizeInput,
  type PageSizePreset,
  type SpacingInput,
} from './types';

export const PX_PER_INCH = 96;
export const MM_PER_INCH = 25.4;
export const PX_PER_MM = PX_PER_INCH / MM_PER_INCH;
export const PX_PER_CM = PX_PER_INCH / 2.54;
export const PX_PER_PT = PX_PER_INCH / 72;

const PRESET_DIMENSIONS: Record<
  PageSizePreset,
  { widthPx: number; heightPx: number; cssWidth: string; cssHeight: string }
> = {
  A3: {
    widthPx: 297 * PX_PER_MM,
    heightPx: 420 * PX_PER_MM,
    cssWidth: '297mm',
    cssHeight: '420mm',
  },
  A4: {
    widthPx: 210 * PX_PER_MM,
    heightPx: 297 * PX_PER_MM,
    cssWidth: '210mm',
    cssHeight: '297mm',
  },
  A5: {
    widthPx: 148 * PX_PER_MM,
    heightPx: 210 * PX_PER_MM,
    cssWidth: '148mm',
    cssHeight: '210mm',
  },
  Letter: {
    widthPx: 8.5 * PX_PER_INCH,
    heightPx: 11 * PX_PER_INCH,
    cssWidth: '8.5in',
    cssHeight: '11in',
  },
  Legal: {
    widthPx: 8.5 * PX_PER_INCH,
    heightPx: 14 * PX_PER_INCH,
    cssWidth: '8.5in',
    cssHeight: '14in',
  },
};

/**
 * Converts a CSS length (`number` or `'10mm' | '1in' | '2cm' | '12pt' | '100px'`) into canonical CSS pixels (96 DPI).
 */
export function toPx(value: CssLength | string | undefined, fallback = 0): number {
  if (value == null) return fallback;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new RangeError(`Expected finite length in pixels, received ${String(value)}`);
    }
    return value;
  }

  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '0') return 0;

  const match = /^([+-]?(?:\d+\.?\d*|\.\d+))(px|mm|cm|in|pt)?$/i.exec(trimmed);
  if (match == null) {
    throw new RangeError(`Unsupported CSS length "${value}". Expected px, mm, cm, in, or pt.`);
  }

  const amount = Number.parseFloat(match[1]);
  const unit = (match[2] ?? 'px').toLowerCase();

  switch (unit) {
    case 'px':
      return amount;
    case 'mm':
      return amount * PX_PER_MM;
    case 'cm':
      return amount * PX_PER_CM;
    case 'in':
      return amount * PX_PER_INCH;
    case 'pt':
      return amount * PX_PER_PT;
    default:
      throw new RangeError(`Unsupported unit "${unit}" in "${value}".`);
  }
}

export function formatCssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export interface ResolvedPageDimensions {
  width: number;
  height: number;
  cssWidth: string;
  cssHeight: string;
}

export function resolvePageSize(
  size: PageSizeInput = 'A4',
  orientation: PageOrientation = 'portrait',
): ResolvedPageDimensions {
  let width: number;
  let height: number;
  let cssWidth: string;
  let cssHeight: string;

  if (typeof size === 'string') {
    const preset = PRESET_DIMENSIONS[size];
    if (preset == null) {
      throw new RangeError(`Unknown page size preset "${String(size)}".`);
    }
    width = preset.widthPx;
    height = preset.heightPx;
    cssWidth = preset.cssWidth;
    cssHeight = preset.cssHeight;
  } else {
    width = toPx(size.width);
    height = toPx(size.height);
    cssWidth = formatCssLength(size.width);
    cssHeight = formatCssLength(size.height);
  }

  if (orientation === 'landscape') {
    return {
      width: height,
      height: width,
      cssWidth: cssHeight,
      cssHeight: cssWidth,
    };
  }

  return { width, height, cssWidth, cssHeight };
}

export function resolveBoxSpacing(spacing?: SpacingInput): BoxSpacing {
  if (spacing == null) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  if (typeof spacing === 'number' || typeof spacing === 'string') {
    const val = toPx(spacing);
    return { top: val, right: val, bottom: val, left: val };
  }

  if (Array.isArray(spacing)) {
    if (spacing.length === 2) {
      const vertical = toPx(spacing[0]);
      const horizontal = toPx(spacing[1]);
      return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
    }
    if (spacing.length === 4) {
      return {
        top: toPx(spacing[0]),
        right: toPx(spacing[1]),
        bottom: toPx(spacing[2]),
        left: toPx(spacing[3]),
      };
    }
    throw new RangeError('Spacing tuple must have 2 ([v, h]) or 4 ([top, right, bottom, left]) values.');
  }

  return {
    top: toPx(spacing.top, 0),
    right: toPx(spacing.right, 0),
    bottom: toPx(spacing.bottom, 0),
    left: toPx(spacing.left, 0),
  };
}

/**
 * Resolves column widths in pixels given the inner page content width, number of columns,
 * optional width specifications (`'30%'`, `'1fr'`, `'200px'`, `'50mm'`), and column gap.
 */
export function resolveColumnWidths(
  innerPageWidth: number,
  columnCount: number,
  widths?: ColumnWidthInput[],
  columnGap = 0,
): number[] {
  if (columnCount <= 0) return [];
  const totalGaps = Math.max(0, columnCount - 1) * columnGap;
  const availableWidth = Math.max(0, innerPageWidth - totalGaps);

  if (widths == null || widths.length === 0) {
    const equalWidth = availableWidth / columnCount;
    return Array.from({ length: columnCount }, () => equalWidth);
  }

  const fixedPx: Array<number | null> = new Array(columnCount).fill(null);
  const frWeights: number[] = new Array(columnCount).fill(0);
  let usedFixedPx = 0;
  let totalFr = 0;

  for (let i = 0; i < columnCount; i++) {
    const spec = widths[i];
    if (spec == null) {
      frWeights[i] = 1;
      totalFr += 1;
      continue;
    }

    if (typeof spec === 'number') {
      fixedPx[i] = spec;
      usedFixedPx += spec;
      continue;
    }

    const trimmed = spec.trim();
    if (trimmed.endsWith('%')) {
      const pct = Number.parseFloat(trimmed.slice(0, -1));
      const px = (pct / 100) * availableWidth;
      fixedPx[i] = px;
      usedFixedPx += px;
    } else if (trimmed.toLowerCase().endsWith('fr')) {
      const fr = Number.parseFloat(trimmed.slice(0, -2));
      const weight = Number.isFinite(fr) && fr > 0 ? fr : 1;
      frWeights[i] = weight;
      totalFr += weight;
    } else {
      const px = toPx(trimmed as CssLength);
      fixedPx[i] = px;
      usedFixedPx += px;
    }
  }

  const remainingWidth = Math.max(0, availableWidth - usedFixedPx);
  const result: number[] = new Array(columnCount);

  for (let i = 0; i < columnCount; i++) {
    if (fixedPx[i] != null) {
      result[i] = fixedPx[i]!;
    } else {
      result[i] = totalFr > 0 ? (frWeights[i] / totalFr) * remainingWidth : 0;
    }
  }

  return result;
}

export function normalizeBreakRules(rules?: BreakRules): NormalizedBreakRules {
  const breakAfter = rules?.breakAfter ?? (rules?.keepWithNext === true ? 'avoid' : 'auto');
  const keepWithNext = rules?.keepWithNext ?? breakAfter === 'avoid';
  return {
    breakInside: rules?.breakInside ?? 'auto',
    breakBefore: rules?.breakBefore ?? 'auto',
    breakAfter,
    keepWithNext,
    orphans: Math.max(1, Math.floor(rules?.orphans ?? 2)),
    widows: Math.max(1, Math.floor(rules?.widows ?? 2)),
    boxDecorationBreak: rules?.boxDecorationBreak ?? 'slice',
  };
}

export interface CreatePageGeometryOptions {
  size?: PageSizeInput;
  orientation?: PageOrientation;
  padding?: SpacingInput;
  columnCount?: number;
  columnWidths?: ColumnWidthInput[];
  columnGap?: CssLength;
  rowGap?: CssLength;
  firstPageHeaderHeight?: number;
  continuationHeaderHeight?: number;
  runningHeaderHeight?: number;
  footerHeight?: number;
}

export function createPageGeometry(options: CreatePageGeometryOptions = {}): PageGeometry {
  const { width, height } = resolvePageSize(options.size ?? 'A4', options.orientation ?? 'portrait');
  const padding = resolveBoxSpacing(options.padding);
  const columnGap = toPx(options.columnGap, 0);
  const rowGap = toPx(options.rowGap, 0);
  const columnCount = options.columnCount ?? options.columnWidths?.length ?? 1;
  const innerWidth = Math.max(0, width - padding.left - padding.right);
  const columnWidths = resolveColumnWidths(innerWidth, columnCount, options.columnWidths, columnGap);

  return {
    width,
    height,
    padding,
    columnWidths,
    columnGap,
    rowGap,
    firstPageHeaderHeight: options.firstPageHeaderHeight ?? 0,
    continuationHeaderHeight: options.continuationHeaderHeight ?? 0,
    runningHeaderHeight: options.runningHeaderHeight ?? 0,
    footerHeight: options.footerHeight ?? 0,
  };
}
