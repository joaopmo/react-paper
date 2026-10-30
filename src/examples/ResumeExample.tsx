import React from 'react';
import {
  Block,
  Column,
  Columns,
  Document,
  Footer,
  Header,
  PageUnderlay,
  Section,
  Text,
  useFragment,
  usePaperPrint,
} from '../index';

interface TimelineEntry {
  id: string;
  role: string;
  organization: string;
  period: string;
  summary: string;
  highlights: string[];
}

const EXPERIENCE_ENTRIES: TimelineEntry[] = [
  {
    id: '1',
    role: 'Principal Systems Architect',
    organization: 'Aether Cloud Labs',
    period: '2024 — Present',
    summary:
      'Architected a headless document layout and fragmentation engine supporting multi-column flows, orphan and widow control, and zero-reflow arithmetic pagination across 100+ page documents.',
    highlights: [
      'Separated DOM measurement (Phase 1) from pure arithmetic page allocation (Phase 2), cutting pagination latency to under 5ms.',
      'Implemented CSS Fragmentation Level 3 semantics (breakInside, keepWithNext, boxDecorationBreak) with targeted per-page React mounting.',
    ],
  },
  {
    id: '2',
    role: 'Staff Frontend Engineer',
    organization: 'Vertex Design Systems',
    period: '2022 — 2024',
    summary:
      'Led architecture of declarative layout primitives used across 40+ product teams. Reduced bundle size by 45% and established automated browser geometry verification.',
    highlights: [
      'Designed sub-pixel line measurement pipelines using native Range.getClientRects() with automatic inter-line leading protection.',
      'Built cross-browser print stylesheets (@page) and responsive viewport preview scaling.',
    ],
  },
  {
    id: '3',
    role: 'Senior Software Engineer',
    organization: 'Chronicle Publishing',
    period: '2020 — 2022',
    summary:
      'Built browser-based print and PDF typesetting pipelines for long-form technical reports, academic journals, and dynamic multi-page templates.',
    highlights: [
      'Created multi-column synchronization primitives for side-by-side bilingual and legal documents.',
      'Added repeating section continuation headers and fragment-aware timeline borders.',
    ],
  },
  {
    id: '4',
    role: 'Lead UI Engineer',
    organization: 'Horizon Analytics',
    period: '2018 — 2020',
    summary:
      'Spearheaded the reporting and export platform enabling customers to generate print-ready executive briefings directly from live dashboard views.',
    highlights: [
      'Eliminated orphan headings and clipped text descenders across multi-page executive PDF exports.',
      'Introduced virtualized page previewing for 50+ page data-heavy reports.',
    ],
  },
  {
    id: '5',
    role: 'Software Engineer',
    organization: 'Nova Folio Studio',
    period: '2016 — 2018',
    summary:
      'Developed customizable document templates, typography scales, and real-time WYSIWYG page preview components for structured curriculum vitae and portfolio builders.',
    highlights: [
      'Supported standard ISO (A3, A4, A5) and North American (Letter, Legal) paper geometries in portrait and landscape orientations.',
      'Implemented full-bleed page underlays and watermarks independent of content column flow.',
    ],
  },
];

interface ProjectItem {
  id: string;
  name: string;
  tag: string;
  description: string;
}

const ARCHITECTURE_PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    name: 'Two-Phase Pagination Engine',
    tag: 'Core Solver',
    description:
      'Decouples single-pass DOM geometry collection from pure TypeScript arithmetic pagination, enabling deterministic unit tests without a browser.',
  },
  {
    id: 'p2',
    name: 'Fragment Context & Continuation Headers',
    tag: 'React Primitives',
    description:
      'Exposes useFragment() and continuationHeader so split containers can render top/bottom caps and "Continued from previous page" banners.',
  },
  {
    id: 'p3',
    name: 'Line-Box Range Slicing',
    tag: 'Typography',
    description:
      'Measures wrapped text lines via Range.getClientRects() and splits at the exact midpoint of inter-line leading to prevent clipped ascenders or descenders.',
  },
];

function TimelineRail({ children }: { children: React.ReactNode }) {
  const { isContinuation, position } = useFragment();
  return (
    <div
      style={{
        borderLeft: '2px solid #2563eb',
        paddingLeft: '16px',
        position: 'relative',
      }}
      data-fragment-state={position}
    >
      {isContinuation && (
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#2563eb',
            marginBottom: '10px',
          }}
        >
          ↳ Experience (Continued from previous page)
        </div>
      )}
      {children}
    </div>
  );
}

function PrintToolbar() {
  const print = usePaperPrint();
  return (
    <div className="rp-no-print" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
      <button
        type="button"
        onClick={print}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          background: '#0f172a',
          color: '#ffffff',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Print / Save PDF
      </button>
    </div>
  );
}

export interface ResumeExampleProps {
  pageWidth?: number;
  showPrintToolbar?: boolean;
}

export function ResumeExample({ pageWidth = 0.75, showPrintToolbar = false }: ResumeExampleProps) {
  return (
    <Document size="A4" orientation="portrait" padding="15mm" pageWidth={pageWidth}>
      {showPrintToolbar && <PrintToolbar />}

      <PageUnderlay>
        <div
          style={{
            width: '30%',
            height: '100%',
            background: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
          }}
        />
      </PageUnderlay>

      <Header mode="first">
        <div
          style={{
            paddingBottom: '16px',
            marginBottom: '20px',
            borderBottom: '2px solid #0f172a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>Alex Rivera</h1>
            <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '14px' }}>
              Principal Systems &amp; Document Layout Architect
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
            <div>alex.rivera@example.dev</div>
            <div>github.com/joaopmo/react-paper</div>
          </div>
        </div>
      </Header>

      <Columns widths={['28%', '72%']} gap="24px">
        <Column gap="18px">
          <Block breakInside="avoid">
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#0f172a',
              }}
            >
              Core Domains
            </h3>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', lineHeight: 1.65, color: '#334155' }}>
              <li>Document Pagination</li>
              <li>CSS Fragmentation L3</li>
              <li>TypeScript &amp; React 18/19</li>
              <li>Print &amp; PDF Typesetting</li>
              <li>Sub-pixel DOM Geometry</li>
            </ul>
          </Block>

          <Block breakInside="avoid">
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#0f172a',
              }}
            >
              Education
            </h3>
            <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
              <strong style={{ color: '#0f172a' }}>M.S. Computer Science</strong>
              <div>Distributed &amp; Graphics Systems</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>2014 — 2016</div>
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#334155', marginTop: '10px' }}>
              <strong style={{ color: '#0f172a' }}>B.S. Software Engineering</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>2010 — 2014</div>
            </div>
          </Block>

          <Block breakInside="avoid">
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#0f172a',
              }}
            >
              Layout Capabilities
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.55, color: '#475569' }}>
              This sidebar background is rendered via <code>&lt;PageUnderlay&gt;</code>, repeating
              automatically on every generated page even when the sidebar column finishes on Page 1.
            </p>
          </Block>
        </Column>

        <Column gap="20px">
          <Section>
            <Block keepWithNext>
              <h2
                style={{
                  margin: '0 0 12px',
                  fontSize: '17px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0f172a',
                }}
              >
                Experience
              </h2>
            </Block>

            <Section as={TimelineRail}>
              {EXPERIENCE_ENTRIES.map((entry) => (
                <Block
                  key={entry.id}
                  breakInside="avoid"
                  style={{
                    marginBottom: '16px',
                    padding: '12px 14px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
                      {entry.role} — {entry.organization}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                      {entry.period}
                    </span>
                  </div>
                  <Text
                    style={{
                      margin: '6px 0 8px',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#334155',
                    }}
                  >
                    {entry.summary}
                  </Text>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '18px',
                      fontSize: '12.5px',
                      lineHeight: 1.5,
                      color: '#475569',
                    }}
                  >
                    {entry.highlights.map((bullet, idx) => (
                      <li key={idx} style={{ marginBottom: '3px' }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </Block>
              ))}
            </Section>
          </Section>

          <Section>
            <Block keepWithNext>
              <h2
                style={{
                  margin: '0 0 12px',
                  fontSize: '17px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#0f172a',
                }}
              >
                Architecture Highlights
              </h2>
            </Block>

            {ARCHITECTURE_PROJECTS.map((proj) => (
              <Block
                key={proj.id}
                breakInside="avoid"
                style={{
                  marginBottom: '12px',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{proj.name}</strong>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontWeight: 600,
                    }}
                  >
                    {proj.tag}
                  </span>
                </div>
                <Text style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
                  {proj.description}
                </Text>
              </Block>
            ))}
          </Section>
        </Column>
      </Columns>

      <Footer>
        {({ pageNumber, totalPages }) => (
          <div
            style={{
              paddingTop: '12px',
              fontSize: '11px',
              color: '#64748b',
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <span>@joaopmo/react-paper — Multi-Page Document Demo</span>
            <span>
              Page {pageNumber} of {totalPages}
            </span>
          </div>
        )}
      </Footer>
    </Document>
  );
}
