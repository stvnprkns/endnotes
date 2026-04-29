import {
  EndnotesClient,
  evaluateTrustPolicy,
  transformMarkdownEndnotes
} from "../../src/index.ts"
import { readFile, writeFile } from "node:fs/promises"

const client = new EndnotesClient({ apiKey: process.env.ENDNOTES_API_KEY })

const draft = await readFile("content/article.draft.md", "utf8")
const result = await client.generate({
  draft,
  style: "numeric",
  outputFormat: "markdown"
})
const trust = evaluateTrustPolicy(result)

if (!trust.canPublish) {
  throw new Error(`Trust policy failed: ${trust.reasons.join(", ")}`)
}

const transformed = transformMarkdownEndnotes(result.renderedText)
await writeFile("content/article.md", transformed.markdown)
console.log("Wrote article with endnotes to content/article.md")
