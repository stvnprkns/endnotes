import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const demoDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: resolve(demoDir),
  plugins: [react()],
  resolve: {
    alias: [
      { find: "endnotes/style.css", replacement: resolve(demoDir, "../../src/styles/endnotes.css") },
      { find: "endnotes", replacement: resolve(demoDir, "../../src/index.ts") }
    ]
  }
})
