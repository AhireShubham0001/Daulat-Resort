import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          // Remove default body size limit on the proxy so large image uploads pass through
          proxy.on('proxyReq', (proxyReq) => {
            // no-op — just ensures the proxy stream is not capped
          });
        },
        // Increase proxy buffer size for large file uploads (50 MB)
        proxyTimeout: 300000,           // 5 min timeout for slow uploads
        timeout: 300000,
      }
    }
  }
})
