import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
      '/oauth': 'http://localhost:3000',
      '/tools': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/files': 'http://localhost:3000',
      '/process-command': 'http://localhost:3000',
      '/generate-content': 'http://localhost:3000'
    }
  },
  build: {
    outDir: '../public',
    emptyOutDir: true
  }
});


