from fastapi import FastAPI
from pydantic import BaseModel
from sdk.python.endnotes_sdk import EndnotesClient, evaluate_trust_policy

app = FastAPI()
client = EndnotesClient(api_key="YOUR_API_KEY")


class EndnotesRequest(BaseModel):
    draft: str


@app.post("/endnotes")
def create_endnotes(payload: EndnotesRequest):
    result = client.generate(draft=payload.draft, style="numeric", output_format="markdown")
    trust = evaluate_trust_policy(result)
    return {
        "status": "publishable" if trust["canPublish"] else "needs_review",
        "trust": trust,
        "result": result,
    }
