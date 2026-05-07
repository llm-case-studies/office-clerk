# OpenCode Custom Provider Hookup

## Hint Mechanism

**Chosen: HTTP headers.** Reason: the OpenAI-compatible `@ai-sdk/openai-compatible`
npm package used by OpenCode passes through custom HTTP headers when
proxying requests to a custom provider base URL. Extension body fields are
not guaranteed to survive the AI SDK's request shaping.

### Headers

| Header | Field | Default |
|---|---|---|
| `x-office-clerk-source` | `source` | `opencode:unknown` |
| `x-office-clerk-initiative` | `initiative` | `null` |
| `x-office-clerk-sprint` | `sprint` | `null` |
| `x-office-clerk-branch` | `branch` | `null` |
| `x-office-clerk-kind` | `kind` | `chat` |
| `x-office-clerk-tags` | `tags` | `[]` (comma-separated) |

### Summary

The latest user message `content` is used as the `summary` field. If no user
message is present, the default summary is `"chat request with no user message"`.

## OpenCode Config Snippet

Place in `~/.config/opencode/opencode.jsonc` (or project-local `opencode.json`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "office-clerk": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Office Clerk",
      "options": {
        "baseURL": "http://127.0.0.1:18788/v1"
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

The provider ID and model ID must match for the `provider/model` selector
(e.g. `office-clerk/office-clerk`).

To add headers automatically from OpenCode, add them to `options.headers`:

```json
"options": {
  "baseURL": "http://127.0.0.1:18788/v1",
  "headers": {
    "x-office-clerk-source": "acer-hl-opencode",
    "x-office-clerk-initiative": "clerk-core",
    "x-office-clerk-sprint": "2026-05-07_oc-custom-provider-hookup"
  }
}
```

### Confirmed Working (2026-05-07)

Tested on iMac-macOS (OpenCode v1.14.41, co-located clerk on 127.0.0.1:18788).
Custom headers defined in `options.headers` are passed through correctly by
OpenCode's `@ai-sdk/openai-compatible` adapter. Each chat interaction produces
two identical chat completion requests to the clerk (~174ms apart), resulting
in two JSONL entries per chat. Both carry the correct header-sourced fields.

## Verification (curl)

Confirmed working via curl:

```bash
curl -fsS http://127.0.0.1:18788/v1/chat/completions \
  -H 'content-type: application/json' \
  -H 'x-office-clerk-source: acer-hl-smoke' \
  -H 'x-office-clerk-initiative: clerk-core' \
  -H 'x-office-clerk-sprint: 2026-05-07_oc-custom-provider-hookup' \
  -d '{"model":"office-clerk","messages":[{"role":"user","content":"smoke test"}]}'
```

Response is a valid OpenAI-shaped chat completion with the current state
summary as the assistant message. The entry appears in `updates.jsonl` with
the expected fields.
