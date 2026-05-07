# Sprint Brief - OC Custom Provider Hookup

**Initiative:** `clerk-core`
**Sprint:** `2026-05-07_oc-custom-provider-hookup`
**Target branch:** `feature/clerk-core/oc-custom-provider-hookup`
**Merge target:** `main`
**Validation branch:** `validation/clerk-core/oc-custom-provider-hookup`

## Goal

Take the stub `/v1/chat/completions` seam from sprint 1 and turn it into a
real OpenCode custom-provider hookup with evidence.

When done:

1. A chat request to `/v1/chat/completions` lands as a structured entry in
   the JSONL log, normalized through the same path as `/v1/log`.
2. The same chat round-trips a useful reply (current state summary) back to
   the caller.
3. The OpenCode config that makes a real OC WebUI talk to office-clerk is
   captured in the repo as a small reference note.

## Why Now

We have a validated bootstrap and a stub seam. The seam does not pay back
its existence until a real OC instance posts to it and a real result appears
in the log. Doing this now is small, surfaces the next missing piece
honestly, and unblocks future inter-machine work.

## Scope Fence

Expected touch set:

- `service/server.js`
- `service/store.js`, only if needed for hint plumbing
- `tests/http.test.js`
- docs under this active sprint pack
- `docs/architecture/oc-provider-hookup.md` (new short reference note)

Good scope:

- `/v1/chat/completions` extracts the latest user message and appends a
  structured entry before replying
- `source` is taken from a request hint (header or extension body field),
  with a clear default when absent
- optional `initiative`, `sprint`, `branch`, `kind`, `tags` taken from the
  same hint mechanism
- the reply remains the current state summary
- one short doc captures the OpenCode config snippet that worked

Still out of scope:

- auth on the clerk service (still `127.0.0.1` only)
- multi-machine network binding
- posting back into live OpenCode sessions (the reverse direction)
- shape changes to `/v1/log`, `/v1/state`, `/v1/summary`
- any UI work
- moving away from JSONL persistence
- making OpenCode itself do anything beyond "select a custom provider and
  chat"

## Hint Mechanism

Choose between:

1. **HTTP headers** — e.g. `x-office-clerk-source`,
   `x-office-clerk-initiative`, `x-office-clerk-sprint`, etc.
2. **Extension field in the request body** — e.g. an extra top-level
   `office_clerk` object alongside the standard OpenAI fields.

Pick whichever OpenCode actually passes through cleanly. Record the choice
and the reason in `docs/architecture/oc-provider-hookup.md`.

If neither path is available, fall back to deriving `source` from the
request `model` (e.g. `office-clerk:<suffix>`) or a static default like
`opencode:unknown`. Record honestly.

## Acceptance Target

- `POST /v1/chat/completions` with a representative chat body appends one
  entry to the JSONL log
- the entry carries non-empty `source` and `summary`
- the entry is normalized through the same code path as `/v1/log`
- the response remains a valid OpenAI-shaped chat completion with the
  current state summary as the assistant message
- `tests/http.test.js` covers: chat-with-hint, chat-without-hint,
  chat-with-malformed-body, and asserts the log grew
- a real OpenCode instance was configured against this endpoint on Acer-HL
  and a chat from the UI was confirmed in `updates.jsonl` (or the exact
  blocker was recorded)
- `docs/architecture/oc-provider-hookup.md` captures the working config
  snippet

## Honest-Failure Mode

If OpenCode rejects the endpoint outright (e.g. requires fields the clerk
cannot honestly produce, requires a fixed model list, assumes streaming
that is not implemented), do **not** reshape the clerk to chase it. Record
the exact blocker and stop. The clerk staying small is more important than
the integration completing.

## PronunCo Reminder

This sprint is supporting infrastructure. It does not change the fact that
the next real `PronunCo` product sprint should come from `lesson-core`.

## Host Safety

- coding host: `Acer-HL`
- validation host: `iMac-Debian`

`iMac-Debian` carries `opencode-web.service` on port `4096`. That service is
off-limits to validation. The validation request says how to bind to a
different port and how to clean up via tracked PID. The coding agent on
Acer-HL should also avoid blind kill patterns when starting/stopping local
test instances.
