import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../stories/assets'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(viteConfig) {
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias ?? {}),
      '@joaopmo/react-paper/css/base': path.resolve(__dirname, '../src/styles/base.css'),
      '@joaopmo/react-paper/css/print': path.resolve(__dirname, '../src/styles/print.css'),
      '@joaopmo/react-paper/core': path.resolve(__dirname, '../src/core/index.ts'),
      '@joaopmo/react-paper': path.resolve(__dirname, '../src/index.ts'),
    };
    return viteConfig;
  },
};
export default config;
