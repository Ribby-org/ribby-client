import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createMiddleware } from './server/middleware';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ribby-scanner-api',
      configureServer(server) {
        server.middlewares.use(createMiddleware());
      }
    }
  ],
  server: { port: 5173 }
});
