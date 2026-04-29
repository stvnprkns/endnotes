import { codeToHtml, type BundledLanguage } from "shiki/bundle/web"

const LANG_ALIASES: Record<string, BundledLanguage> = {
  tsx: "tsx",
  ts: "typescript",
  typescript: "typescript",
  jsx: "jsx",
  js: "javascript",
  javascript: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  shellscript: "bash",
  zsh: "zsh",
  css: "css",
  scss: "scss",
  json: "json",
  jsonc: "jsonc",
  html: "html",
  md: "markdown",
  mdx: "mdx",
}

export function resolveShikiLang(language: string | undefined): BundledLanguage {
  if (!language) return "tsx"
  const key = language.trim().toLowerCase()
  return LANG_ALIASES[key] ?? "tsx"
}

export async function highlightToHtml(
  code: string,
  language: string | undefined,
  appearance: "light" | "dark" = "light"
): Promise<string> {
  const lang = resolveShikiLang(language)
  return codeToHtml(code, {
    lang,
    theme: appearance === "dark" ? "github-dark" : "github-light",
  })
}
