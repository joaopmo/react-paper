// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AcademicPaperExample } from '../../examples/AcademicPaperExample';

describe('AcademicPaperExample', () => {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
      const testH = this.getAttribute('data-test-height');
      const styleH = (this as HTMLElement).style?.height;
      let height = 0;
      if (testH != null) {
        height = Number.parseFloat(testH);
      } else if (styleH != null && styleH.endsWith('px')) {
        height = Number.parseFloat(styleH);
      } else {
        // Approximate height based on content length (e.g. ~120px for typical paragraph)
        const textLen = this.textContent?.length ?? 0;
        height = Math.max(45, Math.min(300, Math.round(textLen / 3.5)));
      }
      return {
        top: 0,
        bottom: height,
        left: 0,
        right: 350,
        width: 350,
        height,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;
    };
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('renders without throwing and mounts pages', () => {
    const { container } = render(<AcademicPaperExample showPrintToolbar={false} />);
    const pages = container.querySelectorAll('.rp-page');
    console.log('[AcademicPaperExample] Generated pages:', pages.length);
    expect(pages.length).toBeGreaterThanOrEqual(3);
  });
});
