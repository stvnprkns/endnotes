from fastapi import FastAPI
from pydantic import BaseModel
from sdk.python.endnotes_sdk import EndnotesClient

app = FastAPI()
client = EndnotesClient(api_key="YOUR_API_KEY")


class EndnotesRequest(BaseModel):
    draft: str


@app.post("/endnotes")
def create_endnotes(payload: EndnotesRequest):
    return client.generate(draft=payload.draft, style="numeric", output_format="markdown")
