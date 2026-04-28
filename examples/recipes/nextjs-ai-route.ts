import { EndnotesClient } from "../../src"

const client = new EndnotesClient({
  apiKey: process.env.ENDNOTES_API_KEY!,
  appName: "nextjs-ai-route"
})

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as { draft: string }
  const result = await client.generate({
    draft: body.draft,
    style: "numeric",
    outputFormat: "markdown"
  })

  return Response.json(result)
}
