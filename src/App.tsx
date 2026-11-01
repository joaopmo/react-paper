import React from 'react';
import { DEFAULT_EXAMPLE_ID, EXAMPLES } from './examples/registry';
import './styles/base.css';
import './styles/print.css';

export default function App(): React.ReactElement {
  const [selectedId, setSelectedId] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fixture = params.get('fixture') || params.get('example');
      if (fixture && EXAMPLES[fixture]) {
        return fixture;
      }
    }
    return DEFAULT_EXAMPLE_ID;
  });

  const isStandalone = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('standalone') === 'true' ||
    Boolean(new URLSearchParams(window.location.search).get('fixture'))
  );

  const currentExample = EXAMPLES[selectedId] || EXAMPLES[DEFAULT_EXAMPLE_ID];
  const Component = currentExample.component;

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('example', id);
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {!isStandalone && (
        <header
          className="rp-no-print"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontFamily: '"Inter", -apple-system, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <strong style={{ fontSize: '16px', letterSpacing: '-0.01em' }}>
              @joaopmo/react-paper
            </strong>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Fixture Gallery &amp; Playground
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="example-select" style={{ fontSize: '13px', color: '#cbd5e1' }}>
              Example:
            </label>
            <select
              id="example-select"
              value={selectedId}
              onChange={handleSelect}
              style={{
                background: '#1e293b',
                color: '#ffffff',
                border: '1px solid #475569',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {Object.values(EXAMPLES).map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>
        </header>
      )}

      <main style={{ padding: isStandalone ? '0' : '24px' }}>
        <Component {...currentExample.defaultProps} />
      </main>
    </div>
  );
}
