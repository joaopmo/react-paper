import React from 'react';
import {
  Block,
  Column,
  Columns,
  Document,
  Footer,
  Header,
  KeepTogether,
  PageOverlay,
  PageUnderlay,
  Section,
  Text,
  useFragment,
  usePageInfo,
  usePaperPrint,
} from '../index';

export interface CreativePortfolioExampleProps {
  pageWidth?: number;
  showPrintToolbar?: boolean;
}

/**
 * Status indicator badge demonstrating usePageInfo() within inner column components.
 */
export function DocumentPageBadge() {
  const { pageNumber, totalPages } = usePageInfo();
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 600,
        color: '#64748b',
        background: '#f1f5f9',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
      }}
    >
      <span>DOC SHEET {pageNumber} OF {totalPages}</span>
    </div>
  );
}

// ============================================================================
// Data Types & Content Definitions
// ============================================================================

interface SkillCategory {
  category: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  skills: string[];
}

interface CaseStudy {
  id: string;
  title: string;
  role: string;
  period: string;
  client: string;
  tagline: string;
  summary: string;
  metrics: Array<{ label: string; value: string }>;
  technologies: string[];
  bulletPoints: string[];
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  relation: string;
}

interface Honor {
  year: string;
  title: string;
  issuer: string;
  note: string;
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: 'Design Systems & UI Architecture',
    badgeBg: '#e0e7ff',
    badgeColor: '#3730a3',
    badgeBorder: '#c7d2fe',
    skills: [
      'Token Architecture',
      'Headless Component Primitives',
      'WCAG 2.2 AAA Accessibility',
      'Multi-Brand Theming',
      'Atomic Layout Systems',
      'Figma-to-Code Pipelines',
    ],
  },
  {
    category: 'Creative Coding & Graphics',
    badgeBg: '#f3e8ff',
    badgeColor: '#6b21a8',
    badgeBorder: '#e9d5ff',
    skills: [
      'WebGL 2.0 & GLSL',
      'Three.js / React Three Fiber',
      'Canvas 2D Virtualization',
      'Algorithmic Typography',
      'GSAP / Spring Physics',
      'SVG Path Morphing',
    ],
  },
  {
    category: 'Frontend Engineering & Perf',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    badgeBorder: '#bae6fd',
    skills: [
      'TypeScript 5.x',
      'React 19 & Compiler',
      'CSS Fragmentation L3',
      'Sub-pixel DOM Geometry',
      'Web Workers & OffscreenCanvas',
      'Wasm / Rust Bindings',
    ],
  },
  {
    category: 'Infrastructure & Tooling',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
    badgeBorder: '#bbf7d0',
    skills: [
      'Vite & Rollup Plugins',
      'Playwright Visual Testing',
      'CI/CD Performance Budgets',
      'Zero-Runtime CSS Engines',
      'Turborepo Architecture',
    ],
  },
];

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-chromaflow',
    title: 'ChromaFlow — Universal Multi-Brand Design System',
    role: 'Principal Design Technologist & Lead Architect',
    period: '2024 — 2026',
    client: 'Starlight Global Media',
    tagline: 'Unifying 48 enterprise consumer brands under a single zero-runtime CSS token engine.',
    summary:
      'Architected a next-generation design system serving 48 global media brands. Replaced fragmented style libraries with an algorithmic token pipeline and headless accessibility primitives, guaranteeing instantaneous theme switching with zero runtime style recalculation overhead.',
    metrics: [
      { label: 'Brand Properties', value: '48 Brands' },
      { label: 'Bundle Reduction', value: '-64% CSS' },
      { label: 'Accessibility', value: '100% WCAG AAA' },
      { label: 'Adoption Rate', value: '98% Teams' },
    ],
    technologies: ['React 19', 'TypeScript', 'StyleX', 'Figma Tokens API', 'Playwright', 'Turborepo'],
    bulletPoints: [
      'Designed an automated Design Token graph converting Figma semantic variables into type-safe CSS custom properties with compile-time fallbacks.',
      'Constructed 75+ accessible headless primitives (comboboxes, virtual trees, date-range pickers) with 100% automated keyboard and screen-reader test suites.',
      'Eliminated 3.8MB of redundant CSS across 12 product lines, boosting Google Core Web Vitals (LCP) from 3.4s to 0.8s on 3G cellular networks.',
      'Developed custom AST lint rules prohibiting un-tokenized style declarations, reducing design drift across 240+ contributing developers.',
    ],
  },
  {
    id: 'cs-strata',
    title: 'Strata — Headless Arithmetic Document Pagination Engine',
    role: 'Creator & Lead Systems Architect',
    period: '2023 — 2024',
    client: 'Open Source Community',
    tagline: 'High-speed multi-page document pagination separating batch DOM measurements from pure arithmetic solvers.',
    summary:
      'Engineered an open-source document layout engine capable of paginating complex 100+ page reports in under 10ms. Eliminated historical viewport-clipping tree duplications by introducing fine-grained line-box range slicing and targeted per-page element mounting.',
    metrics: [
      { label: 'Pagination Speed', value: '<6ms / 50 Pgs' },
      { label: 'DOM Overhead', value: '0 Duplication' },
      { label: 'Re-render Boost', value: '820x Faster' },
      { label: 'Bundle Footprint', value: '7.8 kB Gzip' },
    ],
    technologies: ['TypeScript', 'CSS Fragmentation Level 3', 'Range API', 'Vitest', 'Vite'],
    bulletPoints: [
      'Invented a two-phase layout architecture: Phase 1 captures DOM geometry via single-pass Range.getClientRects(); Phase 2 runs pure arithmetic page allocation.',
      'Implemented CSS Fragmentation Level 3 constraints: keepWithNext heading attachment, orphans/widows line control, and container fragmentation metadata.',
      'Delivered first-class useFragment() context exposing fragmentPosition (start/middle/end) and continuation badges for uninterrupted timeline rails.',
      'Achieved zero ascender/descender clipping during line splits by calculating exact inter-line leading midpoints across variable typographic scales.',
    ],
  },
  {
    id: 'cs-aura',
    title: 'Aura 3D — WebGL Generative Product Visualizer',
    role: 'Creative Technologist & 3D Interaction Director',
    period: '2022 — 2023',
    client: 'Hyperion Luxury Timepieces',
    tagline: 'Photorealistic real-time 3D configuration on mobile browsers with bespoke PBR shaders.',
    summary:
      'Spearheaded the creative design and 3D web engineering for a luxury horology configurator. Blended micro-faceted physical shaders, dynamic HDRI environment lighting, and fluid gesture choreography into a mobile-first 60 FPS WebGL experience.',
    metrics: [
      { label: 'Framerate', value: '60 FPS Mobile' },
      { label: 'Initial Asset Load', value: '1.2s on 4G' },
      { label: 'Sales Conversion', value: '+54% YoY' },
      { label: 'Customer Engagement', value: '4.8 min Avg' },
    ],
    technologies: ['WebGL 2.0', 'Three.js', 'GLSL Shaders', 'Draco Mesh Compression', 'Web Workers'],
    bulletPoints: [
      'Authored custom anisotropic brushed-metal and anti-reflective sapphire crystal shaders with physical Fresnel refraction approximations.',
      'Streamed compressed 3D assets via dedicated Web Workers using Draco geometric quantization, reducing initial bundle transfer size by 82%.',
      'Engineered an accessible high-contrast 2D fallback mode with vector orthographic cross-sections, guaranteeing full screen-reader compliance.',
      'Integrated real-time ray-marched depth shadows calculated on offscreen framebuffers without dropping below the 16.6ms frame budget.',
    ],
  },
  {
    id: 'cs-quantum',
    title: 'Quantum Grid — Real-Time High-Frequency Trading Interface',
    role: 'Staff Frontend Engineer & Interaction Lead',
    period: '2021 — 2022',
    client: 'Aegis Capital Markets',
    tagline: 'Sub-millisecond data grid rendering 60,000 live price ticks per second without UI stutter.',
    summary:
      'Architected the flagship equities and derivatives desktop-grade web terminal. Solved React DOM thrashing during market opening volatility by bypassing conventional virtual DOM reconciliations in favor of canvas-backed dual-buffered rendering.',
    metrics: [
      { label: 'Throughput', value: '60k Ticks/Sec' },
      { label: 'Input Latency', value: '<2ms Glass-to-Glass' },
      { label: 'CPU Utilization', value: '<4% Peak' },
      { label: 'Daily Trading Vol', value: '$8.4B Processed' },
    ],
    technologies: ['TypeScript', 'Canvas 2D', 'WebSockets', 'SharedArrayBuffer', 'WebAssembly (Rust)'],
    bulletPoints: [
      'Built a hybrid DOM/Canvas rendering grid with spatial index partitioning, limiting redraw passes to only visible and updated price cells.',
      'Implemented binary WebSocket streaming with Rust-compiled WebAssembly decoders, circumventing JSON serialization and V8 GC pauses.',
      'Designed ergonomic tabular typography with tabular figures, visual delta flash micro-animations, and multi-tier colorblind paletting.',
      'Established zero-latency hotkey navigation system with predictive focus caching and customizable layout workspaces.',
    ],
  },
  {
    id: 'cs-zenith',
    title: 'Zenith Studio — Collaborative Vector & Motion Suite',
    role: 'Senior Design Engineer',
    period: '2019 — 2021',
    client: 'Zenith Creative Labs',
    tagline: 'Browser-based vector illustration and skeletal animation tool with CRDT real-time sync.',
    summary:
      'Engineered the vector editing canvas and timeline animation engine for a collaborative web design platform. Conceived mathematical Bézier curve manipulation algorithms and buttery 120 FPS timeline scrubbing for animated vector assets.',
    metrics: [
      { label: 'Scrubbing Perf', value: '120 FPS Retina' },
      { label: 'Concurrent Users', value: '50 / Document' },
      { label: 'Rendering Latency', value: 'Sub-frame 8ms' },
      { label: 'App Store Rating', value: '4.9 / 5 Stars' },
    ],
    technologies: ['TypeScript', 'Paper.js / Custom Math', 'CRDTs (Yjs)', 'Web Audio API', 'IndexedDB'],
    bulletPoints: [
      'Developed high-precision cubic Bézier boolean operations (union, intersection, difference) running smoothly in client-side worker threads.',
      'Implemented conflict-free replicated data types (CRDTs) over peer-to-peer WebRTC mesh for millisecond-speed multiplayer collaboration.',
      'Devised an interactive spring-physics keyframe curve editor with instant visual tangent feedback and audio scrub cues.',
    ],
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    quote:
      'Sora operates at the rare intersection where visual elegance and uncompromising systems engineering meet. Her work on ChromaFlow redefined how 48 brands ship interfaces, completely eliminating the friction between design vision and production reality.',
    author: 'Devon Sterling',
    role: 'VP of Product Design',
    company: 'Starlight Global Media',
    relation: 'Managed Sora directly on ChromaFlow System',
  },
  {
    id: 'test-2',
    quote:
      'The pagination and layout primitives Sora built unlocked multi-page document export capabilities we thought were impossible in a browser. Her mathematical rigor, attention to typographic sub-pixels, and zero-compromise approach to performance are extraordinary.',
    author: 'Dr. Alistair Vance',
    role: 'Chief Technology Officer',
    company: 'Aegis Capital Markets',
    relation: 'Executive Sponsor for High-Frequency Systems',
  },
  {
    id: 'test-3',
    quote:
      'In over fifteen years of directing creative technology teams, I have rarely met an engineer who understands color science, WebGL shaders, and typography as deeply as she understands distributed systems and browser rendering pipelines.',
    author: 'Genevieve Chen',
    role: 'Executive Creative Director',
    company: 'Hyperion Horology',
    relation: 'Collaborated on Aura 3D Visualizer',
  },
];

const HONORS: Honor[] = [
  {
    year: '2025',
    title: 'Awwwards Site of the Year Nominee',
    issuer: 'International Jury of Digital Designers & Developers',
    note: 'Recognized for pioneering WebGL micro-shader physical simulations.',
  },
  {
    year: '2024',
    title: 'Tokyo TDC Annual Book Selection',
    issuer: 'Tokyo Type Directors Club',
    note: 'Awarded for Algorithmic Variable Typography on high-density displays.',
  },
  {
    year: '2023',
    title: 'CSS Design Awards — Best UI / UX / Innovation',
    issuer: 'CSSDA International Board',
    note: 'Special distinction for accessible generative audio-visual interfaces.',
  },
  {
    year: '2022',
    title: 'Red Dot Design Award: Best of the Best',
    issuer: 'Design Zentrum Nordrhein Westfalen',
    note: 'Selected for Zenith Studio collaborative vector animation workspace.',
  },
];

// ============================================================================
// Custom Components Using React Paper Hooks
// ============================================================================

/**
 * Custom container component that splits cleanly across pages, rendering a styled
 * continuous timeline rail with connecting nodes and 'Continued' badges on subsequent pages.
 */
function ProjectTimelineRail({ children }: { children?: React.ReactNode }) {
  const { isContinuation, position, index, count } = useFragment();

  return (
    <div
      className="project-timeline-rail"
      data-rp-fragment={position}
      style={{
        position: 'relative',
        borderLeft: '2px solid #3b82f6',
        paddingLeft: '18px',
        marginLeft: '6px',
        marginTop: isContinuation ? '4px' : '0',
      }}
    >
      {isContinuation && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            marginBottom: '14px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.08)',
          }}
        >
          <span style={{ fontSize: '13px' }}>↳</span>
          <span>
            Project Showcase (Continued &bull; Segment {index + 1} of {count})
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Optional print button rendered outside the printed paper document.
 */
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
        marginBottom: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <button
        type="button"
        onClick={print}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '8px',
          border: '1px solid #334155',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
          transition: 'all 0.15s ease-in-out',
        }}
      >
        <span style={{ fontSize: '15px' }}>🖨️</span>
        <span>Print Portfolio / Save as PDF</span>
      </button>
      <span style={{ fontSize: '12px', color: '#64748b' }}>
        A4 Portrait &bull; Multi-Page Continuous Layout
      </span>
    </div>
  );
}

// ============================================================================
// Main Document Layout Component
// ============================================================================

export function CreativePortfolioExample({
  pageWidth = 0.8,
  showPrintToolbar = false,
}: CreativePortfolioExampleProps) {
  return (
    <Document
      size="A4"
      orientation="portrait"
      padding="16mm"
      pageWidth={pageWidth}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1e293b',
      }}
    >
      {showPrintToolbar && <PrintToolbar />}

      {/* -------------------------------------------------------------------- */}
      {/* 1. Full-Bleed Sidebar Underlay: Persists Seamlessly on ALL Pages     */}
      {/* -------------------------------------------------------------------- */}
      <PageUnderlay>
        {({ pageNumber, totalPages }) => (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              // Seamlessly extends from the left page edge to the middle of the column gap
              width: 'calc(16mm + (100% - 32mm - 24px) * 0.32 + 12px)',
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRight: '1px solid #cbd5e1',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Subtle radial geometric accents */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                left: '-50px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(255,255,255,0) 70%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '100px',
                right: '-40px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, rgba(255,255,255,0) 70%)',
              }}
            />
            {/* Elegant vertical colored edge spine */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '3px',
                background:
                  'linear-gradient(180deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
              }}
            />
          </div>
        )}
      </PageUnderlay>

      {/* PageOverlay: Running Corner Watermark / Document Indicator */}
      <PageOverlay>
        {({ pageNumber, totalPages }) => (
          <div
            style={{
              position: 'absolute',
              top: '6mm',
              right: '16mm',
              fontSize: '8.5px',
              color: 'rgba(148, 163, 184, 0.45)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              pointerEvents: 'none',
            }}
          >
            CONFIDENTIAL &bull; SORA TAKAHASHI PORTFOLIO &bull; SHEET {pageNumber}/{totalPages}
          </div>
        )}
      </PageOverlay>

      {/* -------------------------------------------------------------------- */}
      {/* 2. First-Page Personalized Header Banner                             */}
      {/* -------------------------------------------------------------------- */}
      <Header mode="first">
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '18px 24px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            border: '1px solid #334155',
            overflow: 'hidden',
          }}
        >
          {/* Decorative geometric background mesh */}
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(15,23,42,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '28px',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: '#ffffff',
                    lineHeight: 1.15,
                  }}
                >
                  Sora Takahashi
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                  }}
                >
                  <span style={{ fontSize: '8px' }}>●</span> AVAILABLE FOR SELECT ADVISORY
                </span>
              </div>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#93c5fd',
                  letterSpacing: '-0.01em',
                }}
              >
                Lead Design Technologist &bull; Creative Systems Architect &bull; W3C Invited Expert
              </p>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  color: '#cbd5e1',
                  maxWidth: '560px',
                }}
              >
                Bridging the chasm between generative aesthetics, design engineering, and bulletproof
                web architecture. 12+ years pioneering design token infrastructure, sub-pixel layout
                engines, and real-time GPU graphics.
              </p>
            </div>

            <div
              style={{
                textAlign: 'right',
                fontSize: '11.5px',
                color: '#94a3b8',
                lineHeight: 1.6,
                flexShrink: 0,
                paddingLeft: '16px',
              }}
            >
              <div>
                <strong style={{ color: '#f8fafc' }}>Tokyo &bull; San Francisco</strong>
              </div>
              <div style={{ color: '#38bdf8' }}>sora@takahashi.design</div>
              <div>github.com/soratakahashi</div>
              <div>takahashi.design/portfolio</div>
            </div>
          </div>

          {/* Quick highlight metric pills */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {[
              '12+ Years Experience',
              '48 Brand Design Systems',
              '3 W3C Specs Contributed',
              'Red Dot & Awwwards Juror',
              '820x Pagination Speedup',
            ].map((pill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </Header>

      {/* -------------------------------------------------------------------- */}
      {/* 3. Asymmetric 2-Column Layout (32% Left Sidebar, 68% Main Content)    */}
      {/* -------------------------------------------------------------------- */}
      <Columns widths={['32%', '68%']} gap="24px">
        {/* ================================================================== */}
        {/* LEFT COLUMN: Sidebar Content                                       */}
        {/* ================================================================== */}
        <Column gap="18px">
          {/* Sidebar Block 1: Profile Monogram & Bio */}
          <Block breakInside="avoid">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '17px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                }}
              >
                ST
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.2,
                  }}
                >
                  Sora Takahashi
                </h3>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  Creative Systems Lead
                </span>
                <div style={{ marginTop: '4px' }}>
                  <DocumentPageBadge />
                </div>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: 1.55,
                color: '#334155',
              }}
            >
              Passionate about turning mathematical clarity into kinetic interfaces. Specializing in
              high-performance web layout engines, cross-brand design token architectures, and WebGL
              creative tools.
            </p>
          </Block>

          {/* Sidebar Block 2: Contact & Coordinates */}
          <Block breakInside="avoid">
            <h4
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0f172a',
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: '4px',
              }}
            >
              Contact &amp; Coordinates
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px',
                color: '#334155',
              }}
            >
              <div>
                <strong style={{ color: '#0f172a' }}>Email:</strong> sora@takahashi.design
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>Location:</strong> Tokyo, JP &amp; SF, CA
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>Portfolio:</strong> takahashi.design
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>GitHub:</strong> github.com/soratakahashi
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>PGP Fingerprint:</strong> 9D4B 2F01 8E3C
              </div>
            </div>
          </Block>

          {/* Sidebar Block 3: Categorized Core Skills in Tags/Pills */}
          <Block breakInside="avoid">
            <h4
              style={{
                margin: '0 0 10px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0f172a',
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: '4px',
              }}
            >
              Core Competencies
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SKILL_CATEGORIES.map((cat, idx) => (
                <div key={idx}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      marginBottom: '5px',
                    }}
                  >
                    {cat.category}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 500,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: cat.badgeBg,
                          color: cat.badgeColor,
                          border: `1px solid ${cat.badgeBorder}`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* Sidebar Block 4: Design & Engineering Philosophy */}
          <Block breakInside="avoid">
            <h4
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0f172a',
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: '4px',
              }}
            >
              Design Philosophy
            </h4>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '11.5px',
                lineHeight: 1.5,
                color: '#334155',
                fontStyle: 'italic',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              &ldquo;Software that respects human visual perception must combine mathematical
              invariance with kinetic grace. Performance is not an optimization pass; it is the
              primary aesthetic dimension.&rdquo;
            </div>
          </Block>

          {/* Sidebar Block 5: Professional Certifications */}
          <Block breakInside="avoid">
            <h4
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0f172a',
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: '4px',
              }}
            >
              Certifications &amp; Accreditations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#1e293b' }}>
                <strong style={{ color: '#0f172a' }}>UX Master Certified (NN/g)</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Nielsen Norman Group &bull; ID #UX-90412
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#1e293b' }}>
                <strong style={{ color: '#0f172a' }}>Certified Web Accessibility Specialist</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  IAAP (WAS &amp; CPACC) &bull; WCAG 2.2 AAA
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#1e293b' }}>
                <strong style={{ color: '#0f172a' }}>AWS Solutions Architect — Associate</strong>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Amazon Web Services &bull; Cloud Systems
                </div>
              </div>
            </div>
          </Block>

          {/* Sidebar Block 6: Languages & Fluency */}
          <Block breakInside="avoid">
            <h4
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0f172a',
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: '4px',
              }}
            >
              Languages &amp; Fluency
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: '#0f172a' }}>Japanese</strong>
                <span style={{ color: '#64748b', fontSize: '11px' }}>Native Fluency</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: '#0f172a' }}>English</strong>
                <span style={{ color: '#64748b', fontSize: '11px' }}>Bilingual / C2 Professional</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: '#0f172a' }}>German</strong>
                <span style={{ color: '#64748b', fontSize: '11px' }}>Working Proficiency (B1)</span>
              </div>
            </div>
          </Block>

          {/* Sidebar Block 7: Academic Background */}
          <Block breakInside="avoid">
            <h4
              style={{
                margin: '0 0 8px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0f172a',
                borderBottom: '1px solid #cbd5e1',
                paddingBottom: '4px',
              }}
            >
              Academic Background
            </h4>
            <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.45 }}>
              <strong style={{ color: '#0f172a' }}>B.S. in Computer Science &amp; Media Arts</strong>
              <div style={{ color: '#475569' }}>Keio University &bull; Faculty of Environment &amp; Info</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Summa Cum Laude &bull; 2012 — 2016</div>
            </div>
          </Block>
        </Column>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: Main Portfolio Showcase                              */}
        {/* ================================================================== */}
        <Column gap="20px">
          {/* Main Section 1: Executive Overview & Architectural Foundation */}
          <Section>
            <Block keepWithNext>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '2px solid #0f172a',
                  paddingBottom: '6px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: '#2563eb',
                  }}
                />
                <h2
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#0f172a',
                  }}
                >
                  Executive Overview &amp; Practice Focus
                </h2>
              </div>
            </Block>

            <Text
              orphans={2}
              widows={2}
              style={{
                margin: '0 0 12px',
                fontSize: '12.5px',
                lineHeight: 1.6,
                color: '#334155',
              }}
            >
              Operating at the convergence of digital craftsmanship and distributed browser systems. Over
              the past decade, I have directed design systems, WebGL creative engineering, and automated
              typesetting engines for global media enterprises and high-frequency trading firms. My work
              anchors visual ambition to deterministic performance budgets, sub-pixel precision, and
              universal accessibility standards.
            </Text>

            {/* High-Level Impact Metric Grid */}
            <Block
              breakInside="avoid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              {[
                { number: '48', label: 'Enterprise Brands Unified' },
                { number: '<6ms', label: '50-Page Pagination Latency' },
                { number: '60k', label: 'Live Ticks / Sec Processed' },
                { number: '100%', label: 'WCAG 2.2 AAA Compliance' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#2563eb',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    {stat.number}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#64748b',
                      marginTop: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </Block>
          </Section>

          {/* Main Section 2: Project Showcase with Continuation Timeline */}
          <Section
            continuationHeader={
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>↳</span>
                <span>Featured Case Studies (Continued from previous page)</span>
              </div>
            }
          >
            <Block keepWithNext>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid #0f172a',
                  paddingBottom: '6px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      background: '#3b82f6',
                    }}
                  />
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#0f172a',
                    }}
                  >
                    Featured Case Studies &amp; Systems
                  </h2>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                  2019 — 2026
                </span>
              </div>
            </Block>

            {/* Split Timeline Rail Container */}
            <Section as={ProjectTimelineRail}>
              {CASE_STUDIES.map((project) => (
                <Block
                  key={project.id}
                  breakInside="avoid"
                  style={{
                    position: 'relative',
                    marginBottom: '18px',
                    padding: '14px 16px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  {/* Timeline Node Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '18px',
                      left: '-26px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '3px solid #3b82f6',
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                    }}
                  />

                  {/* Card Header: Title & Meta */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        {project.title}
                      </h3>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#2563eb',
                          fontWeight: 600,
                          marginTop: '2px',
                        }}
                      >
                        {project.role} &bull; <span style={{ color: '#64748b' }}>{project.client}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.period}
                    </span>
                  </div>

                  {/* Tagline / Subtitle */}
                  <p
                    style={{
                      margin: '4px 0 8px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#475569',
                      fontStyle: 'italic',
                    }}
                  >
                    {project.tagline}
                  </p>

                  {/* Summary Paragraph */}
                  <Text
                    orphans={2}
                    widows={2}
                    style={{
                      margin: '0 0 10px',
                      fontSize: '12px',
                      lineHeight: 1.55,
                      color: '#334155',
                    }}
                  >
                    {project.summary}
                  </Text>

                  {/* Key Metrics Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${project.metrics.length}, 1fr)`,
                      gap: '8px',
                      marginBottom: '10px',
                      padding: '8px 10px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    {project.metrics.map((m, mIdx) => (
                      <div key={mIdx}>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color: '#0f172a',
                            lineHeight: 1.1,
                          }}
                        >
                          {m.value}
                        </div>
                        <div
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 600,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            marginTop: '2px',
                          }}
                        >
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Engineering Highlights Bullet Points */}
                  <ul
                    style={{
                      margin: '0 0 10px',
                      paddingLeft: '16px',
                      fontSize: '11.5px',
                      lineHeight: 1.5,
                      color: '#475569',
                    }}
                  >
                    {project.bulletPoints.map((bullet, bIdx) => (
                      <li key={bIdx} style={{ marginBottom: '3px' }}>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Technologies Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {project.technologies.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Block>
              ))}
            </Section>
          </Section>

          {/* Main Section 3: Executive Testimonials & Quote Callout Cards */}
          <Section>
            <Block keepWithNext>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '2px solid #0f172a',
                  paddingBottom: '6px',
                  marginBottom: '14px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: '#8b5cf6',
                  }}
                />
                <h2
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#0f172a',
                  }}
                >
                  Executive Endorsements &amp; Peer Testimonials
                </h2>
              </div>
            </Block>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {TESTIMONIALS.map((t) => (
                <Block
                  key={t.id}
                  breakInside="avoid"
                  style={{
                    position: 'relative',
                    background: 'linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%)',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #6366f1',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '12px',
                      lineHeight: 1.6,
                      color: '#1e293b',
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      borderTop: '1px dashed #e2e8f0',
                      paddingTop: '8px',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>
                        {t.author}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {' '}
                        &mdash; {t.role}, <strong>{t.company}</strong>
                      </span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{t.relation}</span>
                  </div>
                </Block>
              ))}
            </div>
          </Section>

          {/* Main Section 4: Industry Honors & Creative Distinctions */}
          <Section>
            <Block keepWithNext>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '2px solid #0f172a',
                  paddingBottom: '6px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    background: '#10b981',
                  }}
                />
                <h2
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#0f172a',
                  }}
                >
                  Industry Honors &amp; Creative Distinctions
                </h2>
              </div>
            </Block>

            <KeepTogether
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
              }}
            >
              {HONORS.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <strong style={{ fontSize: '12px', color: '#0f172a' }}>{h.title}</strong>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#2563eb',
                        backgroundColor: '#eff6ff',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {h.year}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    {h.issuer}
                  </div>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '11px',
                      lineHeight: 1.45,
                      color: '#64748b',
                    }}
                  >
                    {h.note}
                  </p>
                </div>
              ))}
            </KeepTogether>
          </Section>
        </Column>
      </Columns>

      {/* -------------------------------------------------------------------- */}
      {/* 4. Running Footer with Page Numbers & Copyright                      */}
      {/* -------------------------------------------------------------------- */}
      <Footer>
        {({ pageNumber, totalPages }) => (
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#64748b',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} Sora Takahashi &bull; Creative Systems &amp;
              Frontend Architecture Portfolio
            </div>
            <div
              style={{
                fontWeight: 600,
                color: '#1e293b',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
              }}
            >
              Page {pageNumber} of {totalPages}
            </div>
          </div>
        )}
      </Footer>
    </Document>
  );
}

export default CreativePortfolioExample;
