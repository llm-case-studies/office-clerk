# Merge Note - OC Custom Provider Hookup

## Branch

- working branch: `feature/clerk-core/oc-custom-provider-hookup`
- merge target: `main`
- validation branch: `validation/clerk-core/oc-custom-provider-hookup`

## Validation Outcome

- implementation host: `Acer-HL`
- staging host: `iMac-macOS`
- validation host: `iMac-Debian`
- tested product commit: `c084569`
- implementation commits:
  - `da4d139` — wire `/v1/chat/completions` to append structured JSONL
    entries via header hints
  - `f051a8c` — record staging round-trip on iMac-macOS, confirm
    `options.headers` works
  - `c084569` — retarget validation to iMac-macOS staging
- validation evidence commit: `c9afdbe` (on
  `validation/clerk-core/oc-custom-provider-hookup`)
- verdict: **PASS**
- result path:
  `testing/initiatives/clerk-core/2026-05-07_oc-custom-provider-hookup/result.md`

## Evidence Summary

- `node --test`: 5/5 pass on iMac-Debian against the product branch
- staging clerk healthy: PID 99136 alive on `iMac-macOS.local:18788`
- staging OC web healthy: PID 99152 alive on `iMac-macOS.local:4096`
- LAN probe `/health` from iMac-Debian: 200 OK
- LAN probe `/v1/chat/completions` from iMac-Debian with hint headers:
  entry landed in JSONL with all fields (`source`, `initiative`,
  `sprint`) correctly populated
- `imac-debian-validation` actor confirmed in `/v1/state`
- header passthrough end-to-end: confirmed twice — DS's
  `opencode run --attach` from Acer-HL through staging OC config
  produced two JSONL entries with `source: imac-macos-staging` and the
  full set of `options.headers` fields populated
- OC web UI round-trip from iMac-Debian: SKIP (no browser in CLI
  environment); inherited evidence is the staging-side OC probe done by
  DS plus the orchestrator's mac-mini OC desktop probe earlier the same
  day
- safety: `opencode-web.service` on iMac-Debian and the staging service
  on iMac-macOS both untouched; no kill patterns used; no client OC
  configs modified

## Decision

- merge to `main`: yes
- close sprint: yes
- split follow-up: yes — three independent threads

## Follow-Up

- next sprint candidates:
  - `clerk-staging-persistence` — add a launchd plist (or equivalent) so
    the office-clerk service on iMac-macOS survives reboots; it is
    currently a `nohup`-backgrounded process with PID tracking only
  - `oc-clients-repointing` — orchestrator setup task to update mac-mini,
    Acer-HL, and iMac-Debian client OC configs to point at
    `http://iMac-macOS.local:18788/v1` instead of any localhost or stale
    setup
  - resolve panel-runner repo split (out of scope for this sprint, but
    still pending)
- open risks:
  - staging OC web on `iMac-macOS.local:4096` is unsecured; LAN-only is
    acceptable for now but documented as a known boundary
  - "two requests per chat" is OpenCode's normal behavior for the
    `@ai-sdk/openai-compatible` adapter and produces duplicate JSONL
    entries; if the noise becomes painful, dedup downstream rather than
    rewriting the clerk's normalization path
- non-clerk follow-up still open:
  - `opencode run` on Acer-HL Debian returns "Session not found"
    globally (OpenCode CLI v1.14.33 issue, not clerk's). Not blocking
    this sprint since staging-host probing closed the loop, but worth a
    separate note when someone touches OC tooling on Acer-HL
