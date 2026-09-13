import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/mis-tapitas/',
  plugins: [react()],
});
