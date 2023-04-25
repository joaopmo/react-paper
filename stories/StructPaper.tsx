import React from 'react';
import '../src/styles/base.css';

import { Paper, Column, Field, useReference, Outlet } from '../src';
import { loremIpsum } from 'lorem-ipsum';

type Ref = ((arg: Element | null) => void) | null;

interface WrapperProps {
  children: (arg: Ref) => JSX.Element;
}
const Wrapper = ({ children }: WrapperProps): JSX.Element => {
  const ref = useReference();

  return children(ref);
};

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
                {(ref) => <div ref={ref}>{loremIpsum({ count: 20, units: 'paragraphs' })}</div>}
              </Wrapper>
            }
          />
        </Field>
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
                {(ref) => <div ref={ref}>{loremIpsum({ count: 20, units: 'paragraphs' })}</div>}
              </Wrapper>
            }
          />
        </Field>
      </Column>
    </Paper>
  );
};
