import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../../design-system/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-links', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: false,
  },
  viteFinal: async (config) => {
    return {
      ...config,
      server: {
        ...config.server,
        watch: {
          usePolling: true,
          interval: 1000,
        },
      },
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@kannan19302/ui': path.resolve(__dirname, '../../design-system/src'),
          'lucide-react': path.resolve(__dirname, '../node_modules/lucide-react'),
          '@radix-ui/react-slot': path.resolve(__dirname, '../node_modules/@radix-ui/react-slot'),
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include || []),
          'lucide-react',
          '@radix-ui/react-slot',
        ],
      },
      // The stories and components live OUTSIDE this Vite project root
      // (../../design-system/src, i.e. /design-system in the container while the
      // root is /app). @vitejs/plugin-react only applies its JSX transform to
      // files under the root, so every component here was served with raw JSX
      // and the classic runtime's implicit `React` reference — which nothing
      // imports, because the codebase is written for the automatic runtime.
      // Every story rendered as "React is not defined".
      //
      // Setting the transform on esbuild covers files wherever they live.
      esbuild: {
        ...config.esbuild,
        jsx: 'automatic',
        jsxImportSource: 'react',
      },
    };
  },
};

export default config;
