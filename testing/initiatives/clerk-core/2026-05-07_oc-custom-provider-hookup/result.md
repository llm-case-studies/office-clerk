# Validation Result - OC Custom Provider Hookup

**Date:** 2026-05-07
**Validator host:** iMac-Debian
**Staging host (probe target):** iMac-macOS
**Product commit:** `c084569977e75c8ea3b019f8087a099505a37a2f`
**Validation branch:** `validation/clerk-core/oc-custom-provider-hookup`

## Verdict: **PASS**

## Checks Summary

| Step | Check | Result |
|------|-------|--------|
| 00 | Product commit recorded | `c0845699` (after `f051a8c` ✓) |
| 01 | Staging reachability | iMac-macOS reachable, clerk PID 99136 up 13h+, OC web PID 99152 up |
| 02 | `node --test` | 5/5 pass |
| 03 | `/health` | `{"ok":true}` |
| 04 | `/v1/chat/completions` | OpenAI-shaped response with state summary |
| 05 | Log tail (SSH) | Entry with correct `source`, `initiative`, `sprint` |
| 06 | `/v1/state` | `imac-debian-validation` in `state.actors` |
| 07 | `/v1/summary` | Matches state, includes our probe |
| 08 | OC UI round-trip | SKIP (no browser in CLI), but existing staging entries confirm passthrough |
| 09 | Cleanup | Protected services intact on iMac-Debian |

## Log Assertion (step 05)

The curl probe entry from `imac-debian-validation` in the JSONL:

- `source`: `imac-debian-validation` ✓
- `initiative`: `clerk-core` ✓
- `sprint`: `2026-05-07_oc-custom-provider-hookup` ✓
- `summary`: `"validation probe from imac-debian"` ✓
- Shape matches `/v1/log` output (id, createdAt, source, kind, initiative, sprint, branch, status, summary, decision, blocker, nextAction, tags) ✓

## Header Passthrough

Custom headers (`x-office-clerk-source`, `x-office-clerk-initiative`, `x-office-clerk-sprint`) sent via curl landed correctly in the JSONL entry. Two prior entries from `imac-macos-staging` confirm that `options.headers` from an OpenCode provider config also pass through correctly, including `branch` and `kind` fields.

## Safety

- iMac-Debian `opencode-web.service` on port 4096: untouched, still active
- No port 18788 listener on iMac-Debian
- Staging clerk on iMac-macOS: probed read-only, not reconfigured
- No kill patterns executed

## SKIP: OC UI Round-Trip (step 08)

No browser available in this headless CLI environment. However, two entries from source `imac-macos-staging` already exist in the JSONL (visible in `evidence/05_log_tail.json`), placed there by a prior `opencode run --attach http://iMac-macOS.local:4096` probe. These entries confirm the full end-to-end path: OpenCode web → `@ai-sdk/openai-compatible` with `options.headers` → office-clerk `/v1/chat/completions` → JSONL log.
