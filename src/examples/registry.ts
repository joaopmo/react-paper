import React from 'react';
import { AcademicPaperExample } from './AcademicPaperExample';
import { CreativePortfolioExample } from './CreativePortfolioExample';
import { ExecutiveReportExample } from './ExecutiveReportExample';
import { ResumeExample } from './ResumeExample';
import { TimelineExample } from './TimelineExample';

export interface ExampleDefinition {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
}

export const EXAMPLES: Record<string, ExampleDefinition> = {
  portfolio: {
    id: 'portfolio',
    title: 'Creative Portfolio',
    description: 'Multi-page designer & developer portfolio with full-bleed sidebar underlay, project continuation timeline rail, case study cards, and running footer.',
    component: CreativePortfolioExample,
    defaultProps: { pageWidth: 0.8, showPrintToolbar: true },
  },
  'executive-report': {
    id: 'executive-report',
    title: 'Executive & Financial Report',
    description: 'Corporate executive report with KPI sidebar, multi-page financial table, continuation headers, and underlay watermark.',
    component: ExecutiveReportExample,
    defaultProps: { pageWidth: 0.82, showPrintToolbar: true },
  },
  academic: {
    id: 'academic',
    title: 'Academic Research Paper',
    description: 'Two-column IEEE/ACM conference format with abstract, theorem box, algorithm, SVG figures, and continuation headers.',
    component: AcademicPaperExample,
    defaultProps: { pageWidth: 0.78, showPrintToolbar: true },
  },
  resume: {
    id: 'resume',
    title: 'Multi-Page Resume',
    description: 'Two-page resume with sidebar underlay, continuation banners, and timeline rail.',
    component: ResumeExample,
    defaultProps: { pageWidth: 0.75, showPrintToolbar: true },
  },
  timeline: {
    id: 'timeline',
    title: 'Project Timeline',
    description: 'Multi-page timeline with keepWithNext headings and continuation header.',
    component: TimelineExample,
    defaultProps: { pageWidth: 0.7, entryCount: 12 },
  },
};

export const DEFAULT_EXAMPLE_ID = 'resume';
