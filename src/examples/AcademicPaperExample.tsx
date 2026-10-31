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

export interface AcademicPaperExampleProps {
  pageWidth?: number;
  showPrintToolbar?: boolean;
}

/**
 * Custom section container demonstrating useFragment() for continuation headers
 * and dynamic styling across page/column breaks.
 */
function AcademicSectionRail({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const { isContinuation, position } = useFragment();
  return (
    <div
      data-rp-fragment={position}
      style={{
        position: 'relative',
        borderLeft: isContinuation ? '2px dashed #94a3b8' : '2px solid transparent',
        paddingLeft: isContinuation ? '8px' : 0,
        transition: 'all 0.2s ease',
      }}
    >
      {isContinuation && (
        <div
          style={{
            fontSize: '9.5px',
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#475569',
            marginBottom: '6px',
            paddingBottom: '3px',
            borderBottom: '1px dotted #cbd5e1',
          }}
        >
          [ {title} — Continued from previous page ]
        </div>
      )}
      {children}
    </div>
  );
}

function PrintToolbar() {
  const print = usePaperPrint();
  return (
    <div
      className="rp-no-print"
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <button
        type="button"
        onClick={print}
        style={{
          padding: '8px 20px',
          borderRadius: '6px',
          border: '1px solid #1e293b',
          background: '#0f172a',
          color: '#ffffff',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        Print Paper (PDF Export)
      </button>
    </div>
  );
}

export function AcademicPaperExample({
  pageWidth = 0.78,
  showPrintToolbar = true,
}: AcademicPaperExampleProps): React.ReactElement {
  return (
    <div style={{ fontFamily: '"Times New Roman", Times, Cambria, Georgia, serif', color: '#111827' }}>
      {showPrintToolbar && <PrintToolbar />}

      <Document
        size="A4"
        orientation="portrait"
        padding="16mm"
        pageWidth={pageWidth}
      >
        {/* Underlay: Gutter guide line between the two columns */}
        <PageUnderlay>
          {({ pageNumber }) => (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {/* Subtle vertical rule between the two columns */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: pageNumber === 1 ? '42%' : '4%',
                  bottom: '5%',
                  width: '1px',
                  background: 'rgba(203, 213, 225, 0.45)',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          )}
        </PageUnderlay>

        {/* Overlay: Running DOI and Conference Metadata in margin */}
        <PageOverlay>
          {({ pageNumber }) => (
            <div
              style={{
                position: 'absolute',
                top: '7mm',
                right: '16mm',
                fontSize: '8.5px',
                fontFamily: 'monospace',
                color: '#94a3b8',
                letterSpacing: '0.04em',
                pointerEvents: 'none',
              }}
            >
              ACM / IEEE PAPERS • VOL. 42 • NO. 3 • NOV 2026 • PAGE {pageNumber}
            </div>
          )}
        </PageOverlay>

        {/* First-Page Header: Single Column Title, Authors, Abstract, Keywords */}
        <Header mode="first">
          <div
            style={{
              textAlign: 'center',
              paddingBottom: '16px',
              marginBottom: '16px',
              borderBottom: '1.5px solid #111827',
            }}
          >
            {/* Paper Title */}
            <h1
              style={{
                margin: '0 0 10px',
                fontSize: '22px',
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
              }}
            >
              Synthesizing Deterministic Document Layouts via Decoupled DOM Geometry
              Measurement and Pure Arithmetic Pagination
            </h1>

            {/* Author Block */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '36px',
                marginTop: '12px',
                marginBottom: '16px',
                fontSize: '11px',
                lineHeight: 1.4,
                color: '#1f2937',
              }}
            >
              <div>
                <strong style={{ fontSize: '12px', display: 'block', color: '#111827' }}>
                  Elena Rostova, Ph.D.
                </strong>
                <div>Computer Science &amp; AI Laboratory</div>
                <div>Massachusetts Institute of Technology</div>
                <div style={{ color: '#4b5563', fontStyle: 'italic' }}>elena.rostova@csail.mit.edu</div>
              </div>

              <div>
                <strong style={{ fontSize: '12px', display: 'block', color: '#111827' }}>
                  Marcus Vance, Ph.D.
                </strong>
                <div>Systems Architecture Division</div>
                <div>Stanford University, CA</div>
                <div style={{ color: '#4b5563', fontStyle: 'italic' }}>vance@cs.stanford.edu</div>
              </div>

              <div>
                <strong style={{ fontSize: '12px', display: 'block', color: '#111827' }}>
                  Sofia Chen, M.S.
                </strong>
                <div>Document Engineering Lab</div>
                <div>Aether Cloud Technologies</div>
                <div style={{ color: '#4b5563', fontStyle: 'italic' }}>chen.s@aetherlabs.org</div>
              </div>
            </div>

            {/* Abstract & Keywords Box */}
            <div
              style={{
                textAlign: 'justify',
                margin: '0 auto',
                maxWidth: '92%',
                fontSize: '10px',
                lineHeight: 1.45,
                background: '#f8fafc',
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '3px',
              }}
            >
              <p style={{ margin: '0 0 6px', textIndent: '14px' }}>
                <strong style={{ fontStyle: 'normal', textTransform: 'uppercase' }}>Abstract</strong>—Client-side
                document typesetting in web platforms has historically suffered from severe performance
                bottlenecks and layout instability caused by interleaving DOM reads with geometric mutation.
                Traditional approaches rely on recursive DOM cloning, producing O(P × N) element duplication
                across P pages and triggering uncontrollable browser reflow cascades. In this paper, we introduce a
                headless two-phase pagination architecture that cleanly bifurcates layout into single-pass DOM geometry
                measurement (Phase 1) and a deterministic, pure arithmetic pagination solver (Phase 2). By projecting
                sub-pixel wrapped line boxes measured via native DOM <code>Range.getClientRects()</code> onto canonical CSS
                pixels (96 DPI), our engine resolves CSS Fragmentation Level 3 constraints—including line-level orphan and
                widow protection, <code>keepWithNext</code> heading grouping, and container fragmentation metadata—in under 5ms
                for 50-page documents. Experimental benchmarks demonstrate a 958× speedup during continuous state
                updates compared to legacy DOM-cloning architectures.
              </p>
              <div style={{ margin: 0, fontStyle: 'italic' }}>
                <strong style={{ fontStyle: 'normal' }}>Keywords:</strong> CSS Fragmentation Level 3, Headless Layout Engine,
                Sub-pixel Line Measurement, Arithmetic Pagination, Multi-Column Typesetting, Zero-Duplication Virtualization.
              </div>
            </div>
          </div>
        </Header>

        {/* Running Header: Mode All for pages 2+ */}
        <Header mode="all">
          {({ pageNumber }) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '8.5px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#64748b',
                paddingBottom: '4px',
                marginBottom: '10px',
                borderBottom: '0.5px solid #cbd5e1',
              }}
            >
              <span>IEEE Transactions on Computational Typography</span>
              <span>
                {pageNumber === 1
                  ? 'Conference Preprint'
                  : 'Rostova et al.: Decoupled Arithmetic Pagination & Layout Synthesis'}
              </span>
            </div>
          )}
        </Header>

        {/* Two-Column Body Flow */}
        <Columns widths={['50%', '50%']} gap="18px">
          {/* ================================================================= */}
          {/* COLUMN 0: Left Column Flow                                        */}
          {/* ================================================================= */}
          <Column gap="12px">
            {/* Section I: Introduction */}
            <Section>
              <Block keepWithNext>
                <h2
                  style={{
                    margin: '0 0 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  I. Introduction
                </h2>
              </Block>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Typesetting structured documents directly within client-side browser environments has emerged as an
                essential requirement for enterprise reporting, scientific publication platforms, and legal contract
                synthesis. Unlike traditional desktop publishing engines such as TeX or InDesign, which operate
                over static geometric models, web applications run inside highly dynamic, reactive runtimes such as React.
                In these runtimes, reactive state transitions, live font-loading, and responsive viewport changes
                frequently invalidate visual page boundaries.
              </Text>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Despite the expressive power of modern CSS Grid and Flexbox, standard browser rendering engines do not
                expose programmatic APIs for CSS Fragmentation Level 3 across continuous multi-page print sheets. The CSS
                Paged Media Module provides rudimentary printing hooks (e.g., <code>@page</code> and <code>break-inside: avoid</code>),
                yet these directives execute exclusively within the browser’s opaque print preview subsystem. Applications
                cannot inspect which elements landed on which page, cannot insert dynamic page-relative headers or footers,
                and cannot mount interactive UI elements on paginated surfaces without writing custom userland pagination logic.
              </Text>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Early userland pagination frameworks addressed this limitation by duplicating the entire React element tree
                P times for a P-page document. Each page slice mounted the full DOM hierarchy inside an <code>overflow: hidden</code>
                container and translated the content vertically by an estimated offset. This architectural flaw created O(P × N)
                computational complexity, leaked redundant DOM nodes, fragmented screen readers, and caused sub-pixel line clipping
                whenever line heights did not divide page height into integers.
              </Text>
            </Section>

            {/* Section II: Theoretical Model & Pagination Calculus */}
            <Section>
              <Block keepWithNext>
                <h2
                  style={{
                    margin: '8px 0 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  II. Mathematical Foundations &amp; Calculus
                </h2>
              </Block>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Let a document be modeled as an ordered sequence of layout nodes 𝒩 = (n₁, n₂, …, n_K), where each
                node n_i possesses an intrinsic border-box height h(n_i) ∈ ℝ⁺, top margin m_top(n_i), bottom
                margin m_bot(n_i), and fragmentation constraints 𝒞(n_i) = ⟨b_in, b_after, Ω, 𝒲⟩.
                Here b_in ∈ {'{'}auto, avoid{'}'} dictates splittability, b_after ∈ {'{'}auto, avoid, page{'}'}
                enforces sibling adjacency, and Ω, 𝒲 ∈ ℕ (≥ 1) denote orphan and widow thresholds.
              </Text>

              {/* Theorem Callout Box */}
              <Block
                breakInside="avoid"
                style={{
                  margin: '8px 0',
                  padding: '9px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderLeft: '3.5px solid #0f172a',
                  borderRadius: '2px',
                  fontSize: '10px',
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Theorem 1 (Non-Overlapping Page Budget Invariance).
                </div>
                <div style={{ fontStyle: 'italic', textAlign: 'justify', color: '#1e293b' }}>
                  Let 𝒫 = {'{'}p₁, p₂, …, p_M{'}'} denote the sequence of generated pages. For any page p_j having
                  geometric capacity H_avail(p_j) = H_page − H_hdr(p_j) − H_ftr, and for any
                  allocated subset of slices 𝒮(p_j) ⊆ 𝒩, the total vertical consumption satisfies:
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    margin: '6px 0',
                    fontFamily: 'serif',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  ∑ [ h(s) + m̃_top(s) + m̃_bot(s) ] ≤ H_avail(p_j) + ε
                </div>
                <div style={{ fontSize: '9.5px', color: '#475569', textAlign: 'justify' }}>
                  where m̃ denotes collapsed margins satisfying m̃_top(s_k) = max(0, m_top(s_k) − m_bot(s_k-1)),
                  and ε = 0.01 px prevents floating-point rounding drift. Furthermore, no atomic block is allocated to
                  p_j unless its complete height fits without vertical truncation.
                </div>
              </Block>

              {/* Lemma 1 Callout Box */}
              <Block
                breakInside="avoid"
                style={{
                  margin: '8px 0',
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderLeft: '3.5px solid #2563eb',
                  borderRadius: '2px',
                  fontSize: '9.5px',
                  lineHeight: 1.4,
                }}
              >
                <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: '3px' }}>
                  Lemma 1 (Linear Convergence of Lookahead Chaining).
                </div>
                <div style={{ fontStyle: 'italic', textAlign: 'justify', color: '#1e293b' }}>
                  Let c_i denote the length of any contiguous sequence of nodes bound by keepWithNext constraints starting at node n_i.
                  Because each node participates in at most one forward chain, the cumulative lookahead evaluations across the entire document
                  is strictly bounded by 2N operations:
                </div>
                <div style={{ textAlign: 'center', margin: '4px 0', fontFamily: 'serif', fontWeight: 600 }}>
                  T(N) = ∑ [ O(1 + c_i) ] ≤ O(2N) = O(N)
                </div>
                <div style={{ fontSize: '9px', color: '#475569', textAlign: 'justify' }}>
                  Proof. Each node is inspected at most once during forward lookahead traversal and at most once during slice allocation.
                  Thus, the allocation algorithm achieves optimal O(N) linear time complexity regardless of pagination density.
                </div>
              </Block>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                When line-splittable text paragraphs are evaluated, the line-box coordinates measured via native DOM Range APIs
                define exact vertical cut-planes. Rather than dividing text at arbitrary pixel intervals, the solver enforces that
                any split plane y_cut coincides with the arithmetic midpoint of adjacent lines l_k and l_k+1:
                y_cut = [ bottom(l_k) + top(l_k+1) ] / 2.
                This ensures complete ascender and descender integrity across page boundaries, preventing glyph clipping.
              </Text>
            </Section>

            {/* Section III: System Architecture & Continuation Rail */}
            <Section
              as={AcademicSectionRail}
              title="III. Two-Phase Architecture & Line Geometry"
              continuationHeader={(f) => (
                <div
                  style={{
                    fontSize: '9px',
                    fontFamily: 'serif',
                    fontStyle: 'italic',
                    color: '#64748b',
                    marginBottom: '6px',
                    borderBottom: '0.5px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  Section III: System Architecture (Continuation Slice {f.index + 1} of {f.count})
                </div>
              )}
            >
              <Block keepWithNext>
                <h2
                  style={{
                    margin: '8px 0 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  III. Two-Phase Architecture &amp; Line Geometry
                </h2>
              </Block>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                The fundamental insight behind our architecture is the strict decoupling of layout into two non-interleaved phases:
                Phase 1 DOM Geometry Collection (the <em>prepare</em> step) and Phase 2 Pure Arithmetic Tree Pagination (the <em>layout</em> step).
                In Phase 1, the document content is temporarily rendered into an invisible, non-interactive staging root (<code>.rp-staging</code>)
                having the exact target column widths. A single recursive read pass captures border-box dimensions, margin collapses,
                and wrapped line rects into serializable TypeScript records.
              </Text>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Once the staging pass finishes, Phase 2 executes in pure arithmetic. The solver never invokes <code>getComputedStyle</code>,
                never triggers DOM reflows, and never reads element geometry. By operating exclusively over plain arrays of numbers, the
                pagination solver completes in sub-millisecond execution times and can be thoroughly unit-tested inside Node.js headless
                environments without requiring browser binaries.
              </Text>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Crucially, atomic blocks are mounted only onto the single target page sheet where the arithmetic solver placed them.
                Unlike legacy architectures where every page mounted the entire document tree, our engine mounts exactly N total block
                instances across all P pages. For a 100-page document containing 1,000 blocks, this reduces React virtual DOM nodes
                from 100,000 to precisely 1,000, eliminating memory exhaustion during document editing.
              </Text>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Container blocks (such as <code>&lt;Section&gt;</code>) that cross page boundaries split cleanly around their allocated children.
                Using the <code>useFragment()</code> React hook and the <code>data-rp-fragment</code> DOM attribute, containers receive dynamic
                state flags (<code>single</code>, <code>start</code>, <code>middle</code>, or <code>end</code>). This allows developers to render
                continuation indicators, close borders cleanly on page breaks, and display repeating section titles without duplicating content.
              </Text>
            </Section>
          </Column>

          {/* ================================================================= */}
          {/* COLUMN 1: Right Column Flow                                       */}
          {/* ================================================================= */}
          <Column gap="12px">
            {/* Section IV: Algorithm & Code Snippet Box */}
            <Section>
              <Block keepWithNext>
                <h2
                  style={{
                    margin: '0 0 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  IV. Algorithm &amp; Implementation
                </h2>
              </Block>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Algorithm 1 formally details the linear-time arithmetic allocation algorithm. The procedure accepts the prepared node tree
                𝒯 and page geometry 𝒢, maintaining a lightweight allocation cursor ⟨p, h_used⟩.
                Lookahead evaluation ensures that any sequence of nodes bound by <code>keepWithNext</code> (such as section headings or
                figure-caption pairs) are evaluated as an atomic composite height before committing allocation.
              </Text>

              {/* Algorithm Box (breakInside="avoid") */}
              <Block
                breakInside="avoid"
                style={{
                  margin: '8px 0',
                  borderTop: '2px solid #0f172a',
                  borderBottom: '2px solid #0f172a',
                  padding: '8px 4px',
                  background: '#fafafa',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: '9.2px',
                  lineHeight: 1.35,
                }}
              >
                <div
                  style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    fontWeight: 700,
                    fontSize: '10px',
                    borderBottom: '1px solid #94a3b8',
                    paddingBottom: '3px',
                    marginBottom: '6px',
                  }}
                >
                  <strong>Algorithm 1:</strong> Two-Phase Arithmetic Page Allocator
                </div>
                <div style={{ color: '#475569', marginBottom: '4px' }}>
                  <strong>Input:</strong> Prepared Nodes 𝒩 = (n₁ … n_K), Geometry 𝒢 = ⟨W, H, P, C⟩<br />
                  <strong>Output:</strong> Paginated Document Model 𝒟 = {'{'}p₁ … p_M{'}'}
                </div>
                <div style={{ paddingLeft: '8px' }}>
                  <div>01: <strong>Initialize:</strong> p ← 0, h_used ← 0, Pages ← [[]]</div>
                  <div>02: <strong>For each</strong> node n_i ∈ 𝒩 <strong>do</strong></div>
                  <div style={{ paddingLeft: '12px' }}>
                    <div>03: H_chain ← ComputeKeepWithNextChain(n_i, 𝒩)</div>
                    <div>04: Δm ← CollapseMargins(n_i, n_i-1)</div>
                    <div>05: <strong>If</strong> h_used + Δm + H_chain &gt; H_avail(p) <strong>and</strong> h_used &gt; 0 <strong>then</strong></div>
                    <div style={{ paddingLeft: '12px' }}>
                      <div>06: p ← p + 1; h_used ← 0; Pages[p] ← []</div>
                    </div>
                    <div>07: <strong>If</strong> n_i.kind = atomic ∨ n_i.breakInside = 'avoid' <strong>then</strong></div>
                    <div style={{ paddingLeft: '12px' }}>
                      <div>08: Pages[p].push(CreateSlice(n_i, 'single'))</div>
                      <div>09: h_used ← h_used + Δm + n_i.height + n_i.marginBottom</div>
                    </div>
                    <div>10: <strong>Else if</strong> n_i.kind = lines <strong>then</strong></div>
                    <div style={{ paddingLeft: '12px' }}>
                      <div>11: ⟨slices, p, h_used⟩ ← PartitionLines(n_i, p, h_used, Ω, 𝒲)</div>
                    </div>
                    <div>12: <strong>Else if</strong> n_i.kind = container <strong>then</strong></div>
                    <div style={{ paddingLeft: '12px' }}>
                      <div>13: RecursivelyAllocateContainer(n_i.children, p, h_used)</div>
                    </div>
                  </div>
                  <div>14: <strong>FinalizeFragmentMetadata</strong>(Pages)</div>
                  <div>15: <strong>Return</strong> 𝒟 = ⟨Pages, p + 1, 𝒢⟩</div>
                </div>
              </Block>

              {/* Multi-Item Code Snippet Box (breakInside="avoid") */}
              <Block
                breakInside="avoid"
                style={{
                  margin: '8px 0',
                  padding: '8px 10px',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  borderRadius: '3px',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: '8.8px',
                  lineHeight: 1.35,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}
              >
                <div
                  style={{
                    color: '#94a3b8',
                    borderBottom: '1px solid #334155',
                    paddingBottom: '4px',
                    marginBottom: '6px',
                    fontSize: '9px',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Listing 1: Pure Arithmetic Solver Implementation</span>
                  <span style={{ color: '#38bdf8' }}>paginateTree.ts</span>
                </div>
                <div><span style={{ color: '#c084fc' }}>for</span> (<span style={{ color: '#38bdf8' }}>let</span> c = 0; c &lt; colCount; c++) {'{'}</div>
                <div style={{ paddingLeft: '10px' }}><span style={{ color: '#38bdf8' }}>const</span> state = createCursorState();</div>
                <div style={{ paddingLeft: '10px' }}>allocateNodeList(columns[c], rowGap, isFlex, state, geom,</div>
                <div style={{ paddingLeft: '20px' }}>(pageIdx, slice) =&gt; state.pages[pageIdx].push(slice),</div>
                <div style={{ paddingLeft: '20px' }}>() =&gt; 0,</div>
                <div style={{ paddingLeft: '20px' }}>() =&gt; advancePage(state),</div>
                <div style={{ paddingLeft: '10px' }}>);</div>
                <div style={{ paddingLeft: '10px' }}>finalizeFragmentPositions(state.pages);</div>
                <div>{'}'}</div>
              </Block>
            </Section>

            {/* Section V: Empirical Evaluation & Figures */}
            <Section
              as={AcademicSectionRail}
              title="V. Empirical Evaluation & Benchmarks"
              continuationHeader={(f) => (
                <div
                  style={{
                    fontSize: '9px',
                    fontFamily: 'serif',
                    fontStyle: 'italic',
                    color: '#64748b',
                    marginBottom: '6px',
                    borderBottom: '0.5px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  Section V: Empirical Evaluation (Continued, fragment {f.index + 1})
                </div>
              )}
            >
              <Block keepWithNext>
                <h2
                  style={{
                    margin: '8px 0 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  V. Empirical Evaluation &amp; Benchmarks
                </h2>
              </Block>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                To evaluate runtime efficiency, we conducted extensive benchmarks measuring continuous re-render latencies
                across document volumes ranging from 5 to 50 pages. Benchmarks were executed on an Apple M3 Max processor
                running Node 20.12 and Chromium 124. Table I summarizes pagination latency and total mounted React nodes
                between legacy DOM-cloning architectures and our decoupled two-phase engine.
              </Text>

              {/* Table I: Benchmark Table (breakInside="avoid") */}
              <Block
                breakInside="avoid"
                style={{
                  margin: '8px 0',
                  padding: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '9px',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '4px',
                    fontSize: '9px',
                  }}
                >
                  Table I: Re-render Latency &amp; Node Allocation Metrics
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #0f172a', borderTop: '1px solid #0f172a' }}>
                      <th style={{ padding: '3px', textAlign: 'left' }}>Pages</th>
                      <th style={{ padding: '3px' }}>Nodes (N)</th>
                      <th style={{ padding: '3px' }}>v3 Latency</th>
                      <th style={{ padding: '3px' }}>v4 Latency</th>
                      <th style={{ padding: '3px' }}>Speedup</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '0.5px solid #cbd5e1' }}>
                      <td style={{ padding: '3px', textAlign: 'left' }}>5 Pages</td>
                      <td style={{ padding: '3px' }}>50</td>
                      <td style={{ padding: '3px' }}>14.2 ms</td>
                      <td style={{ padding: '3px', fontWeight: 600 }}>0.04 ms</td>
                      <td style={{ padding: '3px', color: '#16a34a', fontWeight: 700 }}>355×</td>
                    </tr>
                    <tr style={{ borderBottom: '0.5px solid #cbd5e1' }}>
                      <td style={{ padding: '3px', textAlign: 'left' }}>15 Pages</td>
                      <td style={{ padding: '3px' }}>150</td>
                      <td style={{ padding: '3px' }}>42.8 ms</td>
                      <td style={{ padding: '3px', fontWeight: 600 }}>0.06 ms</td>
                      <td style={{ padding: '3px', color: '#16a34a', fontWeight: 700 }}>713×</td>
                    </tr>
                    <tr style={{ borderBottom: '0.5px solid #cbd5e1' }}>
                      <td style={{ padding: '3px', textAlign: 'left' }}>30 Pages</td>
                      <td style={{ padding: '3px' }}>300</td>
                      <td style={{ padding: '3px' }}>71.7 ms</td>
                      <td style={{ padding: '3px', fontWeight: 600 }}>0.07 ms</td>
                      <td style={{ padding: '3px', color: '#16a34a', fontWeight: 700 }}>1,024×</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #0f172a' }}>
                      <td style={{ padding: '3px', textAlign: 'left' }}>50 Pages</td>
                      <td style={{ padding: '3px' }}>500</td>
                      <td style={{ padding: '3px' }}>189.4 ms</td>
                      <td style={{ padding: '3px', fontWeight: 600 }}>0.14 ms</td>
                      <td style={{ padding: '3px', color: '#16a34a', fontWeight: 700 }}>1,352×</td>
                    </tr>
                  </tbody>
                </table>
              </Block>

              {/* Figure 1 Card: Paired with Caption using keepWithNext */}
              <Block
                keepWithNext
                breakInside="avoid"
                style={{
                  margin: '8px 0 2px',
                  padding: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '2px',
                  textAlign: 'center',
                }}
              >
                {/* SVG Visualization: Latency Comparison Chart */}
                <svg
                  viewBox="0 0 320 140"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  aria-label="Benchmark Comparison Chart"
                >
                  <rect x="0" y="0" width="320" height="140" fill="#f8fafc" rx="4" />
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="305" y2="20" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="50" x2="305" y2="50" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="80" x2="305" y2="80" stroke="#e2e8f0" strokeDasharray="3,3" />
                  <line x1="40" y1="110" x2="305" y2="110" stroke="#94a3b8" />

                  {/* Y-Axis Labels */}
                  <text x="32" y="23" fontSize="8" textAnchor="end" fill="#64748b">180ms</text>
                  <text x="32" y="53" fontSize="8" textAnchor="end" fill="#64748b">120ms</text>
                  <text x="32" y="83" fontSize="8" textAnchor="end" fill="#64748b">60ms</text>
                  <text x="32" y="113" fontSize="8" textAnchor="end" fill="#64748b">0ms</text>

                  {/* Group 1: 5 Pages */}
                  <rect x="60" y="102" width="20" height="8" fill="#ef4444" rx="1" />
                  <rect x="84" y="109" width="20" height="1" fill="#2563eb" rx="1" />
                  <text x="82" y="123" fontSize="8" textAnchor="middle" fill="#334155">5 Pages</text>

                  {/* Group 2: 15 Pages */}
                  <rect x="120" y="88" width="20" height="22" fill="#ef4444" rx="1" />
                  <rect x="144" y="109" width="20" height="1" fill="#2563eb" rx="1" />
                  <text x="142" y="123" fontSize="8" textAnchor="middle" fill="#334155">15 Pages</text>

                  {/* Group 3: 30 Pages */}
                  <rect x="180" y="74" width="20" height="36" fill="#ef4444" rx="1" />
                  <rect x="204" y="109" width="20" height="1" fill="#2563eb" rx="1" />
                  <text x="202" y="123" fontSize="8" textAnchor="middle" fill="#334155">30 Pages</text>

                  {/* Group 4: 50 Pages */}
                  <rect x="240" y="25" width="20" height="85" fill="#ef4444" rx="1" />
                  <rect x="264" y="108" width="20" height="2" fill="#2563eb" rx="1" />
                  <text x="262" y="123" fontSize="8" textAnchor="middle" fill="#334155">50 Pages</text>

                  {/* Legend */}
                  <rect x="175" y="6" width="10" height="7" fill="#ef4444" rx="1" />
                  <text x="188" y="12" fontSize="7.5" fill="#334155">Legacy DOM-Cloning</text>
                  <rect x="250" y="6" width="10" height="7" fill="#2563eb" rx="1" />
                  <text x="263" y="12" fontSize="7.5" fill="#334155">Two-Phase Engine</text>
                </svg>
              </Block>

              {/* Caption paired to Figure 1 */}
              <Block
                breakInside="avoid"
                style={{
                  fontSize: '9px',
                  lineHeight: 1.35,
                  color: '#334155',
                  marginBottom: '10px',
                  textAlign: 'justify',
                }}
              >
                <strong>Fig. 1.</strong> Re-render latency comparison across document page counts. While legacy
                DOM-cloning architectures exhibit quadratic degradation (O(P × N)) as page counts increase, our
                two-phase engine sustains sub-millisecond execution times (&lt;0.15ms) across all benchmarks.
              </Block>

              {/* Figure 2 Card: Pipeline Architecture Diagram */}
              <Block
                keepWithNext
                breakInside="avoid"
                style={{
                  margin: '8px 0 2px',
                  padding: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '2px',
                  textAlign: 'center',
                }}
              >
                <svg
                  viewBox="0 0 320 80"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  aria-label="Pipeline Architecture Diagram"
                >
                  <rect x="0" y="0" width="320" height="80" fill="#f8fafc" rx="4" />

                  {/* Box 1 */}
                  <rect x="8" y="14" width="85" height="52" fill="#ffffff" stroke="#0f172a" strokeWidth="1" rx="2" />
                  <text x="50" y="28" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#0f172a">Phase 1: Measure</text>
                  <text x="50" y="40" fontSize="7" textAnchor="middle" fill="#64748b">Batch DOM Read</text>
                  <text x="50" y="52" fontSize="6.5" textAnchor="middle" fill="#64748b">Range.getClientRects()</text>

                  {/* Arrow 1 */}
                  <line x1="94" y1="40" x2="114" y2="40" stroke="#0f172a" strokeWidth="1.2" />
                  <polygon points="114,40 108,37 108,43" fill="#0f172a" />

                  {/* Box 2 */}
                  <rect x="116" y="14" width="88" height="52" fill="#ffffff" stroke="#2563eb" strokeWidth="1.2" rx="2" />
                  <text x="160" y="28" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1d4ed8">Phase 2: Solve</text>
                  <text x="160" y="40" fontSize="7" textAnchor="middle" fill="#475569">Pure Arithmetic</text>
                  <text x="160" y="52" fontSize="6.5" textAnchor="middle" fill="#475569">paginateTree() Solver</text>

                  {/* Arrow 2 */}
                  <line x1="205" y1="40" x2="225" y2="40" stroke="#0f172a" strokeWidth="1.2" />
                  <polygon points="225,40 219,37 219,43" fill="#0f172a" />

                  {/* Box 3 */}
                  <rect x="227" y="14" width="85" height="52" fill="#ffffff" stroke="#0f172a" strokeWidth="1" rx="2" />
                  <text x="269" y="28" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#0f172a">Phase 3: Mount</text>
                  <text x="269" y="40" fontSize="7" textAnchor="middle" fill="#64748b">Per-Page Target</text>
                  <text x="269" y="52" fontSize="6.5" textAnchor="middle" fill="#64748b">1:1 Block Mounting</text>
                </svg>
              </Block>

              {/* Caption paired to Figure 2 */}
              <Block
                breakInside="avoid"
                style={{
                  fontSize: '9px',
                  lineHeight: 1.35,
                  color: '#334155',
                  marginBottom: '10px',
                  textAlign: 'justify',
                }}
              >
                <strong>Fig. 2.</strong> Conceptual execution pipeline of <code>@joaopmo/react-paper</code>.
                Single-pass DOM geometry extraction produces a serializable node tree, which the pure arithmetic solver
                partitions across discrete page budgets before target mounting.
              </Block>
            </Section>

            {/* Section VI: Discussion & Practical Considerations */}
            <Section>
              <Block keepWithNext>
                <h2
                  style={{
                    margin: '8px 0 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  VI. Discussion &amp; Limitations
                </h2>
              </Block>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                While the two-phase layout model eliminates reflow cascade loops and DOM duplication, several practical
                considerations arise in complex multi-column environments. First, because each <code>&lt;Column&gt;</code>
                constitutes an independent vertical pagination flow lane, balanced column flows (where text automatically balances
                height evenly across two columns on the final page) require explicit author partitioning or higher-level flow primitives.
              </Text>

              <Text
                orphans={2}
                widows={2}
                style={{
                  margin: '0 0 8px',
                  fontSize: '10.5px',
                  lineHeight: 1.45,
                  textAlign: 'justify',
                  textIndent: '14px',
                }}
              >
                Second, the line-box slicing mechanism relies on native <code>Range.getClientRects()</code>. When host
                environments execute inside virtualized server-side test harnesses (e.g. JSDOM without native layout calculation),
                the collector must gracefully fall back to font metric subdivisions based on <code>lineHeight</code>.
              </Text>
            </Section>

            {/* Section VII: References */}
            <Section>
              <Block keepWithNext>
                <h2
                  style={{
                    margin: '8px 0 6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '2px',
                  }}
                >
                  References
                </h2>
              </Block>

              <div
                style={{
                  fontSize: '9.5px',
                  lineHeight: 1.4,
                  color: '#374151',
                }}
              >
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [1] D. E. Knuth, <em>The TeXbook</em>, Reading, MA: Addison-Wesley, 1984.
                </Block>
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [2] W3C CSS Working Group, &ldquo;CSS Fragmentation Module Level 3,&rdquo; W3C Candidate Recommendation, Nov. 2018.
                </Block>
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [3] C. Lou, &ldquo;Pretext: Fast Headless Text Layout Engine,&rdquo; GitHub Repository, 2024. [Online]. Available: https://github.com/chenglou/pretext
                </Block>
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [4] H. W. Lie and B. Bos, <em>Cascading Style Sheets: Designing for the Web</em>, 3rd ed., Addison-Wesley, 2005.
                </Block>
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [5] W3C CSS Working Group, &ldquo;CSS Paged Media Module Level 3,&rdquo; W3C Working Draft, Mar. 2013.
                </Block>
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [6] M. F. Plass and D. E. Knuth, &ldquo;Breaking paragraphs into lines,&rdquo; <em>Software: Practice and Experience</em>, vol. 11, no. 11, pp. 1119–1184, 1981.
                </Block>
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [7] J. P. Oliveira, &ldquo;React Paper: Declarative Multi-Page Document Layout Engine,&rdquo; 2026.
                </Block>
                <Block breakInside="avoid" style={{ marginBottom: '5px' }}>
                  [8] E. V. Munson and P. F. Sweeney, &ldquo;Flexible document layout with constraints,&rdquo; <em>ACM Transactions on Information Systems</em>, vol. 21, no. 1, pp. 32–58, 2003.
                </Block>
              </div>
            </Section>
          </Column>
        </Columns>

        {/* Footer: Running paper title and Page X of Y */}
        <Footer>
          {({ pageNumber, totalPages }) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '6px',
                marginTop: '10px',
                borderTop: '0.5px solid #cbd5e1',
                fontSize: '8.5px',
                color: '#64748b',
                fontFamily: 'serif',
              }}
            >
              <span>IEEE Transactions on Computational Typography • Rostova et al.</span>
              <span style={{ fontWeight: 600 }}>
                Page {pageNumber} of {totalPages}
              </span>
            </div>
          )}
        </Footer>
      </Document>
    </div>
  );
}
