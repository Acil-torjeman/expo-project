import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chakra-ui': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          'icons': ['react-icons', 'react-icons/fi'],
          
          // Application services
          'admin-services': ['./src/services/admin.service.js'],
          'auth-services': ['./src/services/auth.service.js'],
          'exhibitor-services': [
            './src/services/exhibitor.service.js', 
            './src/services/registration.service.js'
          ],
          'organizer-services': [
            './src/services/organizer.service.js',
            './src/services/event.service.js',
            './src/services/plan.service.js',
            './src/services/equipment.service.js',
            './src/services/stand.service.js'
          ],
          'financial-services': [
            './src/services/invoice.service.js',
            './src/services/payment.service.js'
          ],
          'user-services': [
            './src/services/user.service.js',
            './src/services/profile.service.js',
            './src/services/message.service.js'
          ],
          
          // Utils
          'utils': ['./src/utils/api.js', './src/utils/fileUtils.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Augmentez la limite d'avertissement pour les gros chunks
  }
})