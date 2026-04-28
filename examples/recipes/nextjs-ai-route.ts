import { EndnotesClient, evaluateTrustPolicy } from "../../src"

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

  const trust = evaluateTrustPolicy(result)
  if (!trust.canPublish) {
    return Response.json(
      {
        status: "needs_review",
        trust,
        result
      },
      { status: 202 }
    )
  }

  return Response.json({ status: "publishable", trust, result })
}
