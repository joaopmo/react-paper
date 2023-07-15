import React from 'react';
import { useRegister } from '@joaopmo/react-paper';

import { loremIpsum } from 'lorem-ipsum';
import { random } from '../../utils';

const style = {
  lineHeight: 1.4,
  margin: '5px',
};

const text = loremIpsum({ count: 10, units: 'paragraphs', random });

export function TextComponent() {
  const { register } = useRegister();

  return (
    <div {...register()} style={style}>
      {text}
    </div>
  );
}
