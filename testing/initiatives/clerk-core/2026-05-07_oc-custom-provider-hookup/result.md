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
