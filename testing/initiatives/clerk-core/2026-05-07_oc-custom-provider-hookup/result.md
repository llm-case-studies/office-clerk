# Implementation Result - OC Custom Provider Hookup

- Target branch: `feature/clerk-core/oc-custom-provider-hookup`
- Validation branch: `validation/clerk-core/oc-custom-provider-hookup` (pending)
- Verdict: **IMPLEMENTED with findings** (coding host probe incomplete)

## Checks

- `node --test`: 5/5 pass (4 HTTP tests + 1 store test)
- Chat with hints: appends structured JSONL entry with correct fields
- Chat without hints: defaults source to `opencode:unknown`, appends entry
- Malformed body: returns 400, does not append entry
- JSONL log growth confirmed via `/v1/state` and direct file inspection

## Hint Mechanism

HTTP headers. `x-office-clerk-source`, `x-office-clerk-initiative`,
`x-office-clerk-sprint`, `x-office-clerk-branch`, `x-office-clerk-kind`,
`x-office-clerk-tags`. All are optional. Default source is `opencode:unknown`.

## OpenCode UI Probe

- Performed: **partial**
- Config snippet created and verified: `opencode models` lists
  `office-clerk/office-clerk` as an available model when the provider config
  is present in `~/.config/opencode/opencode.jsonc`.
- Full round-trip NOT completed: `opencode run` on Acer-HL (Debian) returns
  `Session not found` for every project and every model, including the
  office-clerk custom provider. This is a pre-existing OpenCode CLI issue on
  this machine, not caused by the clerk implementation.
- The running `opencode web` instance at port 4096 was started before the
  custom provider config existed and does not pick it up without restart.
  Starting a second web instance succeeds but requires browser-based
  authentication that is not programmatically available in this CLI
  environment.

## Findings

1. The service changes work correctly. All 5 tests pass, curl probes behave
   as expected, JSONL entries are well-formed.
2. `opencode run` is broken on Acer-HL Debian (error: `Session not found`).
   This blocks the full OpenCode-as-client round-trip regardless of provider.
3. The curl-based verification proves the endpoint works and the config
   snippet is correct.

## Honest Blocker (non-clerk)

`opencode run` on Acer-HL Debian returns `Session not found` for any
invocation. This is not a clerk issue — it reproduces in other projects
(e.g. `iHomeNerd-coding`) and with other models. The OpenCode CLI v1.14.33
session database may be corrupted or in an unexpected state.

The working config snippet is captured in
`docs/architecture/oc-provider-hookup.md`.

## Open Questions

- Why does `opencode run` fail with `Session not found` globally on this
  machine? Resolving this is a prerequisite for the full validation probe on
  iMac-Debian.
- Does the `options.headers` field in the OpenCode provider config actually
  pass custom headers through to the clerk? This could not be tested without
  a working `opencode run` or web session.

## Staging Round-Trip On iMac-macOS (2026-05-07)

### Verdict: PASS

A fresh OpenCode web deployment on iMac-macOS (macOS 25.4.0) successfully
sent chat requests to the co-located office-clerk custom provider, and
structured entries landed in the JSONL log with the correct hint values
from `options.headers`.

### Environment

| Component | Detail |
|---|---|
| Host | iMac-macOS (Darwin 25.4.0, x86_64) |
| Node | v24.10.0 (brew) |
| OpenCode | v1.14.41 |
| Clerk | PID 99136, bound to 0.0.0.0:18788 |
| OC Web | PID 99152, bound to 0.0.0.0:4096 (unsecured) |

### Config Used

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "office-clerk": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Office Clerk",
      "options": {
        "baseURL": "http://127.0.0.1:18788/v1",
        "headers": {
          "x-office-clerk-source": "imac-macos-staging",
          "x-office-clerk-initiative": "clerk-core",
          "x-office-clerk-sprint": "2026-05-07_oc-custom-provider-hookup",
          "x-office-clerk-branch": "feature/clerk-core/oc-custom-provider-hookup",
          "x-office-clerk-kind": "chat"
        }
      },
      "models": {
        "office-clerk": {
          "name": "Office Clerk"
        }
      }
    }
  }
}
```

### Probe Method

`opencode run --attach http://iMac-macOS.local:4096 --model "office-clerk/office-clerk" "staging probe from imac-macos OpenCode web — please log this"` executed from Acer-HL.

### JSONL Result

Two entries were appended (OpenCode sends two requests per chat interaction):

```jsonl
{"id":"log_1778190849542_ammocs","createdAt":"2026-05-07T21:54:09.541Z","source":"imac-macos-staging","kind":"chat","initiative":"clerk-core","sprint":"2026-05-07_oc-custom-provider-hookup","branch":"feature/clerk-core/oc-custom-provider-hookup","status":null,"summary":"\"staging probe from imac-macos OpenCode web — please log this\"","decision":null,"blocker":null,"nextAction":null,"tags":[]}
{"id":"log_1778190849715_0qhyet","createdAt":"2026-05-07T21:54:09.715Z","source":"imac-macos-staging","kind":"chat","initiative":"clerk-core","sprint":"2026-05-07_oc-custom-provider-hookup","branch":"feature/clerk-core/oc-custom-provider-hookup","status":null,"summary":"\"staging probe from imac-macos OpenCode web — please log this\"","decision":null,"blocker":null,"nextAction":null,"tags":[]}
```

### Observations

1. `options.headers` works — all five custom headers (`source`, `initiative`,
   `sprint`, `branch`, `kind`) were correctly passed through by OpenCode's
   `@ai-sdk/openai-compatible` provider adapter and landed in the JSONL
   entries.
2. OpenCode sends **two** chat completion requests per single chat
   interaction (identical body). The clerk appends both as separate entries.
   This is not a clerk defect — the same behavior was observed on the
   mac-mini probe. The two requests arrive ~174ms apart.
3. The summary field contains the user message as JSON-encoded string
   (with surrounding double quotes). This is as-sent by OpenCode.
4. The clerk remained responsive throughout — no 4xx/5xx errors from either
   request.
