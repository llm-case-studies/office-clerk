# OC Custom Provider Hookup

This sprint takes the existing stub `/v1/chat/completions` seam from sprint 1
and turns it into a real OpenCode custom-provider hookup, with evidence.

## Why This Sprint Exists

Sprint 1 shipped the stub. The endpoint accepts any OpenAI-shaped chat
request, ignores the body, and replies with the current state summary. That
proved the endpoint shape but does not yet earn the seam.

The next useful step is small but real:

- have OpenCode actually configured to talk to office-clerk as a custom
  OpenAI-compatible provider
- have a chat sent from an OpenCode WebUI land in the JSONL log as a
  structured entry
- capture the working OpenCode config snippet in this repo

That is the smallest version of the inter-machine bookkeeping seam described
in the original office-clerk repo proposal.

## Read With It

Before implementation, the next coding orchestrator should also read:

- `01-brief.md`
- `00-opencode-kickoff.md`
- `04-staging-on-imac-macos-kickoff.md` (follow-up — closes the OC-UI-probe
  blocker from the original implementation by moving the probe to fresh
  iMac-macOS staging)
- `testing/initiatives/clerk-core/2026-05-07_oc-custom-provider-hookup/request.md`

## Main Product Reminder

`PronunCo` remains the main product focus.

This sprint is justified only because it removes friction for orchestrators
bouncing between OpenCode WebUIs across machines. It is not a license to
turn `office-clerk` into a workflow engine.

## After This Sprint

The next likely step depends on what this sprint surfaces as the real next
friction:

- inter-machine binding (sharing one clerk across three OC instances)
- auth on the clerk
- finishing the deferred OpenCode session-posting research

The next real `PronunCo` product sprint should still come from `lesson-core`.
