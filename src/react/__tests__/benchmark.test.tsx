// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Block, Column, Document } from '../index';

describe('Document re-render performance benchmark', () => {
  function Item({ id, text }: { id: string; text: string }) {
    return (
      <Block id={id} style={{ height: '50px' }}>
        <div>{text}</div>
      </Block>
    );
  }

  const items = Array.from({ length: 100 }, (_, i) => ({
    id: `item-${i}`,
    text: `Item description number ${i}`,
  }));

  it('benchmarks without memoization vs with React.memo / useMemo', () => {
    function UnmemoizedParent({ count }: { count: number }) {
      return (
        <div>
          <div>Parent counter: {count}</div>
          <Document size={{ width: 600, height: 800 }}>
            <Column>
              {items.map((item) => (
                <Item key={item.id} id={item.id} text={item.text} />
              ))}
            </Column>
          </Document>
        </div>
      );
    }

    function MemoizedParent({ count }: { count: number }) {
      const doc = React.useMemo(
        () => (
          <Document size={{ width: 600, height: 800 }}>
            <Column>
              {items.map((item) => (
                <Item key={item.id} id={item.id} text={item.text} />
              ))}
            </Column>
          </Document>
        ),
        [],
      );

      return (
        <div>
          <div>Parent counter: {count}</div>
          {doc}
        </div>
      );
    }

    // Benchmark unmemoized
    const { rerender: rerenderUnmemoized } = render(<UnmemoizedParent count={0} />);
    const t0 = performance.now();
    for (let i = 1; i <= 50; i++) {
      rerenderUnmemoized(<UnmemoizedParent count={i} />);
    }
    const unmemoizedDuration = performance.now() - t0;

    // Benchmark memoized
    const { rerender: rerenderMemoized } = render(<MemoizedParent count={0} />);
    const t1 = performance.now();
    for (let i = 1; i <= 50; i++) {
      rerenderMemoized(<MemoizedParent count={i} />);
    }
    const memoizedDuration = performance.now() - t1;

    console.log(`[BENCHMARK] 50 re-renders WITHOUT memoization: ${unmemoizedDuration.toFixed(2)}ms (avg ${(unmemoizedDuration / 50).toFixed(2)}ms/update)`);
    console.log(`[BENCHMARK] 50 re-renders WITH React memoization: ${memoizedDuration.toFixed(2)}ms (avg ${(memoizedDuration / 50).toFixed(2)}ms/update)`);
    console.log(`[BENCHMARK] Speedup: ${(unmemoizedDuration / memoizedDuration).toFixed(1)}x faster!`);

    expect(memoizedDuration).toBeLessThan(unmemoizedDuration);
  });
});
