# Clerk Core

This initiative is for small, earned expansions of `office-clerk` after the
bootstrap sprint proved the repo is viable.

## Working Rule

`clerk-core` should only absorb functionality that:

- is reusable across more than one initiative
- is easier to validate than ad hoc human copy/paste
- does not pretend to replace sprint briefs, testing requests, or merge
  review

## Current Priority

The first active `clerk-core` sprint is:

- `2026-05-07_oc-custom-provider-hookup`

It turns the existing stub `/v1/chat/completions` seam into a real OpenCode
custom-provider hookup with evidence — the smallest version of the
inter-machine bookkeeping seam described in the original repo proposal.

## Focus Reminder

`office-clerk` is supporting infrastructure.

The main product focus remains `PronunCo`. If `clerk-core` work starts
delaying real `PronunCo` product lanes, the clerk lane is too big.
