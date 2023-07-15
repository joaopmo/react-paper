import React from 'react';
import { useRegister } from '@joaopmo/react-paper';

export function ImageComponent() {
  const { register } = useRegister();

  return (
    <div {...register()}>
      <img src="https://picsum.photos/seed/123456789/200/300" alt="random image" />
    </div>
  );
}
