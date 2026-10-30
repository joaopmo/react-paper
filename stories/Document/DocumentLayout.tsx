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
} from '@joaopmo/react-paper';

interface DocumentLayoutProps {
  pageWidth?: number;
  entryCount?: number;
}

function SplitTimelineBox({ children }: { children?: React.ReactNode }) {
  const { position, isContinuation } = useFragment();
  return (
    <div
      style={{
        borderLeft: '3px solid #3b82f6',
        paddingLeft: '16px',
        marginTop: isContinuation ? 0 : '8px',
      }}
      data-fragment={position}
    >
      {children}
    </div>
  );
}

export function DocumentLayout({ pageWidth = 0.7, entryCount = 12 }: DocumentLayoutProps) {
  const entries = React.useMemo(
    () =>
      Array.from({ length: entryCount }, (_, idx) => ({
        id: `entry-${idx + 1}`,
        title: `Milestone #${idx + 1}: Modular Layout Architecture`,
        period: `202${idx % 6} — Q${(idx % 4) + 1}`,
        body:
          'Demonstrates container fragmentation, keepWithNext heading protection, and per-page targeted mounting without duplicating off-page nodes.',
      })),
    [entryCount],
  );

  return (
    <Document size="A4" orientation="portrait" padding="15mm" pageWidth={pageWidth}>
      <PageUnderlay>
        <div
          style={{
            width: '32%',
            height: '100%',
            background: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
          }}
        />
      </PageUnderlay>

      <Header mode="first">
        <div
          style={{
            paddingBottom: '12px',
            marginBottom: '16px',
            borderBottom: '2px solid #1e293b',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '26px' }}>Document Layout Engine (v4)</h1>
        </div>
      </Header>

      <Columns widths={['30%', '70%']} gap="24px">
        <Column gap="12px">
          <Block breakInside="avoid">
            <h3 style={{ margin: '0 0 8px' }}>Overview</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
              Sidebar column with a full-bleed background rendered via <code>&lt;PageUnderlay&gt;</code>.
            </p>
          </Block>
        </Column>

        <Column gap="12px">
          <Section
            continuationHeader={
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '8px',
                }}
              >
                Project Timeline (Continued)
              </div>
            }
          >
            <Block keepWithNext>
              <h2 style={{ margin: '0 0 8px', fontSize: '18px' }}>Project Timeline</h2>
            </Block>

            <Section as={SplitTimelineBox}>
              {entries.map((item) => (
                <Block
                  key={item.id}
                  breakInside="avoid"
                  style={{
                    padding: '10px 12px',
                    marginBottom: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{item.title}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.period}</span>
                  </div>
                  <Text style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.45 }}>
                    {item.body}
                  </Text>
                </Block>
              ))}
            </Section>
          </Section>
        </Column>
      </Columns>

      <Footer>
        {({ pageNumber, totalPages }) => (
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b', paddingTop: '8px' }}>
            Page {pageNumber} of {totalPages}
          </div>
        )}
      </Footer>
    </Document>
  );
}
