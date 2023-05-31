import React from 'react';
import { loremIpsum } from 'lorem-ipsum';
import { Level, useRegister, Paper, Column, Node, Root } from '../src';
import '../src/styles/base.css';
import '../src/styles/print.css';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const text = loremIpsum({ count: 5, units: 'paragraphs' });
const style = {
  marginTop: `${getRandomInt(10)}px`,
  marginBottom: `${getRandomInt(10)}px`,
  paddingTop: `${getRandomInt(10)}px`,
  paddingBottom: `${getRandomInt(10)}px`,
  lineHeight: 1.3,
};

function Text() {
  const { register } = useRegister();

  return (
    <div {...register()} style={style}>
      {text}
    </div>
  );
}

function TextTwo() {
  const { register } = useRegister();

  return (
    <div {...register()} style={{ ...style, color: 'blue' }}>
      <Level>
        <Node element={<Text />} />
        <Node element={<Text />} />
      </Level>
    </div>
  );
}

function TextThree() {
  const { register } = useRegister();

  return (
    <div {...register()} style={{ ...style, color: 'red' }}>
      <Level>
        <Node element={<Text />} />
        <Node element={<Text />} />
        <Node element={<Text />} />
      </Level>
    </div>
  );
}

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
  const [element, setElement] = React.useState<string>('three');

  React.useEffect(() => {
    setTimeout(() => {
      setElement('two');
    }, 5000);
  }, []);

  return (
    <Paper pageWidth={0.7}>
      <Column>
        <Root element={<TextTwo />} rootKey={'key1' + element} />
        <Root
          element={element === 'two' ? <TextTwo /> : <TextThree />}
          rootKey={'key2' + element}
        />
        <Root element={<TextTwo />} rootKey={'key3' + element} />
      </Column>
    </Paper>
  );
};
