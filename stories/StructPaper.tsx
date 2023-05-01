import React from 'react';
import '../src/styles/base.css';

import { Paper, Column, Field, useReference, Outlet } from '../src';
import { loremIpsum } from 'lorem-ipsum';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

type Ref = ((arg: Element | null) => void) | null;

interface WrapperProps {
  children: (arg: Ref) => JSX.Element;
}
const Wrapper = ({ children }: WrapperProps): JSX.Element => {
  const ref = useReference();

  return children(ref);
};

const TEXT_COUNT = 20;

const images = [
  'https://images4.alphacoders.com/973/973967.jpg',
  'https://images4.alphacoders.com/993/993395.jpg',
  'https://images.alphacoders.com/919/919248.jpg',
  'https://images4.alphacoders.com/920/920077.jpg',
  'https://images.alphacoders.com/172/172203.jpg',
];

// const style = {
//   marginTop: `${getRandomInt(10)}px`,
//   marginBottom: `${getRandomInt(10)}px`,
//   paddingTop: `${getRandomInt(10)}px`,
//   paddingBottom: `${getRandomInt(10)}px`,
//   borderTop: '7px solid red',
//   borderBottom: '7px solid green',
// };

const style = {
  marginTop: `19px`,
  marginBottom: `9px`,
  paddingTop: `13px`,
  paddingBottom: `5px`,
  borderTop: '7px solid red',
  borderBottom: '7px solid pink',
  outline: 'blue solid',
};

const text1 = loremIpsum({ count: TEXT_COUNT, units: 'paragraphs' });
const text2 = loremIpsum({ count: TEXT_COUNT, units: 'paragraphs' });

export const StructPaper = () => {
  return (
    <Paper pageWidth={0.7}>
      <Column>
        <Field
          element={
            <Wrapper>
              {(ref) => (
                <img src={images[0]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
              )}
            </Wrapper>
          }
          content="block"
        />
        <Field
          element={
            <Wrapper>
              {(ref) => (
                <div ref={ref} style={{ ...style }}>
                  <Outlet />
                </div>
              )}
            </Wrapper>
          }
        >
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <img src={images[2]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
                )}
              </Wrapper>
            }
            content="block"
          />
          <Field element={<Wrapper>{(ref) => <div ref={ref}>{text1}</div>}</Wrapper>} />
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <img src={images[0]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
                )}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <img src={images[1]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
                )}
              </Wrapper>
            }
            content="block"
          />
        </Field>
        <Field
          element={
            <Wrapper>
              {(ref) => (
                <img src={images[2]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
              )}
            </Wrapper>
          }
          content="block"
        />
      </Column>
      <Column>
        <Field
          element={
            <Wrapper>
              {(ref) => (
                <div ref={ref}>
                  <Outlet />
                </div>
              )}
            </Wrapper>
          }
        >
          <Field element={<Wrapper>{(ref) => <div ref={ref}>{text2}</div>}</Wrapper>} />
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <img src={images[3]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
                )}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <img src={images[4]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
                )}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <img src={images[0]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
                )}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <img src={images[1]} alt="Image" ref={ref} style={{ width: '100%', ...style }} />
                )}
              </Wrapper>
            }
            content="block"
          />
        </Field>
      </Column>
    </Paper>
  );
};
