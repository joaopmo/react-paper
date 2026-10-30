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
} from './index';
import './styles/base.css';
import './styles/print.css';

interface TimelineEntry {
  id: string;
  role: string;
  organization: string;
  period: string;
  summary: string;
}

const SAMPLE_ENTRIES: TimelineEntry[] = [
  {
    id: '1',
    role: 'Principal Systems Architect',
    organization: 'Aether Cloud Labs',
    period: '2024 — Present',
    summary:
      'Designed a headless document layout and fragmentation engine supporting multi-column flows, orphan/widow control, and zero-reflow arithmetic pagination.',
  },
  {
    id: '2',
    role: 'Staff Frontend Engineer',
    organization: 'Vertex Design Systems',
    period: '2021 — 2024',
    summary:
      'Led architecture of declarative UI primitives used across 40+ product teams. Reduced bundle size by 45% and established automated browser geometry verification.',
  },
  {
    id: '3',
    role: 'Senior Software Engineer',
    organization: 'Chronicle Publishing',
    period: '2019 — 2021',
    summary:
      'Built browser-based print and PDF typesetting pipelines for long-form technical reports, academic journals, and dynamic multi-page templates.',
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
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#64748b',
            marginBottom: '8px',
          }}
        >
          Continued from previous page
        </div>
      )}
      {children}
    </div>
  );
}

function PrintToolbar() {
  const print = usePaperPrint();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
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

export default function App(): React.ReactElement {
  return (
    <div style={{ padding: '24px', background: '#f1f5f9', minHeight: '100vh' }}>
      <Document size="A4" orientation="portrait" padding="15mm" pageWidth={0.75}>
        <PrintToolbar />

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
            }}
          >
            <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>Alex Rivera</h1>
            <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '14px' }}>
              Systems &amp; Document Layout Engineering
            </p>
          </div>
        </Header>

        <Columns widths={['28%', '72%']} gap="24px">
          <Column gap="12px">
            <Block breakInside="avoid">
              <h3 style={{ margin: '0 0 8px', fontSize: '14px', textTransform: 'uppercase' }}>
                Core Domains
              </h3>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', lineHeight: 1.6 }}>
                <li>Document Pagination</li>
                <li>CSS Fragmentation</li>
                <li>TypeScript &amp; React</li>
                <li>Print / PDF Rendering</li>
              </ul>
            </Block>
          </Column>

          <Column gap="16px">
            <Section>
              <Block keepWithNext>
                <h2 style={{ margin: '0 0 12px', fontSize: '18px', color: '#0f172a' }}>
                  Experience
                </h2>
              </Block>

              <Section as={TimelineRail}>
                {SAMPLE_ENTRIES.map((entry) => (
                  <Block
                    key={entry.id}
                    breakInside="avoid"
                    style={{ marginBottom: '16px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                        {entry.role} — {entry.organization}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{entry.period}</span>
                    </div>
                    <Text
                      style={{
                        margin: '6px 0 0',
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        color: '#334155',
                      }}
                    >
                      {entry.summary}
                    </Text>
                  </Block>
                ))}
              </Section>
            </Section>
          </Column>
        </Columns>

        <Footer>
          {({ pageNumber, totalPages }) => (
            <div
              style={{
                paddingTop: '12px',
                fontSize: '11px',
                color: '#94a3b8',
                textAlign: 'right',
              }}
            >
              Page {pageNumber} of {totalPages}
            </div>
          )}
        </Footer>
      </Document>
    </div>
  );
}
