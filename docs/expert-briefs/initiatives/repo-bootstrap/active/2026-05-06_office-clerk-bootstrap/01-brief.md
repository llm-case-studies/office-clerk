# Expert Brief - Office Clerk Bootstrap

**Date:** 2026-05-06
**Initiative:** `repo-bootstrap`
**Status:** active sprint
**Audience:** OpenCode coding agent on `Acer-HL` (`DeepSeek` preferred; another strong generalist is acceptable if needed)

## Why This Sprint Exists

The orchestration notes that led to `office-clerk` all point at the same gap:
interactive orchestrators can coordinate a lot of work, but the current state
still lives partly in chat history and human memory.

This sprint is not meant to solve everything. It exists to prove the smallest
credible clerk loop:

- append a structured update
- read current state
- read a compact summary
- expose one narrow AI-compatible seam

If that loop works, future work can decide whether richer automation or
visualization is worth adding.

## Execution Fence

- Repo: `office-clerk`
- Initiative: `repo-bootstrap`
- Implementation host: `Acer-HL`
- Base branch: `origin/main`
- Working branch: `feature/repo-bootstrap/office-clerk-bootstrap`
- Merge target when validated: `main`
- Validation branch: `validation/repo-bootstrap/office-clerk-bootstrap`
- Validation host: `iMac-Debian`

If the repo has not been pushed to a shared remote yet, report that as a real
blocker. Do not silently replace this with a host-local-only flow.

## References

Read these first:

- `README.md`
- `docs/expert-briefs/README.md`
- `docs/architecture/DEFERRED.md`
- `testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/request.md`

Relevant sources:

- `service/store.js`
- `service/server.js`
- `tests/store.test.js`
- `tests/http.test.js`

## Feature Goal

Make `office-clerk` usable as a tiny local coordination service.

### Required endpoints

- `GET /health`
- `POST /v1/log`
- `GET /v1/state`
- `GET /v1/summary`
- `POST /v1/chat/completions`

### Smallest acceptable behavior

`POST /v1/log` should accept a JSON object with:

- required: `source`, `summary`
- optional: `initiative`, `sprint`, `branch`, `status`, `decision`, `blocker`, `nextAction`, `tags`

The service should:

- append the normalized entry to local JSONL storage
- keep storage append-only
- compute current actor state from the latest entry per source
- produce a readable summary text from current state
- return an OpenAI-shaped chat completion that simply reflects current summary text

## Acceptable Implementation Scope

- use built-in Node facilities before adding dependencies
- keep persistence file-based and local
- keep the chat-compatible endpoint narrow and obviously non-magical
- improve README/testing docs if implementation reveals real ambiguity

Do not turn this into:

- shared-session control for OpenCode or Codex
- repo mutation authority
- auth or account work
- browser UI
- long-running worker orchestration
- speculative multi-tenant platform design

## Smoke And Validation Expectations

Before handoff from the coding lane:

1. `node --test` passes.
2. Local service smoke passes for the request flow in `testing/.../request.md`.
3. Invalid input returns honest 400 JSON errors.
4. The result note says what was deliberately deferred.

Validation then reruns the service on `iMac-Debian` from
`validation/repo-bootstrap/office-clerk-bootstrap` and records evidence there.

## Deliverables

Required:

1. implementation on `feature/repo-bootstrap/office-clerk-bootstrap`
2. concise implementer note using `02-result-template.md`
3. validation-ready request and result files under:
   - `testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/`

## Done Means

- branch contains the minimal clerk service and focused tests
- built-in Node tooling is enough to run the sprint
- local smoke is honest
- validation request is specific enough for `iMac-Debian` to rerun without guesswork
- deferred work is named instead of quietly smuggled into sprint 1

## If You Think The Approach Is Wrong

Useful pushback would be:

- whether the OpenAI-shaped compatibility seam is too misleading even for sprint 1
- whether a required field beyond `source` and `summary` is needed for useful state
- whether the current state builder loses important history for the intended use

Report those concerns before widening scope.
