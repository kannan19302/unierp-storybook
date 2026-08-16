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
    };
  },
};

export default config;
