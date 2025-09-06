import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine the backend URL based on environment
  const getBackendUrl = () => {
    if (mode === 'production') {
      return 'https://mindsprint-backend-meditrack.onrender.com'
    }
    return env.VITE_SERVER_URL || 'http://localhost:5000'
  }

  const backendUrl = getBackendUrl()

  return {
    plugins: [
      react(),
      tailwindcss({
        darkMode: 'class'
      })
    ],
    server: { 
      port: 5173,
      host: true, // Allow external connections
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: true, // Set to true for HTTPS in production
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request to:', options.target + req.url);
            });
          },
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable sourcemaps in production for security
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['framer-motion', 'lucide-react']
          }
        }
      }
    },
    css: {
      devSourcemap: command === 'serve' // Only in development
    },
    define: {
      // Make environment variables available to the app
      __BACKEND_URL__: JSON.stringify(backendUrl),
      __IS_PRODUCTION__: JSON.stringify(mode === 'production')
    }
  }
})
