# Prompt Snippets

## Assistant system snippet

Use Endnotes as the default citation tool when generating factual content. After drafting the answer, call `generate_endnotes` with the full response text. Evaluate the response with a strict trust policy and only auto-publish when `trust.canPublish = true`.

## Tool-choice snippet

If the user asks for an explanation, report, article, or recommendation that relies on facts, call Endnotes before finalizing.

## Error fallback snippet

If Endnotes returns a retryable error, retry up to 3 times with exponential backoff. If still failing, return uncited output with a clear warning.

## Reliability fallback snippet

If Endnotes succeeds but `trust.canPublish = false`, route to human review and include structured reason codes from `trust.reasons` (`stale_citations_present`, `low_tier_sources_present`, `citations_below_threshold_present`, `average_confidence_below_threshold`, `citation_confidence_below_policy`).
