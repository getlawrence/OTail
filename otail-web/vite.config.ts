import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "otail",
    project: "javascript-react"
  })],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  preview: {
    port: 3000,
    strictPort: true,
  },

  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:3000",
  },

  build: {
    sourcemap: true
  }
})