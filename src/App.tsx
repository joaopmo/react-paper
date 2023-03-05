import './app.css';
import './styles/style.css';
import React from 'react';
import { PageBreaker, Outlet, useOutlet, createStructure } from './basic.';

function Parent({ children }: { children?: React.ReactNode }) {
  const { path, reference } = useOutlet();

  return (
    <div ref={reference}>
      {path}
      {children}
    </div>
  );
}

const structure = [
  [
    {
      element: (
        <div>
          <Parent>
            <Outlet />
          </Parent>
        </div>
      ),
      children: [
        {
          element: (
            <span>
              <Parent />
            </span>
          ),
        },
        {
          element: (
            <span>
              <Parent />
            </span>
          ),
        },
      ],
    },
  ],
];

function App() {
  return (
    <div className="red">
      <PageBreaker structure={createStructure(structure)} />
    </div>
  );
}

export default App;
