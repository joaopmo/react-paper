// @vitest-environment jsdom
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ExecutiveReportExample } from '../../examples/ExecutiveReportExample';

describe('ExecutiveReportExample component verification', () => {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    // Provide realistic measured heights in jsdom simulation
    Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
      const explicitH = this.getAttribute('data-test-height');
      if (explicitH != null) {
        const height = Number.parseFloat(explicitH);
        return {
          top: 0,
          bottom: height,
          left: 0,
          right: 600,
          width: 600,
          height,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }

      // Check if this is the continuation header
      if (this.hasAttribute('data-rp-continuation-header')) {
        return {
          top: 0,
          bottom: 35,
          left: 0,
          right: 500,
          width: 500,
          height: 35,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        } as DOMRect;
      }

      // Default height heuristic based on text content and tag
      const text = this.textContent || '';
      let height = 28;
      if (this.tagName === 'H1' || this.tagName === 'H2') {
        height = 36;
      } else if (this.tagName === 'H3') {
        height = 24;
      } else if (text.length > 200) {
        height = 80;
      } else if (text.length > 100) {
        height = 50;
      }

      return {
        top: 0,
        bottom: height,
        left: 0,
        right: 500,
        width: 500,
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

  it('renders ExecutiveReportExample with multi-page pagination and all required features', async () => {
    const { container } = render(
      <ExecutiveReportExample showPrintToolbar={false} pageWidth={1} />,
    );

    // Wait for pagination pass to complete and render pages
    await waitFor(() => {
      const pages = container.querySelectorAll('.rp-page');
      expect(pages.length).toBeGreaterThanOrEqual(2);
    });

    const pages = container.querySelectorAll('.rp-page');
    expect(pages.length).toBeGreaterThanOrEqual(2);

    // 1. Running headers with document title & date on all pages
    pages.forEach((page) => {
      const header = page.querySelector('.rp-header-running');
      expect(header).not.toBeNull();
      expect(header?.textContent).toContain('APEX GLOBAL TECHNOLOGIES');
      expect(header?.textContent).toContain('October 31, 2026');
    });

    // 2. Footers with confidentiality disclaimer and Page X of Y
    pages.forEach((page, idx) => {
      const footer = page.querySelector('.rp-footer');
      expect(footer).not.toBeNull();
      expect(footer?.textContent).toContain('CONFIDENTIAL');
      expect(footer?.textContent).toContain(`Page ${idx + 1} of ${pages.length}`);
    });

    // 3. Decorative PageUnderlay (watermark, sidebar tint, top accent)
    pages.forEach((page) => {
      const underlay = page.querySelector('.rp-page-underlay');
      expect(underlay).not.toBeNull();
      expect(underlay?.textContent).toContain('APEX GLOBAL');
    });

    // 4. Executive Summary callout box
    const execSummary = container.querySelector('[data-rp-id*="0.0"], [data-rp-id*="1.0"]');
    expect(execSummary).not.toBeNull();
    expect(container.textContent).toContain('Executive Summary & Leadership Commentary');
    expect(container.textContent).toContain('surpassing consensus expectations');

    // 5. Key performance indicators (KPIs) in multi-column layout
    expect(container.textContent).toContain('Key Performance Indicators');
    expect(container.textContent).toContain('Annual Recurring Revenue (ARR)');
    expect(container.textContent).toContain('$428.5M');
    expect(container.textContent).toContain('GAAP Operating Margin');
    expect(container.textContent).toContain('26.2%');

    // 6. Multi-row financial table with rows having breakInside="avoid"
    const avoidBlocks = container.querySelectorAll('[data-rp-break-inside="avoid"]');
    expect(avoidBlocks.length).toBeGreaterThan(15);
    expect(container.textContent).toContain('Consolidated Statement of Operations');
    expect(container.textContent).toContain('Subscription & SaaS Revenue');
    expect(container.textContent).toContain('Gross Profit');
    expect(container.textContent).toContain('GAAP Net Income');

    // 7. Sections with keepWithNext on headings
    const keepWithNextHeadings = container.querySelectorAll('[data-rp-keep-with-next="true"]');
    expect(keepWithNextHeadings.length).toBeGreaterThanOrEqual(3);

    // 8. Continuation Header on the financial table when crossing page boundary
    const contHeaders = container.querySelectorAll('.rp-continuation-header');
    if (contHeaders.length > 0) {
      expect(contHeaders[0].textContent).toContain('Consolidated Statement of Operations');
    }
  });
});
