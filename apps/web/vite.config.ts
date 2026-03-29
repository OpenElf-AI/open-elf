import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000';
  
  return {
    plugins: [
      react(),
      mode === 'analyze' &&
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),
    server: {
      port: 34284,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ai-bridge': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      esbuild: {
        drop: ['console', 'debugger'],
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            query: ['@tanstack/react-query'],
            ui: ['lucide-react', 'recharts'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@tanstack/react-query', 'zustand'],
    },
  };
});
