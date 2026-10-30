import React from 'react';
import { useRegister } from '../../index';
import { loremIpsum } from 'lorem-ipsum';
import { random } from '../utils/random';

const style: React.CSSProperties = {
  fontSize: '50px',
  textAlign: 'center',
  lineHeight: 1.4,
  margin: '25px 5px',
  borderBottom: '1px solid black',
};

const text = loremIpsum({ count: 3, units: 'words', random });

export function HeaderComponent() {
  const { register } = useRegister();

  return (
    <div {...register()} style={style}>
      {text}
    </div>
  );
}
