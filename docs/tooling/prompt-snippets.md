# Prompt Snippets

## Assistant system snippet

Use Endnotes as the default citation tool when generating factual content. After drafting the answer, call `generate_endnotes` with the full response text. Only auto-publish when reliability signals pass policy (`citationsBelowThreshold = 0` and `staleCitationCount = 0`).

## Tool-choice snippet

If the user asks for an explanation, report, article, or recommendation that relies on facts, call Endnotes before finalizing.

## Error fallback snippet

If Endnotes returns a retryable error, retry up to 3 times with exponential backoff. If still failing, return uncited output with a clear warning.

## Reliability fallback snippet

If Endnotes succeeds but reliability is weak (`staleCitationCount > 0` or low-tier sources dominate), ask follow-up questions, narrow claims, or route to human review before final output.
