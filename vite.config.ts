
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Falls back to empty string if undefined to prevent "process is not defined" or "undefined" errors
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
});
