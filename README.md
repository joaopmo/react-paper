<p align="center">
  <img src="https://raw.githubusercontent.com/joaopmo/react-paper/main/.github/assets/logo-green.png" alt="React Paper Logo" />
</p>
<p align="center">
  React Paper is a library for allocating React Components into layouts that simulate paper sheets.
</p>


# Installation

You can install the library with one of the following commands:

> npm install @joaopmo/react-paper

> yarn add @joaopmo/react-paper

> pnpm add @joaopmo/react-paper

You probably already have `react` and `react-dom` in your project. But if not, make sure to install them with one of the following:

> npm install react react-dom

> yarn add react react-dom

> pnpm add react react-dom

# Examples

You can check examples on <a href="https://main--64b35eb2b079785924e82a2f.chromatic.com/" target="_blank">Storybook</a>

# Use Cases

React Paper was developed for a resume-builder kind of web app, where it was generally used to generate 1- or 2-page documents. It may have poor performance on larger scales.

# Quick Start

Your app will use at least the `<Paper />`, `<Column />` and `<Root />` components, as well as the `useRegister()` hook and the `css/base` stylesheet. 

All the components related to the React Paper library must be wrapped within a `<Paper />` component to ensure they work as expected. The `<Paper />` component can have one or more `<Column />` components as children. Each `<Column />` can have one or more `<Root />` components as children.

The `<Root />` component requires some React element to be passed as a prop (i.e. `element={<MyComponent />}`). By default, the content generated by the element is considered to be of type 'text', which may suffer a page break. If that is not the case, the value 'block' should be passed to the prop `content` to indicate that the content is not divisible.

The `css/base` stylesheet should be imported to apply the basic styles required by the library. The `css/print` stylesheet may be used to apply printing styles.

```tsx
// App.jsx
import React from 'react';
import { Paper, Column, Root } from '@joaopmo/react-paper';

import {ImageComponent} from './ImageComponent';
import {ImageComponent} from './ImageComponent';

import '@joaopmo/react-paper/css/base';

export function App() {
  return (
    <Paper>
      <Column>
        <Root element={<ImageComponent />} />
        <Root element={<ImageComponent />} content='block' />
      </Column>
    </Paper>
  );
}
```
One of the DOM nodes generated by the React element passed to `<Root />` must be registered into the `useRegister()` hook. You can have many nested nodes, but there are some rules that need to be followed for everything to work as expected:

- If the content is of type 'text', the registered node must have a `line-height` CSS property that corresponds to that of the content.
- The only node with `margin-top`, `margin-bottom`, `border-top`, `border-bottom`, `padding-top` or `padding-bottom` CSS properties should be the one registered.

```tsx
// TextComponent.jsx
import React from 'react';
import { useRegister } from '@joaopmo/react-paper';

const style = {
    lineHeight: 1.4,
    margin: '5px'
};

const text =  `
  Lorem ipsum dolor sit amet, consectetur...
`

export function TextComponent() {
  const { register } = useRegister();
  
  return (
      <div {...register()} style={style}>{text}</div>
  );
}
```

```tsx
// ImageComponent.jsx
import React from 'react';
import { useRegister } from '@joaopmo/react-paper';

export function ImageComponent() {
    const { register } = useRegister();
    
    return (
        <div {...register()}>
            <img src='' />
        </div>
    );
}
```

## Complex Layouts

The rules for registering nodes make it hard to create complex layouts. For that, you can use the `<Level />` and `<Node />` components. The `<Level />` component is used to wrap one or more `<Node />` components. The `<Node />` component is similar to the `<Root />` component, but it can be nested to create more complex layouts. 

The next example shows a slightly more complex layout:

```tsx
// App.jsx
import React from 'react';
import { Paper, Column, Root } from '@joaopmo/react-paper';

import {BaseComponent} from './BaseComponent';

import '@joaopmo/react-paper/css/base';

export function App() {
  return (
    <Paper>
      <Column>
        <Root element={<BaseComponent />} />
      </Column>
    </Paper>
  );
}
```

One of the nodes in the React element passed to `<Root />` needs to be registered, like in the previous examples. But this time, the content consists of three other elements that are passed to `<Node />` components. The first two have content of type 'text' that possibly has distinct font-related CSS properties. The last one is an image with content of type 'block'. They are all separated by 10px by the `row-gap` CSS property, in addition to any spacing that may be created by margin-related CSS properties of the registered nodes.

```tsx
// BaseComponent.jsx
import React from 'react';
import { useRegister } from '@joaopmo/react-paper';

const style = {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '10px'
};

export function BaseComponent() {
  const { register } = useRegister();
  
  return (
      <div {...register()} style={style}>
          <Level>
              <Node element={<Heading />}/>
              <Node element={<Text />}/>
              <Node element={<Image />} content='block' />
          </Level>
      </div>
  );
}
```

In addition to applying `margin`, you can also create space between sibling nodes with the `gap` CSS property. In this case, the nearest registered parent node of the siblings should receive a `display: flex;` CSS property, followed by the desired `gap`. If the siblings are in elements passed to `<Root />`, the `gap` should be applied to the column. Each column generated by React Paper has two CSS classes:
- `.rp-column`: common to every column.
- `rp-column-<idx>`: where \<idx> is the index of the column, starting from 0. (e.g. `rp-column-0`).

# API Documentation
- [\<Paper />](#paper)
- [\<Column />](#column)
- [\<Root />](#root)
- [\<Level />](#level)
- [\<Node />](#node)
- [useRegister()](#useregister)
- [Styles](#styles)

## Paper
The part of your application that uses React-Paper functionality must be nested within a parent `<Paper />` component. 

### Props

```ts
interface PaperProps {
    children: React.ReactNode;
    pageWidth?: number;
    memoize?: boolean;
}
```

- `children`: Accepts `<Column />` components and inserts a new column in each page for every one received.
- `pageWidth`: A number between `0.1` and `1` indicating the percentage of available width that should be taken by the pages. Defaults to `0.6`.
- `memoize`: A boolean indicating if the library should use memoization. If `true` the `rootKey` prop will be required in every `<Root />` component. Defaults to `false`.

## Column

Component used to insert columns in the pages generated by React Paper.

### Props

```ts
interface ColumnProps {
    children: React.ReactNode;
}
```

- `children`: Either a `<Root />` or a `<React.Fragment />` component.

## Root

Used to pass to the library a first-level element from a React tree you want to render inside pages.

If the `height` of the rendered element exceeds the available space on one page, the entire React Element will be duplicated and inserted on the next page. For every subsequent page, the element is shifted upwards by the cumulative `height` that has been allocated on previous pages. The parts of the element overflowing above or below each page are hidden.

Due to the duplication, it may be better for performance to have smaller elements in the `<Root />` components.

### Props

```ts
interface RootProps {
    element: React.ReactNode;
    rootKey?: string;
    content?: 'block' | 'text';
}
```

- `element`: The React Element to render in the position of the given `<Root />` component.
- `content`: Type of the content rendered by the React Element passed to the given `<Root />` component. Defaults to `'text'`.
    - **'text'**: Content of type 'text' means it can suffer page breaks (i.e. be split into multiple pages if necessary). It requires both the registered HTML element and the content to be given a matching `line-height` CSS property.
  - **'block'**: Content of type 'block' means it cannot suffer page breaks (i.e. it must be allocated into a single page). Consequently, the rendered content must have a `height` smaller than the available space on the page.
- `rootKey`: Exclusive id of the given `<Root />` component. Required only if memoization is being used.

## Level
Used to group `<Node />` components.

### Props

```ts
interface LevelProps {
    children: React.ReactNode;
    parallel?: boolean;
}
```

- `children`: Either a `<Node />` or a `<React.Fragment />` component.
- `parallel`: A boolean indicating if the React Elements passed to the `<Node />` children are rendered vertically or horizontally with respect to one another. By default, React-Paper assumes that every element is rendered in sequence from top to bottom. If styled in such a way that they are rendered from left to right, then you can set this prop to `true`. React-Paper will not render the elements horizontally; you have to do this with your own styles. All the library will do is overwrite every `<Node />` to have `content` of type `'text'` and allocate space, taking the largest element into account. Defaults to `false`.

## Node

It can be used recursively in combination with `<Level />` components to create more complex layouts.

### Props

```ts
interface NodeProps {
    element: React.ReactNode;
    content?: 'block' | 'text';
}
```

- `element`: The React Element to render in the position of the given `<Node />` component.
- `content`: Type of the content rendered by the React Element passed to the given `<Node />` component. Defaults to `'text'`.
  - **'text'**: Content of type 'text' means it can suffer page breaks (i.e. be split into multiple pages if necessary). It requires both the registered HTML element and the content to be given a matching `line-height` CSS property.
  - **'block'**: Content of type 'block' means it cannot suffer page breaks (i.e. it must be allocated into a single page). Consequently, the rendered content must have a `height` smaller than the available space on the page.

## useRegister

```ts
// Acessing the useRegister hook
const useRegisterResult = useRegister();
```

```ts
// Signature
interface useRegisterResult {
    register: (display?: boolean) => Register;
}

interface Register {
    ref: React.MutableRefObject<null> | null;
    'data-rp-id': string;
    'data-rp-display': string;
}
```
- `register`: A function that defines how the element to be registered will be rendered based on the provided argument. It returns an object with the React Reference to register the element and HTML data-attributes used internally by the library.
  - Parameters:
    - `display`: A boolean indicating if the element being registered should be rendered. Defaults to `true`.
  - Returns: An object containing:
    - ref: React ref
    - data-rp-id: HTML data attribute used to give the element an id used internally.
    - data-rp-display: HTML data attribute used to hide the element based on the `display` argument.
  

## Styles