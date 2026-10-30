import { describe, expect, it } from 'vitest';
import {
  PX_PER_CM,
  PX_PER_INCH,
  PX_PER_MM,
  PX_PER_PT,
  createPageGeometry,
  normalizeBreakRules,
  resolveBoxSpacing,
  resolveColumnWidths,
  resolvePageSize,
  toPx,
} from '../units';

describe('core/units', () => {
  describe('toPx', () => {
    it('converts numbers and standard CSS length units to canonical 96 DPI pixels', () => {
      expect(toPx(120)).toBe(120);
      expect(toPx('120px')).toBe(120);
      expect(toPx('1in')).toBeCloseTo(PX_PER_INCH, 5);
      expect(toPx('210mm')).toBeCloseTo(210 * PX_PER_MM, 5);
      expect(toPx('2.54cm')).toBeCloseTo(2.54 * PX_PER_CM, 5);
      expect(toPx('72pt')).toBeCloseTo(72 * PX_PER_PT, 5);
      expect(toPx('0')).toBe(0);
      expect(toPx(undefined, 16)).toBe(16);
    });

    it('throws on unsupported units or non-finite values', () => {
      expect(() => toPx('10rem' as any)).toThrow(/Unsupported CSS length/);
      expect(() => toPx(Number.NaN)).toThrow(/Expected finite length/);
    });
  });

  describe('resolvePageSize', () => {
    it('resolves A4 portrait and landscape dimensions', () => {
      const portrait = resolvePageSize('A4', 'portrait');
      expect(portrait.width).toBeCloseTo(210 * PX_PER_MM, 4);
      expect(portrait.height).toBeCloseTo(297 * PX_PER_MM, 4);
      expect(portrait.cssWidth).toBe('210mm');
      expect(portrait.cssHeight).toBe('297mm');

      const landscape = resolvePageSize('A4', 'landscape');
      expect(landscape.width).toBeCloseTo(297 * PX_PER_MM, 4);
      expect(landscape.height).toBeCloseTo(210 * PX_PER_MM, 4);
      expect(landscape.cssWidth).toBe('297mm');
      expect(landscape.cssHeight).toBe('210mm');
    });

    it('resolves Letter and custom page dimensions', () => {
      const letter = resolvePageSize('Letter');
      expect(letter.width).toBeCloseTo(8.5 * PX_PER_INCH, 4);
      expect(letter.height).toBeCloseTo(11 * PX_PER_INCH, 4);

      const custom = resolvePageSize({ width: 500, height: '800px' });
      expect(custom.width).toBe(500);
      expect(custom.height).toBe(800);
    });
  });

  describe('resolveBoxSpacing', () => {
    it('handles single values, 2-tuples, 4-tuples, and partial objects', () => {
      expect(resolveBoxSpacing(10)).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
      expect(resolveBoxSpacing([10, 20])).toEqual({ top: 10, right: 20, bottom: 10, left: 20 });
      expect(resolveBoxSpacing([5, 10, 15, 20])).toEqual({
        top: 5,
        right: 10,
        bottom: 15,
        left: 20,
      });
      expect(resolveBoxSpacing({ top: 12, left: '24px' })).toEqual({
        top: 12,
        right: 0,
        bottom: 0,
        left: 24,
      });
    });
  });

  describe('resolveColumnWidths', () => {
    it('divides width equally when no custom widths are provided', () => {
      expect(resolveColumnWidths(620, 2, undefined, 20)).toEqual([300, 300]);
    });

    it('resolves percentage, fr, and fixed pixel widths', () => {
      expect(resolveColumnWidths(1000, 2, ['30%', '70%'], 0)).toEqual([300, 700]);
      expect(resolveColumnWidths(900, 3, ['200px', '1fr', '2fr'], 50)).toEqual([200, 200, 400]);
    });
  });

  describe('normalizeBreakRules & createPageGeometry', () => {
    it('normalizes breakAfter="avoid" and keepWithNext symmetrically', () => {
      const r1 = normalizeBreakRules({ keepWithNext: true });
      expect(r1.keepWithNext).toBe(true);
      expect(r1.breakAfter).toBe('avoid');

      const r2 = normalizeBreakRules({ breakAfter: 'avoid' });
      expect(r2.keepWithNext).toBe(true);
      expect(r2.breakAfter).toBe('avoid');
    });

    it('creates complete PageGeometry from options', () => {
      const geo = createPageGeometry({
        size: { width: 800, height: 1000 },
        padding: 50,
        columnCount: 2,
        columnGap: 20,
        firstPageHeaderHeight: 100,
      });
      expect(geo.width).toBe(800);
      expect(geo.height).toBe(1000);
      expect(geo.columnWidths).toEqual([340, 340]);
      expect(geo.firstPageHeaderHeight).toBe(100);
    });
  });
});
