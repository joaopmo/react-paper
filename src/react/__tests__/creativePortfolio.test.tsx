// @vitest-environment jsdom
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CreativePortfolioExample } from '../../examples/CreativePortfolioExample';

describe('CreativePortfolioExample integration & layout test', () => {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    // Mock realistic DOM heights in jsdom
    Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
      const testH = this.getAttribute('data-test-height');
      const styleH = (this as HTMLElement).style?.height;
      let height = 0;

      if (testH != null) {
        height = Number.parseFloat(testH);
      } else if (styleH != null && styleH.endsWith('px')) {
        height = Number.parseFloat(styleH);
      } else if (this.classList.contains('rp-header-first')) {
        height = 140;
      } else if (this.classList.contains('rp-footer')) {
        height = 36;
      } else if (this.hasAttribute('data-rp-continuation-header')) {
        height = 24;
      } else if (this.classList.contains('rp-continuation-header')) {
        height = 24;
      } else if (this.tagName === 'H1' || this.tagName === 'H2' || this.tagName === 'H3') {
        height = 28;
      } else if (this.hasAttribute('data-rp-node')) {
        // Approximate card / block heights based on content length
        const textLen = this.textContent?.length || 0;
        height = Math.max(45, Math.min(380, Math.round(textLen * 0.45)));
      } else {
        height = 20;
      }

      return {
        top: 0,
        bottom: height,
        left: 0,
        right: 400,
        width: 400,
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

  it('renders a multi-page creative portfolio spanning at least 2-3 pages with underlay, headers, and timeline continuation', async () => {
    const { container } = render(<CreativePortfolioExample pageWidth={1} />);

    await waitFor(() => {
      const pages = container.querySelectorAll('.rp-page');
      expect(pages.length).toBeGreaterThanOrEqual(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    expect(pages.length).toBeGreaterThanOrEqual(2);

    // 1. Underlay persists on EVERY page
    for (let i = 0; i < pages.length; i++) {
      const underlay = pages[i].querySelector('.rp-page-underlay');
      expect(underlay).not.toBeNull();
    }

    // 2. First-page header banner only on page 0
    expect(pages[0].querySelector('.rp-header-first')).not.toBeNull();
    expect(pages[0].textContent).toContain('Sora Takahashi');
    if (pages.length > 1) {
      expect(pages[1].querySelector('.rp-header-first')).toBeNull();
    }

    // 3. Footer on all pages with page numbers
    for (let i = 0; i < pages.length; i++) {
      const footer = pages[i].querySelector('.rp-footer');
      expect(footer).not.toBeNull();
      expect(footer?.textContent).toContain(`Page ${i + 1} of ${pages.length}`);
    }

    // 4. Main content contains case studies
    expect(container.textContent).toContain('ChromaFlow — Universal Multi-Brand Design System');
    expect(container.textContent).toContain('Strata — Headless Arithmetic Document Pagination Engine');
    expect(container.textContent).toContain('Aura 3D — WebGL Generative Product Visualizer');

    // 5. Check for Timeline rail and continuation presence
    const timelineRails = container.querySelectorAll('.project-timeline-rail');
    expect(timelineRails.length).toBeGreaterThanOrEqual(1);

    // 6. Check for Core Competencies and Certifications in sidebar
    expect(container.textContent).toContain('Core Competencies');
    expect(container.textContent).toContain('Certifications & Accreditations');
  });
});
