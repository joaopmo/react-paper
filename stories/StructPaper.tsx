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

export const StructPaper = () => {
  return (
    <Paper pageWidth={0.7}>
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
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <div ref={ref}>{loremIpsum({ count: TEXT_COUNT, units: 'paragraphs' })}</div>
                )}
              </Wrapper>
            }
          />
          <Field
            element={
              <Wrapper>
                {(ref) => <img src={images[0]} alt="Image" ref={ref} style={{ width: '100%' }} />}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => <img src={images[1]} alt="Image" ref={ref} style={{ width: '100%' }} />}
              </Wrapper>
            }
            content="block"
          />
        </Field>
        <Field
          element={
            <Wrapper>
              {(ref) => <img src={images[2]} alt="Image" ref={ref} style={{ width: '100%' }} />}
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
          <Field
            element={
              <Wrapper>
                {(ref) => (
                  <div ref={ref}>{loremIpsum({ count: TEXT_COUNT, units: 'paragraphs' })}</div>
                )}
              </Wrapper>
            }
          />
          <Field
            element={
              <Wrapper>
                {(ref) => <img src={images[3]} alt="Image" ref={ref} style={{ width: '100%' }} />}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => <img src={images[4]} alt="Image" ref={ref} style={{ width: '100%' }} />}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => <img src={images[0]} alt="Image" ref={ref} style={{ width: '100%' }} />}
              </Wrapper>
            }
            content="block"
          />
          <Field
            element={
              <Wrapper>
                {(ref) => <img src={images[1]} alt="Image" ref={ref} style={{ width: '100%' }} />}
              </Wrapper>
            }
            content="block"
          />
        </Field>
      </Column>
    </Paper>
  );
};