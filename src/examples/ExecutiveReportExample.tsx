import React from 'react';
import {
  Block,
  Column,
  Columns,
  Document,
  Footer,
  Header,
  PageOverlay,
  PageUnderlay,
  Section,
  Text,
  useFragment,
  usePaperPrint,
} from '../index';

/* ==========================================================================
   Types & Sample Data
   ========================================================================== */

interface FinancialRow {
  id: string;
  label: string;
  q3_2026: string;
  q3_2025: string;
  yoy: string;
  guidance: string;
  isSubtotal?: boolean;
  isHighlight?: boolean;
  indent?: boolean;
}

const FINANCIAL_DATA: FinancialRow[] = [
  // Revenue
  { id: 'f1', label: 'Subscription & SaaS Revenue', q3_2026: '$318.4', q3_2025: '$242.0', yoy: '+31.6%', guidance: '$1,220.0', indent: true },
  { id: 'f2', label: 'Enterprise Platform Licenses', q3_2026: '$82.6', q3_2025: '$74.2', yoy: '+11.3%', guidance: '$310.0', indent: true },
  { id: 'f3', label: 'Professional Services & Consulting', q3_2026: '$27.5', q3_2025: '$27.1', yoy: '+1.5%', guidance: '$110.0', indent: true },
  { id: 'f4', label: 'Total Consolidated Revenue', q3_2026: '$428.5', q3_2025: '$343.3', yoy: '+24.8%', guidance: '$1,640.0', isSubtotal: true },

  // Cost of Revenues
  { id: 'f5', label: 'Cost of Subscription Revenue', q3_2026: '$68.5', q3_2025: '$58.1', yoy: '+17.9%', guidance: '$270.0', indent: true },
  { id: 'f6', label: 'Cost of Professional Services', q3_2026: '$22.0', q3_2025: '$21.8', yoy: '+0.9%', guidance: '$88.0', indent: true },
  { id: 'f7', label: 'Total Cost of Revenues', q3_2026: '$90.5', q3_2025: '$79.9', yoy: '+13.3%', guidance: '$358.0', isSubtotal: true },
  { id: 'f8', label: 'Gross Profit (78.9% Margin)', q3_2026: '$338.0', q3_2025: '$263.4', yoy: '+28.3%', guidance: '$1,282.0', isHighlight: true },

  // Operating Expenses
  { id: 'f9', label: 'Research & Development (R&D)', q3_2026: '$102.4', q3_2025: '$84.6', yoy: '+21.0%', guidance: '$400.0', indent: true },
  { id: 'f10', label: 'Sales & Marketing (S&M)', q3_2026: '$88.2', q3_2025: '$72.1', yoy: '+22.3%', guidance: '$340.0', indent: true },
  { id: 'f11', label: 'General & Administrative (G&A)', q3_2026: '$35.0', q3_2025: '$28.8', yoy: '+21.5%', guidance: '$132.0', indent: true },
  { id: 'f12', label: 'Total Operating Expenses', q3_2026: '$225.6', q3_2025: '$185.5', yoy: '+21.6%', guidance: '$872.0', isSubtotal: true },

  // Operating Income / EBIT
  { id: 'f13', label: 'Operating Income / GAAP EBIT', q3_2026: '$112.4', q3_2025: '$77.9', yoy: '+44.3%', guidance: '$410.0', isHighlight: true },
  { id: 'f14', label: 'Depreciation & Amortization', q3_2026: '$16.2', q3_2025: '$14.1', yoy: '+14.9%', guidance: '$62.0', indent: true },
  { id: 'f15', label: 'Stock-Based Compensation (SBC)', q3_2026: '$18.4', q3_2025: '$16.8', yoy: '+9.5%', guidance: '$72.0', indent: true },
  { id: 'f16', label: 'Adjusted EBITDA (34.3% Margin)', q3_2026: '$147.0', q3_2025: '$108.8', yoy: '+35.1%', guidance: '$544.0', isHighlight: true },

  // Below the Line
  { id: 'f17', label: 'Net Interest & Other Income', q3_2026: '$6.2', q3_2025: '$3.8', yoy: '+63.2%', guidance: '$22.0', indent: true },
  { id: 'f18', label: 'Income Before Income Taxes', q3_2026: '$118.6', q3_2025: '$81.7', yoy: '+45.2%', guidance: '$432.0', isSubtotal: true },
  { id: 'f19', label: 'Provision for Income Taxes', q3_2026: '$23.7', q3_2025: '$16.3', yoy: '+45.4%', guidance: '$86.4', indent: true },
  { id: 'f20', label: 'GAAP Net Income', q3_2026: '$94.9', q3_2025: '$65.4', yoy: '+45.1%', guidance: '$345.6', isHighlight: true },

  // Cash & Capital
  { id: 'f21', label: 'Diluted Earnings Per Share ($EPS)', q3_2026: '$0.84', q3_2025: '$0.59', yoy: '+42.4%', guidance: '$3.08', isSubtotal: true },
  { id: 'f22', label: 'Capital Expenditures (CapEx)', q3_2026: '$22.8', q3_2025: '$18.2', yoy: '+25.3%', guidance: '$88.0', indent: true },
  { id: 'f23', label: 'Unlevered Free Cash Flow (FCF)', q3_2026: '$89.6', q3_2025: '$59.7', yoy: '+50.1%', guidance: '$320.0', isHighlight: true },
];

interface KpiItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  isPositive: boolean;
  benchmark: string;
  note: string;
}

const KPI_METRICS: KpiItem[] = [
  {
    id: 'kpi-1',
    label: 'Annual Recurring Revenue (ARR)',
    value: '$428.5M',
    delta: '+28.4% YoY',
    isPositive: true,
    benchmark: 'Guidance: $415M-$420M',
    note: 'Net new ARR additions accelerated by $34.2M in Q3 across enterprise tiers.',
  },
  {
    id: 'kpi-2',
    label: 'GAAP Operating Margin',
    value: '26.2%',
    delta: '+380 bps',
    isPositive: true,
    benchmark: 'Peer Median: 18.5%',
    note: 'Operating leverage driven by autonomous platform optimization and G&A discipline.',
  },
  {
    id: 'kpi-3',
    label: 'Free Cash Flow (FCF)',
    value: '$89.6M',
    delta: '+50.1% YoY',
    isPositive: true,
    benchmark: 'FCF Conversion: 79.7%',
    note: 'High-quality cash conversion from operating income with negative working capital cycle.',
  },
  {
    id: 'kpi-4',
    label: 'Net Revenue Retention (NRR)',
    value: '129.4%',
    delta: '+210 bps',
    isPositive: true,
    benchmark: 'Top-Decile Benchmark',
    note: 'Zero customer churn across Fortune 100 cohorts; high expansion in AI workloads.',
  },
  {
    id: 'kpi-5',
    label: 'Rule of 40 Benchmark Score',
    value: '54.6%',
    delta: '+640 bps',
    isPositive: true,
    benchmark: 'Top Decile (>50%)',
    note: 'Calculated as YoY Revenue Growth (28.4%) + Free Cash Flow Margin (26.2%).',
  },
  {
    id: 'kpi-6',
    label: 'LTV to CAC Efficiency Ratio',
    value: '5.4x',
    delta: '+0.6x YoY',
    isPositive: true,
    benchmark: 'Payback: 11.2 months',
    note: 'Enterprise direct sales cycles compressed from 92 to 74 days.',
  },
  {
    id: 'kpi-7',
    label: 'Global Workforce Productivity',
    value: '2,480 FTE',
    delta: '$172.8k ARR/FTE',
    isPositive: true,
    benchmark: '+14.2% Productivity',
    note: 'Headcount expanded 8.5% while revenue expanded 24.8%, demonstrating scale efficiency.',
  },
  {
    id: 'kpi-8',
    label: 'Gross Profit Margin',
    value: '78.9%',
    delta: '+310 bps',
    isPositive: true,
    benchmark: 'Target: >78.0%',
    note: 'Server consolidation and edge caching reduced blended compute hosting costs.',
  },
];

interface OperationalUnit {
  id: string;
  name: string;
  revenue: string;
  growth: string;
  executive: string;
  summary: string;
  milestones: string[];
}

const OPERATIONAL_UNITS: OperationalUnit[] = [
  {
    id: 'unit-1',
    name: 'Enterprise Cloud & Distributed Systems',
    revenue: '$248.5M (58% of Total)',
    growth: '+31.2% YoY',
    executive: 'Marcus Vance, EVP Engineering',
    summary:
      'Apex Cloud Core reached 1,240 enterprise deployments. Architecture refactoring reduced multi-region database failover latency to under 12 milliseconds, enabling mission-critical banking workloads.',
    milestones: [
      'Rolled out automated multi-tenant isolation across North America and EU Frankfurt clusters.',
      'Completed SOC 2 Type II and FedRAMP High certification readiness ahead of schedule.',
      'Achieved 99.999% trailing 12-month platform uptime across all primary geographic zones.',
    ],
  },
  {
    id: 'unit-2',
    name: 'Autonomous AI & Machine Intelligence',
    revenue: '$124.0M (29% of Total)',
    growth: '+46.8% YoY',
    executive: 'Dr. Elena Rostova, Chief AI Officer',
    summary:
      'Fastest growing segment in company history. Our proprietary inference routing engine cuts enterprise model execution cost by 42% while guaranteeing deterministic latency profiles.',
    milestones: [
      'Onboarded 84 new Fortune 500 customers onto Apex Intelligence Runtime in Q3.',
      'Signed strategic multi-year distribution alliance with leading global cloud hyperscalers.',
      'Filed 14 new foundational patents covering adaptive quantization and real-time safety guards.',
    ],
  },
  {
    id: 'unit-3',
    name: 'Cyber Resilience & Governance Services',
    revenue: '$56.0M (13% of Total)',
    growth: '+18.4% YoY',
    executive: 'Sarah Chen, VP Cyber & Risk',
    summary:
      'Maintained 100% compliance record with zero critical vulnerability breaches reported. Expansion into zero-trust telemetry and automated regulatory compliance reporting pipelines.',
    milestones: [
      'Integrated real-time EU AI Act and GDPR compliance continuous auditing engines.',
      'Automated incident remediation pipeline resolving 94% of perimeter alerts without manual triage.',
      'Secured clean SOC 1, SOC 2, and ISO 27001 annual recertifications with PwC.',
    ],
  },
];

/* ==========================================================================
   Fragment-Aware Helper Components (using useFragment)
   ========================================================================== */

/**
 * A container that uses useFragment() to inspect its split status and customize
 * borders and continuation badges across page breaks.
 */
function ContinuationCard({
  children,
  style,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) {
  const { position, isContinuation, isSplit } = useFragment();

  return (
    <div
      data-rp-fragment={position}
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: isSplit
          ? position === 'start'
            ? '6px 6px 0 0'
            : position === 'end'
              ? '0 0 6px 6px'
              : '0'
          : '6px',
        borderTop: isContinuation ? '2px dashed #2563eb' : '1px solid #cbd5e1',
        background: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Continuation banner rendered at the top of subsequent fragments using useFragment().
 */
function TableContinuationBanner() {
  const { isContinuation, index, count } = useFragment();

  if (!isContinuation) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        background: '#eff6ff',
        borderBottom: '1.5px solid #3b82f6',
        color: '#1d4ed8',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      <span>↳ Consolidated Statement of Operations (Continued from previous page)</span>
      <span style={{ fontSize: '10px', color: '#60a5fa' }}>
        Sheet Section {index + 1} of {count}
      </span>
    </div>
  );
}

/* ==========================================================================
   Print Toolbar (RP-No-Print)
   ========================================================================== */

function PrintToolbar() {
  const print = usePaperPrint();
  return (
    <div
      className="rp-no-print"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        fontFamily: '"Inter", -apple-system, sans-serif',
      }}
    >
      <button
        type="button"
        onClick={print}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '6px',
          border: '1px solid #1e293b',
          background: '#0f172a',
          color: '#ffffff',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <span>Print Executive Report / Save PDF</span>
      </button>
      <span style={{ fontSize: '12px', color: '#64748b' }}>
        (A4 Portrait, Multi-Page Pagination with Zero Duplication)
      </span>
    </div>
  );
}

/* ==========================================================================
   Main Component: ExecutiveReportExample
   ========================================================================== */

export interface ExecutiveReportExampleProps {
  pageWidth?: number;
  showPrintToolbar?: boolean;
}

export function ExecutiveReportExample({
  pageWidth = 0.82,
  showPrintToolbar = true,
}: ExecutiveReportExampleProps) {
  return (
    <Document
      size="A4"
      orientation="portrait"
      padding="14mm"
      pageWidth={pageWidth}
      style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {showPrintToolbar && <PrintToolbar />}

      {/* Decorative Page Underlay (Watermark, Sidebar Tint, and Header Bar) */}
      <PageUnderlay>
        {({ pageNumber, totalPages }) => (
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Top Corporate Gradient Stripe */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #0f172a 0%, #1e40af 50%, #0284c7 100%)',
              }}
            />

            {/* Left Column Sidebar Background Tint (matches 32% column width) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '32%',
                height: '100%',
                background: '#f8fafc',
                borderRight: '1px solid #e2e8f0',
              }}
            />

            {/* Faint Center-Right Corporate Watermark on Every Page */}
            <div
              style={{
                position: 'absolute',
                right: '4%',
                bottom: '15%',
                opacity: 0.025,
                fontSize: '85px',
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: '#0f172a',
                transform: 'rotate(-25deg)',
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              APEX GLOBAL
            </div>
          </div>
        )}
      </PageUnderlay>

      {/* Page Overlay: Security Stamp */}
      <PageOverlay>
        <div
          style={{
            position: 'absolute',
            bottom: '4mm',
            right: '14mm',
            fontSize: '8px',
            color: '#94a3b8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}
        >
          SEC-REG-001948 // INTERNAL USE ONLY
        </div>
      </PageOverlay>

      {/* Running Header on Every Page */}
      <Header mode="all">
        {({ pageNumber, totalPages }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '2px solid #0f172a',
              paddingBottom: '8px',
              marginBottom: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: '#0f172a',
                    textTransform: 'uppercase',
                  }}
                >
                  APEX GLOBAL TECHNOLOGIES
                </span>
                <span
                  style={{
                    fontSize: '9.5px',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  NASDAQ: APEX
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                Corporate Executive &amp; Financial Performance Briefing | Q3 2026 Review
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#475569', lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600 }}>October 31, 2026</div>
              <div
                style={{
                  color: '#b91c1c',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                }}
              >
                Confidential // Executive Committee
              </div>
            </div>
          </div>
        )}
      </Header>

      {/* Document Column Grid (32% Sidebar / 68% Main Content) */}
      <Columns widths={['32%', '68%']} gap="24px">
        {/* ==================================================================
            LEFT COLUMN: Executive KPI Panel & Governance Brief
            ================================================================== */}
        <Column gap="14px">
          {/* Section: Key Performance Indicators */}
          <Section>
            <Block keepWithNext>
              <div
                style={{
                  borderBottom: '1.5px solid #0f172a',
                  paddingBottom: '6px',
                  marginBottom: '10px',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#0f172a',
                  }}
                >
                  Key Performance Indicators
                </h3>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  Audited Q3 2026 Operational Metrics
                </span>
              </div>
            </Block>

            {/* List of 8 KPI Cards (Each is an atomic Block with breakInside="avoid") */}
            {KPI_METRICS.map((kpi) => (
              <Block
                key={kpi.id}
                breakInside="avoid"
                style={{
                  marginBottom: '10px',
                  padding: '9px 12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '5px',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      lineHeight: 1.25,
                    }}
                  >
                    {kpi.label}
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: kpi.isPositive ? '#15803d' : '#b91c1c',
                      background: kpi.isPositive ? '#f0fdf4' : '#fef2f2',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {kpi.delta}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: '3px 0 2px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {kpi.value}
                </div>

                <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>
                  {kpi.benchmark}
                </div>

                <div
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    lineHeight: 1.35,
                    marginTop: '4px',
                  }}
                >
                  {kpi.note}
                </div>
              </Block>
            ))}
          </Section>

          {/* Section: Corporate Governance & Risk Controls */}
          <Section>
            <Block keepWithNext>
              <div
                style={{
                  borderBottom: '1.5px solid #0f172a',
                  paddingBottom: '6px',
                  marginBottom: '10px',
                  marginTop: '6px',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#0f172a',
                  }}
                >
                  Governance &amp; Audit Status
                </h3>
              </div>
            </Block>

            <Block
              breakInside="avoid"
              style={{
                padding: '10px 12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '5px',
                fontSize: '11px',
                lineHeight: 1.45,
                color: '#334155',
              }}
            >
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#0f172a' }}>Independent Auditor:</strong>
                <div>PricewaterhouseCoopers LLP</div>
                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>
                  ✓ Unqualified Clean Audit Opinion
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#0f172a' }}>Internal Controls (SOX 404):</strong>
                <div>Certified Effective with No Material Weaknesses</div>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>Liquidity &amp; Balance Sheet:</strong>
                <div>Cash &amp; Short-Term Equities: $640.2M</div>
                <div>Long-Term Debt to Equity: 0.24x</div>
              </div>
            </Block>

            {/* Executive Committee Certification Sign-Off Block */}
            <Block
              breakInside="avoid"
              style={{
                marginTop: '10px',
                padding: '9px 12px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '5px',
                fontSize: '10px',
                color: '#475569',
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                EXECUTIVE CERTIFICATION
              </div>
              <div>Certified by Arthur Pendelton, CEO</div>
              <div>Certified by Vivian Rodriguez, CFO</div>
              <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                In accordance with Sections 302 &amp; 906 of the Sarbanes-Oxley Act of 2002.
              </div>
            </Block>
          </Section>
        </Column>

        {/* ==================================================================
            RIGHT COLUMN: Executive Summary, Multi-Page Table, Operations Review
            ================================================================== */}
        <Column gap="16px">
          {/* Executive Summary Callout Box with Custom Border & Background */}
          <Block
            breakInside="avoid"
            style={{
              padding: '14px 16px',
              borderRadius: '6px',
              border: '1px solid #93c5fd',
              borderLeft: '5px solid #1d4ed8',
              background: '#f0f9ff',
              boxShadow: '0 1px 3px rgba(30, 64, 175, 0.08)',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#1e40af',
                marginBottom: '4px',
              }}
            >
              Executive Summary &amp; Leadership Commentary
            </div>

            <Text
              orphans={2}
              widows={2}
              style={{
                margin: '0 0 8px',
                fontSize: '12.5px',
                lineHeight: 1.5,
                color: '#1e293b',
              }}
            >
              Apex Global delivered an extraordinary third quarter, surpassing consensus expectations across
              consolidated revenue, operating margin expansion, and cash flow generation. Consolidated revenue
              expanded <strong>24.8% YoY to $428.5M</strong>, driven by accelerated adoption of our autonomous cloud
              infrastructure and real-time enterprise AI orchestration runtime.
            </Text>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid #bfdbfe',
              }}
            >
              <div style={{ fontSize: '11px' }}>
                <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase' }}>
                  Revenue Outperformance
                </span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>+$14.5M vs. Midpoint</div>
              </div>
              <div style={{ fontSize: '11px' }}>
                <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase' }}>
                  Operating Margin
                </span>
                <div style={{ fontWeight: 700, color: '#15803d' }}>26.2% (+380 bps YoY)</div>
              </div>
              <div style={{ fontSize: '11px' }}>
                <span style={{ color: '#64748b', fontSize: '9.5px', textTransform: 'uppercase' }}>
                  Free Cash Flow
                </span>
                <div style={{ fontWeight: 700, color: '#1d4ed8' }}>$89.6M (79.7% FCF Conv.)</div>
              </div>
            </div>
          </Block>

          {/* Section 1: Consolidated Financial Statements (The Multi-Row Table That Breaks Across Pages) */}
          <Section>
            {/* Heading protected by keepWithNext */}
            <Block keepWithNext>
              <div style={{ marginBottom: '8px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Consolidated Statement of Operations
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Three Months Ended September 30, 2026 and 2025 (USD in Millions, except per share data)
                </p>
              </div>
            </Block>

            {/* Financial Operations Table Container with Continuation Header */}
            <Section
              as={ContinuationCard}
              continuationHeader={
                <div>
                  <TableContinuationBanner />
                  {/* Repeated Column Headers on Page 2+ */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40% 15% 15% 15% 15%',
                      padding: '7px 10px',
                      background: '#1e293b',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      borderBottom: '1px solid #0f172a',
                    }}
                  >
                    <span>Consolidated Financial Item</span>
                    <span style={{ textAlign: 'right' }}>Q3 2026</span>
                    <span style={{ textAlign: 'right' }}>Q3 2025</span>
                    <span style={{ textAlign: 'right' }}>YoY %</span>
                    <span style={{ textAlign: 'right' }}>FY26 Target</span>
                  </div>
                </div>
              }
            >
              {/* Table Column Header Row (Page 1) */}
              <Block
                breakInside="avoid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40% 15% 15% 15% 15%',
                  padding: '7px 10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  borderBottom: '1px solid #cbd5e1',
                }}
              >
                <span>Consolidated Financial Item</span>
                <span style={{ textAlign: 'right' }}>Q3 2026</span>
                <span style={{ textAlign: 'right' }}>Q3 2025</span>
                <span style={{ textAlign: 'right' }}>YoY %</span>
                <span style={{ textAlign: 'right' }}>FY26 Target</span>
              </Block>

              {/* 23 Multi-Row Table Items: Each wrapped in Block breakInside="avoid" */}
              {FINANCIAL_DATA.map((row, idx) => {
                const isEven = idx % 2 === 0;
                let bg = isEven ? '#ffffff' : '#f8fafc';
                let fontWeight = 400;
                let borderBottom = '1px solid #f1f5f9';

                if (row.isHighlight) {
                  bg = '#f0fdf4';
                  fontWeight = 700;
                  borderBottom = '1.5px solid #bbf7d0';
                } else if (row.isSubtotal) {
                  bg = '#f1f5f9';
                  fontWeight = 600;
                  borderBottom = '1px solid #cbd5e1';
                }

                return (
                  <Block
                    key={row.id}
                    breakInside="avoid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40% 15% 15% 15% 15%',
                      padding: '5px 10px',
                      background: bg,
                      fontSize: '11px',
                      lineHeight: 1.35,
                      borderBottom,
                    }}
                  >
                    <span
                      style={{
                        paddingLeft: row.indent ? '12px' : 0,
                        fontWeight,
                        color: row.isHighlight ? '#0f172a' : '#1e293b',
                      }}
                    >
                      {row.label}
                    </span>
                    <span style={{ textAlign: 'right', fontWeight, color: '#0f172a' }}>
                      {row.q3_2026}
                    </span>
                    <span style={{ textAlign: 'right', color: '#64748b' }}>{row.q3_2025}</span>
                    <span
                      style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color: row.yoy.startsWith('+') ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {row.yoy}
                    </span>
                    <span style={{ textAlign: 'right', color: '#475569' }}>{row.guidance}</span>
                  </Block>
                );
              })}
            </Section>
          </Section>

          {/* Section 2: Segment Operational Review & Strategic Execution */}
          <Section>
            {/* Heading protected by keepWithNext so it never orphans alone at bottom */}
            <Block keepWithNext>
              <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Segment Operational Analysis &amp; Milestones
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Execution reviews by division and core infrastructure engineering leaders
                </p>
              </div>
            </Block>

            {/* Operational Unit Cards */}
            {OPERATIONAL_UNITS.map((unit) => (
              <Block
                key={unit.id}
                breakInside="avoid"
                style={{
                  marginBottom: '12px',
                  padding: '12px 14px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{unit.name}</strong>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontWeight: 700,
                    }}
                  >
                    {unit.growth}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 6px' }}>
                  Revenue: <span style={{ fontWeight: 600, color: '#0f172a' }}>{unit.revenue}</span> | Lead:{' '}
                  {unit.executive}
                </div>

                <Text
                  orphans={2}
                  widows={2}
                  style={{
                    margin: '0 0 8px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: '#334155',
                  }}
                >
                  {unit.summary}
                </Text>

                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Key Execution Milestones:
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '18px',
                    fontSize: '11.5px',
                    lineHeight: 1.45,
                    color: '#475569',
                  }}
                >
                  {unit.milestones.map((ms, mIdx) => (
                    <li key={mIdx} style={{ marginBottom: '2px' }}>
                      {ms}
                    </li>
                  ))}
                </ul>
              </Block>
            ))}
          </Section>

          {/* Section 3: Forward Guidance & Outlook */}
          <Section>
            <Block keepWithNext>
              <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Q4 2026 Guidance &amp; Capital Allocation Outlook
                </h2>
              </div>
            </Block>

            <Block
              breakInside="avoid"
              style={{
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '11.5px',
                lineHeight: 1.5,
                color: '#334155',
              }}
            >
              <Text orphans={2} widows={2} style={{ margin: 0 }}>
                For the fourth quarter of fiscal 2026, management raises full-year guidance to reflect sustained
                enterprise contract expansions. Q4 revenue is expected between <strong>$445.0M and $455.0M</strong>,
                bringing full-year revenue to $1,650M–$1,660M (up 25.5% YoY). CapEx allocation will prioritize
                our Frankfurt and Tokyo high-density AI clusters, funded entirely through operating cash flows
                with zero secondary equity dilution.
              </Text>
            </Block>
          </Section>
        </Column>
      </Columns>

      {/* Footer with Page Numbering & Confidentiality Disclaimer */}
      <Footer>
        {({ pageNumber, totalPages }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #cbd5e1',
              paddingTop: '8px',
              fontSize: '10px',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>CONFIDENTIAL</span>
              <span>—</span>
              <span>Strictly for Apex Board of Directors &amp; Executive Leadership</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '9px', color: '#94a3b8' }}>
                DOC-REF: APX-FIN-2026Q3
              </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                Page {pageNumber} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </Footer>
    </Document>
  );
}
