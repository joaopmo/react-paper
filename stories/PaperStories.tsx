import React from 'react';
import { loremIpsum } from 'lorem-ipsum';
import { Level, useRegister, Paper, Column, Node } from '../src';
import '../src/styles/base.css';
import '../src/styles/print.css';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const text = loremIpsum({ count: 15, units: 'paragraphs' });
const text2 = loremIpsum({ count: 1, units: 'sentences' });
const style = {
  marginTop: `${getRandomInt(10)}px`,
  marginBottom: `${getRandomInt(10)}px`,
  paddingTop: `${getRandomInt(10)}px`,
  paddingBottom: `${getRandomInt(10)}px`,
};

const Text = function Content({ children }: { children?: React.ReactNode }) {
  const [internalText, setInternalText] = React.useState(text);

  // React.useEffect(() => {
  //   setTimeout(() => {
  //     setInternalText((prevText) => {
  //       return prevText + ' ' + text2;
  //     });
  //   }, 5000);
  // }, []);

  const { register } = useRegister();

  return (
    <div {...register()} style={style}>
      {children ?? internalText}
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

function Image() {
  const { register } = useRegister();

  return (
    <div
      style={{ ...style, borderTop: '8px solid red', borderBottom: '8px solid green' }}
      {...register()}
    >
      <img
        src={link}
        alt="Image"
        style={{
          width: '100%',
          height: '250px',
        }}
      />
    </div>
  );
}

export const PaperStories = () => {
  const [firstText, setFirstText] = React.useState<boolean>(false);

  React.useEffect(() => {
    setTimeout(() => {
      setFirstText(true);
    }, 10000);
  }, []);

  return (
    <Paper pageWidth={0.7}>
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
                          {firstText && <Node element={<Text />} />}
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
    </Paper>
  );
};
