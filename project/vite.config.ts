import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { securityHeaders } from './vite.plugins';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    securityHeaders(),
    visualizer({
      template: 'treemap', // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['lucide-react', 'react-day-picker', '@mui/material', '@emotion/react', '@emotion/styled'],
          'mui': ['@mui/x-date-pickers', '@mui/x-date-pickers-pro'],
          'storage': ['@supabase/supabase-js'],
          'sentry': ['@sentry/react', '@sentry/tracing'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // 4kb - inline smaller assets as base64
    target: 'esnext', // Modern browsers for better optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* in production
        drop_debugger: true,
      },
    },
    sourcemap: true, // Enable source maps for Sentry
    reportCompressedSize: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true, // Expose to network for testing
  },
});
