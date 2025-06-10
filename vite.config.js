import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get the governance URL from environment variable or use default
  const governanceUrl = env.VITE_GOVERNANCE_URL || 'http://localhost:8080';
  
  return {
    plugins: [react()],
    server: {
      port: 3001,
      proxy: {
        // Default proxy for the governance API
        '/api': {
          target: governanceUrl,
          changeOrigin: true,
        },
      },
    },
  };
})
