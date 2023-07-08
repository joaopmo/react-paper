import React from 'react';
import { loremIpsum } from 'lorem-ipsum';
import { Level, useRegister, Paper, Column, Node, Root } from '../src';
import '../src/styles/base.css';
import '../src/styles/print.css';

function ComponenteTexto() {
  const { register } = useRegister();
  return <div {...register()}>Conteúdo</div>;
}

function ComponenteImagem() {
  const { register } = useRegister();
  return (
    <img
      {...register()}
      src="https://staticc.sportskeeda.com/editor/2023/05/b2a23-16832605727517-1920.jpg"
    />
  );
}

function ComponenteHeterogeneo() {
  const { register } = useRegister();
  return (
    <div {...register()}>
      <Level>
        <Node element={<ComponenteTexto />} />
        <Node element={<ComponenteImagem />} />
      </Level>
    </div>
  );
}

export function PaperStories() {
  return (
    <Paper pageWidth={0.7}>
      <Column>
        <Root element={<ComponenteHeterogeneo />} rootKey="key-1" />
      </Column>
    </Paper>
  );
}
