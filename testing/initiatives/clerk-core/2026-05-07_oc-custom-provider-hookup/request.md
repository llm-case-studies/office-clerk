# Test Request - OC Custom Provider Hookup

**Date issued:** 2026-05-07
**Updated:** 2026-05-07 (post-staging-follow-up — validation now targets the
iMac-macOS staging deployment instead of standing up a local clerk)
**Initiative:** `clerk-core`
**Sprint:** `2026-05-07_oc-custom-provider-hookup`
**Product branch:** `feature/clerk-core/oc-custom-provider-hookup`
**Validation branch:** `validation/clerk-core/oc-custom-provider-hookup`
**Validation host:** `iMac-Debian`
**Staging host (probe target):** `iMac-macOS`

## What You Are Validating

The integrated work of this sprint:

1. **Service contract.** `/v1/chat/completions` logs incoming chat requests as
   structured JSONL entries via the same normalization path as `/v1/log` and
   keeps the OpenAI-shaped reply with the current state summary. Verified
   via `node --test` against a local clone and via direct curl probes
   against the staging endpoint.
2. **Header passthrough.** `options.headers` from an OpenCode provider config
   land in the JSONL entries with all expected fields (`source`,
   `initiative`, `sprint`, `branch`, `kind`).
3. **Staging deployment.** office-clerk is reachable on
   `iMac-macOS.local:18788` over the LAN and produces the same shape of
   entries it does locally.
4. **OC web round-trip (skip-allowed).** The OpenCode web instance running
   on `iMac-macOS.local:4096` can drive the `office-clerk/office-clerk`
   provider end-to-end.

You do **not** stand up your own clerk for this validation. The staging
clerk on iMac-macOS is the probe target.

## Important Host Safety

`iMac-Debian` (your host) carries protected local infrastructure:

- `opencode-web.service` on port `4096`

This validation must NOT disturb that:

- do not stop, restart, reload, or kill the existing `opencode-web` process
- do not bind anything new to port `4096` on iMac-Debian
- do not add the office-clerk provider to iMac-Debian's local OpenCode
  config — staging on iMac-macOS is the probe target

`iMac-macOS` (staging host) is read-only for this validation:

- do not modify its `~/.config/opencode/opencode.jsonc`
- do not stop, restart, or reconfigure the staging `office-clerk` service
  (PID at `~/.office-clerk-staging/server.pid` on that host)
- do not stop or reconfigure its `opencode web` instance
- you may read its log file and JSONL via SSH

Unacceptable command shapes (everywhere):

- `kill $(...)`
- `ss ... | head -1 | xargs kill`
- `lsof ... | head -1 | xargs kill`
- `pkill -f node`
- `pkill -f opencode`

If anything looks unsafe, skip it and explain in the result note.

## Product Commit Under Test

```bash
cd /home/alex/Projects/office-clerk
git fetch origin
git checkout feature/clerk-core/oc-custom-provider-hookup
git pull --ff-only
git rev-parse HEAD
```

Should match `f051a8c` or a later commit on this branch.

Save as `evidence/00_commit.txt`.

## Preflight - Staging Reachability

```bash
ping -c 2 iMac-macOS.local
ssh iMac-macOS.local 'hostname; uptime'
ssh iMac-macOS.local '
  cat ~/.office-clerk-staging/server.pid &&
  ps -p $(cat ~/.office-clerk-staging/server.pid) -o pid,etime,command
'
ssh iMac-macOS.local 'pgrep -lf "opencode web" | head -3'
```

Save as `evidence/01_staging_health.txt`.

## Static Checks On Local Clone

Run the test suite against the product branch on iMac-Debian (no server
start needed — the test suite spins up ephemeral instances itself):

```bash
node --test
```

Save as `evidence/02_node_test.txt`. All tests should pass.

## LAN Probes Against Staging

```bash
curl -fsS http://iMac-macOS.local:18788/health
```

Save as `evidence/03_health.json`.

```bash
curl -fsS -X POST http://iMac-macOS.local:18788/v1/chat/completions \
  -H 'content-type: application/json' \
  -H 'x-office-clerk-source: imac-debian-validation' \
  -H 'x-office-clerk-initiative: clerk-core' \
  -H 'x-office-clerk-sprint: 2026-05-07_oc-custom-provider-hookup' \
  -d '{"model":"office-clerk","messages":[{"role":"user","content":"validation probe from imac-debian"}]}'
```

Save the response as `evidence/04_chat_response.json`.

## Log Assertion (via SSH to staging)

```bash
ssh iMac-macOS.local 'tail -3 ~/.office-clerk-staging/runtime/updates.jsonl'
```

Save as `evidence/05_log_tail.json`.

Verify the latest entry from your curl probe:

- `source` is `imac-debian-validation`
- `initiative` is `clerk-core`
- `sprint` is `2026-05-07_oc-custom-provider-hookup`
- `summary` matches the user message content
- shape is consistent with what `/v1/log` produces

## State Echo Probe

```bash
curl -fsS http://iMac-macOS.local:18788/v1/state
curl -fsS http://iMac-macOS.local:18788/v1/summary
```

Save as `evidence/06_state.json` and `evidence/07_summary.json`.

Confirm `imac-debian-validation` appears in `state.actors`.

## OpenCode UI Round-Trip (Skip-Allowed)

Open `http://iMac-macOS.local:4096` in a browser (the staging OC web
instance is currently unsecured per the architecture note — no password
prompt expected). Pick the `office-clerk/office-clerk` model. Send any
short message such as `"ui validation probe from imac-debian"`.

Confirm via SSH:

```bash
ssh iMac-macOS.local 'tail -2 ~/.office-clerk-staging/runtime/updates.jsonl'
```

Two new entries should appear (OpenCode sends two requests per chat — DS
documented this in the architecture note). Their `source` will be
`imac-macos-staging` (from staging's `options.headers`), not your validator
value, because the headers come from staging's `opencode.jsonc`. That's
expected.

If a browser or LAN access to iMac-macOS:4096 is impractical, mark this
section SKIP-with-reason in the result.

Save as `evidence/08_oc_ui_probe.txt`.

## Cleanup

You should not have started any server or process on iMac-Debian. Confirm:

```bash
ss -tlnp 2>/dev/null | grep -E ':(4096|18788)\s' || echo "no listeners on iMac-Debian — expected"
systemctl --user is-active opencode-web 2>/dev/null
```

Save as `evidence/09_cleanup.txt`. The protected `opencode-web.service` on
iMac-Debian should still be active and unchanged.

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
