import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Прослушивание всех сетевых интерфейсов
    port: 5173,      // Фиксированный порт
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
