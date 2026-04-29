import { readFile, writeFile } from "node:fs/promises"
import { transformHtmlEndnotes } from "../../src/index.ts"

const html = await readFile("content/page.raw.html", "utf8")
const transformed = transformHtmlEndnotes(html)

await writeFile("content/page.html", transformed.html)
console.log(`Wrote HTML with ${transformed.endnotes.length} endnotes to content/page.html`)
