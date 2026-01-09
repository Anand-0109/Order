/* import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
 */import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/Part": {
        target: "http://localhost:5000",
        changeOrigin: true
      },
      "/CustomerPart": {
        target: "http://localhost:5000",
        changeOrigin: true
      },
      "/PartExtData": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  }
});
