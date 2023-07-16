import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { peerDependencies, devDependencies } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src', 'index.ts'),
      name: 'react-paper',
      formats: ['es', 'cjs'],
      // the proper extensions will be added
      fileName: (ext) => `index.${ext === 'cjs' ? 'cjs' : 'es.js'}`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [...Object.keys(peerDependencies), ...Object.keys(devDependencies)],
    },
    target: 'esnext',
    sourcemap: true,
  },
});
