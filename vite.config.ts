import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Scanner middleware only runs in dev — not imported during production build
    command === 'serve' && {
      name: 'ribby-scanner-api',
      async configureServer(server: any) {
        const { createMiddleware } = await import('./server/middleware');
        server.middlewares.use(createMiddleware());
      }
    }
  ].filter(Boolean),
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 2500
  }
}));
