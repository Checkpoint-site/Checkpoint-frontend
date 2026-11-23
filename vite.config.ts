/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:5242';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@app': path.resolve(import.meta.dirname, './src/app'),
        '@pages': path.resolve(import.meta.dirname, './src/pages'),
        '@widgets': path.resolve(import.meta.dirname, './src/widgets'),
        '@features': path.resolve(import.meta.dirname, './src/features'),
        '@entities': path.resolve(import.meta.dirname, './src/entities'),
        '@shared': path.resolve(import.meta.dirname, './src/shared'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
