# Test Request - OC Custom Provider Hookup

**Date issued:** 2026-05-07
**Initiative:** `clerk-core`
**Sprint:** `2026-05-07_oc-custom-provider-hookup`
**Product branch:** `feature/clerk-core/oc-custom-provider-hookup`
**Validation branch:** `validation/clerk-core/oc-custom-provider-hookup`
**Validation host:** `iMac-Debian`

## What You Are Validating

That `office-clerk` `/v1/chat/completions` now:

1. logs incoming chat requests as structured JSONL entries via the same
   normalization path as `/v1/log`
2. preserves an OpenAI-shaped response with the current state summary
3. is reachable as a custom OpenAI-compatible provider from a real OpenCode
   WebUI (probed only if it can be done without disturbing `opencode-web`)
4. does not need anything beyond `127.0.0.1` for this sprint

## Important Host Safety

`iMac-Debian` already carries protected local infrastructure:

- `opencode-web.service` on port `4096`

This validation must NOT disturb that. Specifically:

- do not stop, restart, reload, or kill the existing `opencode-web` process
- do not bind anything else to port `4096`
- start the office-clerk test instance on a different port (e.g. `18788`)
  and record its PID
- clean up only via that tracked PID

Unacceptable command shapes:

- `kill $(...)`
- `ss ... | head -1 | xargs kill`
- `lsof ... | head -1 | xargs kill`
- `pkill -f node`

If you cannot do something safely, skip it and explain in the result.

## Product Commit Under Test

```bash
cd /Users/alex/Projects/office-clerk
git fetch origin
git checkout feature/clerk-core/oc-custom-provider-hookup
git pull --ff-only
git rev-parse HEAD
```

Save as `evidence/00_commit.txt`.

## Preflight Capture

```bash
mkdir -p "$HOME/.office-clerk-validation/2026-05-07-hookup/runtime"
ss -tlnp 2>/dev/null | grep -E ':(4096|18788)\s' || true
systemctl --user is-active opencode-web 2>/dev/null || true
```

Save as `evidence/01_preflight.txt`.

## Static Checks

```bash
node --test
```

Save as `evidence/02_node_test.txt`.

## Run And Probe

Start the test instance:

```bash
OFFICE_CLERK_STORAGE_DIR="$HOME/.office-clerk-validation/2026-05-07-hookup/runtime" \
PORT=18788 \
node service/server.js > "$HOME/.office-clerk-validation/2026-05-07-hookup/server.log" 2>&1 &
echo $! > "$HOME/.office-clerk-validation/2026-05-07-hookup/server.pid"
sleep 1
```

Verify health:

```bash
curl -fsS http://127.0.0.1:18788/health
```

Save as `evidence/03_health.json`.

## Chat Request

Send a chat using the hint mechanism documented in the result note for this
sprint. The example below assumes the header path was chosen — adjust to
match whichever mechanism the result note says was implemented.

```bash
curl -fsS http://127.0.0.1:18788/v1/chat/completions \
  -H 'content-type: application/json' \
  -H 'x-office-clerk-source: imac-debian-validation' \
  -H 'x-office-clerk-initiative: clerk-core' \
  -H 'x-office-clerk-sprint: 2026-05-07_oc-custom-provider-hookup' \
  -d '{"model":"office-clerk","messages":[{"role":"user","content":"validation probe — please log this"}]}'
```

Save the request body and the response as:

```text
evidence/04_chat_request.json
evidence/05_chat_response.json
```

## Log Assertion

```bash
tail -1 "$HOME/.office-clerk-validation/2026-05-07-hookup/runtime/updates.jsonl"
```

Save as `evidence/06_log_tail.json`.

Verify the entry:

- has non-null `source` and non-empty `summary`
- has the hint values for `initiative` and `sprint` if hints were used
- `summary` matches the user message content
- shape is consistent with what `/v1/log` produces

## State Echo Probe

```bash
curl -fsS http://127.0.0.1:18788/v1/state
curl -fsS http://127.0.0.1:18788/v1/summary
```

Save as `evidence/07_state.json` and `evidence/08_summary.json`.

Confirm the new actor appears in `state.actors`.

## Real OpenCode Probe (Skip-Allowed)

If — and only if — it can be done without touching `opencode-web.service`,
configure the iMac-Debian OpenCode instance to use office-clerk as a
custom OpenAI-compatible provider on `http://127.0.0.1:18788/v1`. Send a
chat from the UI. Confirm the new entry appears.

If this step would risk perturbing the protected service, SKIP it and note
why in `evidence/09_oc_ui_probe.txt`.

## Cleanup

```bash
PID=$(cat "$HOME/.office-clerk-validation/2026-05-07-hookup/server.pid")
kill "$PID" 2>/dev/null || true
sleep 1
ps -p "$PID" >/dev/null 2>&1 && echo "WARN: pid $PID still alive" || echo "test pid cleaned"
rm -rf "$HOME/.office-clerk-validation/2026-05-07-hookup"
ss -tlnp 2>/dev/null | grep -E ':(4096|18788)\s' || true
systemctl --user is-active opencode-web 2>/dev/null || true
```

Save as `evidence/10_cleanup.txt`.

Confirm:

- the test process is gone
- `opencode-web.service` is still active and unchanged
- port `4096` is still bound by the original service

## Result

Fill:

```text
testing/initiatives/clerk-core/2026-05-07_oc-custom-provider-hookup/result.md
```

Verdict options: `PASS`, `PASS with findings`, `FAIL`, `BLOCKED`.

Commit result and evidence to:

```text
validation/clerk-core/oc-custom-provider-hookup
```

Push the validation branch.
