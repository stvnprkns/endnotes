import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const siteDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: resolve(siteDir),
  plugins: [react()],
  server: {
    port: 5174
  },
  resolve: {
    alias: [
      { find: "endnotes/style.css", replacement: resolve(siteDir, "../src/styles/endnotes.css") },
      { find: "endnotes", replacement: resolve(siteDir, "../src/index.ts") }
    ]
  }
})
