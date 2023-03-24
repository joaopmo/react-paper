import './styles/style.css';
import React from 'react';
import { PageBreaker, Outlet, useOutlet, createStructure } from './basic.';
import { loremIpsum } from 'lorem-ipsum';

const COUNT = 500;

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function Child({ children }: { children?: React.ReactNode }) {
  const { path, reference } = useOutlet();

  // if (typeof React.Children.toArray(children)[0] === 'string') {
  //   console.log(path);
  //   console.log(React.Children.toArray(children)[0]);
  // }

  return (
    <div
      ref={reference}
      data-test={path}
      style={{
        marginTop: 9,
        marginBottom: 4,
        paddingTop: 2,
        paddingBottom: 11,
        borderTop: '3px solid red',
        borderBottom: '6px solid green',
      }}
    >
      {typeof children === 'string' && <b>{path}</b>}
      {children}
    </div>
  );
}

const structure = [
  [
    {
      element: (
        <Child>
          <Outlet />
        </Child>
      ),
      children: [
        {
          element: (
            <Child>
              <Outlet />
            </Child>
          ),
          children: [
            {
              element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
            },
            {
              element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
            },
          ],
        },
        {
          element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
        },
      ],
    },
    {
      element: (
        <Child>
          <Outlet />
        </Child>
      ),
      children: [
        {
          element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
        },
        {
          element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
        },
      ],
    },
  ],
  [
    {
      element: (
        <Child>
          <Outlet />
        </Child>
      ),
      children: [
        {
          element: (
            <Child>
              <Outlet />
            </Child>
          ),
          children: [
            {
              element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
            },
            {
              element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
            },
          ],
        },
        {
          element: <Child>{loremIpsum({ count: COUNT, units: 'sentences' })}</Child>,
        },
      ],
    },
  ],
];

function App() {
  return (
    <div className="app">
      {/* <h1>Hello CSS-Tricks friend</h1>
      <h2>Hello CSS-Tricks friend</h2> */}
      <PageBreaker structure={createStructure(structure)} />
    </div>
  );
}

export default App;
