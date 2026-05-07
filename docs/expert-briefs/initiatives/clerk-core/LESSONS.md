# Clerk Core Lessons Log

Initiative-specific lessons. Append-as-you-go.

## OpenCode Custom Provider Seam

- The `@ai-sdk/openai-compatible` adapter that OpenCode uses for custom
  providers passes `options.headers` through to the upstream endpoint
  unchanged. That is the right place to attach `x-office-clerk-*` hint
  metadata; extension fields in the request body are not guaranteed to
  survive the AI SDK's request shaping.
- OpenCode issues **two** chat-completion requests per single chat
  interaction (~170ms apart, identical body). Confirmed on both
  mac-mini OC desktop and iMac-macOS OC web staging. Each lands as its
  own JSONL entry. This is normal adapter behavior, not a clerk defect.
  If duplicate entries become noisy, dedup downstream — do not rewrite
  the clerk's normalization path.
- The provider ID and the inner model ID must match for the
  `provider/model` selector to resolve cleanly (e.g.
  `office-clerk/office-clerk`).

## Staging As An Implementation-Probe Workaround

- When the implementation host's OC environment cannot be safely
  perturbed (running web UI predates the new config, restart needs
  interactive auth, `opencode run` is broken in a way unrelated to the
  feature), standing up a clean staging OC on a different host closes
  the round-trip without forcing the implementer to wrestle the host's
  OC environment. iMac-macOS played that role for sprint 2.
- The pattern generalizes: if a feature needs a working OC client to
  validate end-to-end, prefer a clean OC bring-up on staging over
  fighting an existing daily-driver OC.

## Hint Header Surface

- `x-office-clerk-source` (default `opencode:unknown`)
- `x-office-clerk-initiative`, `x-office-clerk-sprint`,
  `x-office-clerk-branch`, `x-office-clerk-kind` (default `chat`),
  `x-office-clerk-tags` (comma-separated)
- The `summary` is taken from the latest user message `content`. With
  no user message present, it defaults to
  `"chat request with no user message"`.
- All fields are optional. Default behavior is honest, not silently
  failing.

## Staging Deployment (current as of 2026-05-07)

- Host: `iMac-macOS.local`
- Clerk: bound `0.0.0.0:18788`, storage at
  `~/.office-clerk-staging/runtime/`, PID at
  `~/.office-clerk-staging/server.pid`
- OC web: bound `0.0.0.0:4096`, currently unsecured (LAN-only)
- Both are `nohup`-backgrounded; survival across reboots is a follow-up
  sprint (`clerk-staging-persistence`)
