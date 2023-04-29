import React from 'react';
import { loremIpsum } from 'lorem-ipsum';
import { Level, useRegister } from '../src/components/Level';
import { PaperNested } from '../src/components/PaperNested';
import { Column } from '../src';
import { Node } from '../src/components/Node';
import '../src/styles/base.css';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const text = loremIpsum({ count: 30, units: 'paragraphs' });
const style = {
  marginTop: `${getRandomInt(10)}px`,
  marginBottom: `${getRandomInt(10)}px`,
  paddingTop: `${getRandomInt(10)}px`,
  paddingBottom: `${getRandomInt(10)}px`,
  borderTop: '2px solid red',
  borderBottom: '2px solid green',
};

const Text = function Content({ children }: { children?: React.ReactNode }) {
  // const text = React.useMemo(() => loremIpsum({ count: 30, units: 'paragraphs' }), []);
  // const style = React.useMemo(() => {
  //   return {
  //     marginTop: `${getRandomInt(10)}px`,
  //     marginBottom: `${getRandomInt(10)}px`,
  //     paddingTop: `${getRandomInt(10)}px`,
  //     paddingBottom: `${getRandomInt(10)}px`,
  //     borderBottom: '2px solid green',
  //   };
  // }, []);
  // if (children === undefined) console.log(text, '\n\n');

  const register = useRegister();

  return (
    <div {...register()} style={style}>
      {children ?? text}
    </div>
  );
};

const images = [
  'https://images4.alphacoders.com/973/973967.jpg',
  'https://images4.alphacoders.com/993/993395.jpg',
  'https://images.alphacoders.com/919/919248.jpg',
  'https://images4.alphacoders.com/920/920077.jpg',
  'https://images.alphacoders.com/172/172203.jpg',
];

const link = images[getRandomInt(4)];

const height = `${getRandomInt(150)}px`;
console.log(height);

function Image() {
  const register = useRegister();

  return (
    <img
      src={link}
      alt="Image"
      style={{
        ...style,
        width: '100%',
        borderTop: '8px solid red',
        borderBottom: '8px solid green',
      }}
      {...register()}
    />
  );
}

export const NestedPaper = () => {
  return (
    <PaperNested pageWidth={0.7}>
      <Column>
        <Level>
          {/* 0.0 */}
          <Node
            element={
              <Text>
                <Level>
                  {/* 0.0.0 */}
                  <Node
                    element={
                      <Text>
                        <Level>
                          {/* 0.0.0.0 */}
                          <Node element={<Text />} />
                          {/* 0.0.0.1 */}
                          <Node element={<Image />} content="block" />
                          {/* 0.0.0.2 */}
                          <Node element={<Image />} content="block" />
                          {/* 0.0.0.3 */}
                          <Node element={<Image />} content="block" />
                          {/* 0.0.0.4 */}
                          <Node element={<Image />} content="block" />
                        </Level>
                      </Text>
                    }
                  />
                  {/* 0.0.1 */}
                  <Node element={<Image />} content="block" />
                  {/* 0.0.2 */}
                  <Node element={<Text />} />
                </Level>
              </Text>
            }
          />
        </Level>
      </Column>
      <Column>
        <Level>
          {/* 1.0 */}
          <Node element={<Text />} />
          {/* 1.1 */}
          <Node element={<Image />} content="block" />
          {/* 1.2 */}
          <Node element={<Image />} content="block" />
          {/* 1.3 */}
          <Node element={<Text />} />
        </Level>
      </Column>
    </PaperNested>
  );
};
