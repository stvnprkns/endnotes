import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./app.css"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Missing #root element for Endnotes demo")
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
