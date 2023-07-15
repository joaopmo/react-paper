import React from 'react';

interface CounterContextObject {
  counter: number;
}

const CounterContext = React.createContext<CounterContextObject>({
  counter: 0,
});

export function useCounter(): CounterContextObject {
  return React.useContext(CounterContext);
}

interface CounterLayoutProps {
  children: React.ReactNode;
}

export function CounterLayout({ children }: CounterLayoutProps) {
  const [counter, setCounter] = React.useState(0);

  function increase() {
    setCounter((counter) => {
      return counter + 1;
    });
  }

  return (
    <CounterContext.Provider value={{ counter }}>
      <div style={{ display: 'flex', flexDirection: 'column', rowGap: '2rem' }}>
        <div>
          <button onClick={increase}>increase</button>
        </div>
        <div>{children}</div>
      </div>
    </CounterContext.Provider>
  );
}
