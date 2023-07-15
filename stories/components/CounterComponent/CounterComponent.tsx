import React from 'react';
import { Level, Node, useRegister } from '@joaopmo/react-paper';
import { useCounter } from '../CounterLayout';

const style = {
  lineHeight: 1.4,
  margin: '5px',
  fontSize: '30px',
};

function SecondLevel() {
  const { register } = useRegister();

  return (
    <div {...register()} style={style}>
      Text
    </div>
  );
}

export function CounterComponent() {
  const { register } = useRegister();
  const { counter } = useCounter();

  return (
    <div {...register()}>
      <Level>
        {Array(counter)
          .fill(null)
          .map((_, idx) => {
            return <Node element={<SecondLevel />} key={idx} />;
          })}
      </Level>
    </div>
  );
}
