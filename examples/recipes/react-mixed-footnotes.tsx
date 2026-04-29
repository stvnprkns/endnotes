import { Endnotes, Note } from "../../src"

export function MixedFootnotesExample() {
  return (
    <>
      <p>
        Battery life improved by 22% in controlled tests.
        <Note kind="citation" href="https://example.com/lab-results" type="report">
          Lab Results Q2
        </Note>
      </p>
      <p>
        The team intentionally delayed rollout for one week.
        <Note kind="note">Delay was due to support coverage and onboarding constraints.</Note>
      </p>
      <Endnotes />
    </>
  )
}
