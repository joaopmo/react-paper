import React from 'react';
import { Level, Node, usePageInfo, useRegister } from '../../index';

const style: React.CSSProperties = {
  lineHeight: 1.4,
  margin: '5px',
  fontSize: '30px',
};

let renderCount = 0;

function SecondLevel() {
  const { register } = useRegister();
  const { isMeasurementPass } = usePageInfo();

  if (!isMeasurementPass) {
    renderCount++;
  }

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
