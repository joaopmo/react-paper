import React from 'react';
import { DoubleColumnLegacy } from './DoubleColumnLegacy';
import { HeaderLegacy } from './HeaderLegacy';
import { MemoizationLegacy } from './MemoizationLegacy';
import { ResumeExample } from './ResumeExample';
import { SingleColumnLegacy } from './SingleColumnLegacy';
import { TimelineExample } from './TimelineExample';

export interface ExampleDefinition {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
}

export const EXAMPLES: Record<string, ExampleDefinition> = {
  resume: {
    id: 'resume',
    title: 'Multi-Page Resume (v4)',
    description: 'Two-page resume with sidebar underlay, continuation banners, and timeline rail.',
    component: ResumeExample,
    defaultProps: { pageWidth: 0.75, showPrintToolbar: true },
  },
  timeline: {
    id: 'timeline',
    title: 'Project Timeline (v4)',
    description: 'Multi-page timeline with keepWithNext headings and continuation header.',
    component: TimelineExample,
    defaultProps: { pageWidth: 0.7, entryCount: 12 },
  },
  'double-column': {
    id: 'double-column',
    title: 'Double Column Layout (v3 API)',
    description: 'Two-column text and image layout paginating across pages.',
    component: DoubleColumnLegacy,
    defaultProps: { pageWidth: 0.5 },
  },
  'single-column': {
    id: 'single-column',
    title: 'Single Column Layout (v3 API)',
    description: 'Single column with text and image block.',
    component: SingleColumnLegacy,
    defaultProps: { pageWidth: 0.5 },
  },
  header: {
    id: 'header',
    title: 'With Header (v3 API)',
    description: 'Document with top header component and multi-column flow.',
    component: HeaderLegacy,
    defaultProps: { pageWidth: 0.5 },
  },
  memoization: {
    id: 'memoization',
    title: 'Memoization & React State',
    description: 'Demonstrates reactivity and memoization with incrementing state.',
    component: MemoizationLegacy,
    defaultProps: { pageWidth: 0.5, memoize: true },
  },
};

export const DEFAULT_EXAMPLE_ID = 'resume';
