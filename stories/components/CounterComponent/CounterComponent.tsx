import React from 'react';
import { Level, Node, useRegister } from '@joaopmo/react-paper';

const style = {
  lineHeight: 1.4,
  margin: '5px',
  fontSize: '30px',
};

let renderCount = 0;

function SecondLevel() {
  const { register } = useRegister();
  renderCount++;

  return (
    <div {...register()} style={style}>
      {`Render Count: ${renderCount}`}
    </div>
  );
}

export function CounterComponent() {
  const { register } = useRegister();

  return (
    <div {...register()}>
      <Level>
        <Node element={<SecondLevel />} />
      </Level>
    </div>
  );
}
