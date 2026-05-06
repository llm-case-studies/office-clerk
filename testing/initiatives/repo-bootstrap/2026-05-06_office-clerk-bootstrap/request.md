# Test Request - Office Clerk Bootstrap

**Date issued:** 2026-05-06
**Initiative:** `repo-bootstrap`
**Sprint:** `2026-05-06_office-clerk-bootstrap`
**Target branch:** `feature/repo-bootstrap/office-clerk-bootstrap`
**Validation branch:** `validation/repo-bootstrap/office-clerk-bootstrap`
**Validation host:** `iMac-Debian`

## What You Are Validating

That sprint 1 stays small while proving the basic clerk loop:

1. append structured updates
2. read current actor state
3. read a compact summary
4. hit the narrow chat-compatible seam
5. return honest 400 errors for bad input

## Prerequisites

- the implementer has pushed `feature/repo-bootstrap/office-clerk-bootstrap`
- Node is available on `iMac-Debian`
- no `npm` dependency is required for the validation flow

If the target branch is not pushed yet, or `origin` is not configured, record
that blocker and stop instead of validating a different branch.

## Branch Setup

```bash
git status --short --branch
git fetch origin
git switch -c validation/repo-bootstrap/office-clerk-bootstrap origin/feature/repo-bootstrap/office-clerk-bootstrap
```

If the branch already exists locally, switch to it and record current SHA.

## Evidence Paths

Write the result to:

```text
testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/result.md
```

Put raw output under:

```text
testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/evidence/
```

## Local Service Bring-Up

Run from the repo root on `iMac-Debian`:

```bash
mkdir -p testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/evidence
export OC_EVID=testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/evidence
export OFFICE_CLERK_STORAGE_DIR="$PWD/.tmp/office-clerk-validation-store"
rm -rf "$OFFICE_CLERK_STORAGE_DIR"
mkdir -p "$OFFICE_CLERK_STORAGE_DIR"
node service/server.js > "$OC_EVID/00_server.log" 2>&1 &
echo $! > "$OC_EVID/server.pid"
```

Wait for health:

```bash
curl -s http://127.0.0.1:8788/health | tee "$OC_EVID/01_health.json"
```

## Probe Sequence

```bash
export OC_BASE=http://127.0.0.1:8788

# 1. first structured update
curl -s -X POST "$OC_BASE/v1/log" \
  -H 'Content-Type: application/json' \
  -d '{"source":"CoMM","initiative":"repo-bootstrap","sprint":"office-clerk-bootstrap","status":"coding","summary":"Bootstrap service is running","nextAction":"hand off to validation"}' \
  | tee "$OC_EVID/02_log_comm.json"

# 2. second structured update from another actor
curl -s -X POST "$OC_BASE/v1/log" \
  -H 'Content-Type: application/json' \
  -d '{"source":"CoD","initiative":"repo-bootstrap","sprint":"office-clerk-bootstrap","status":"reviewing","summary":"Validation lane is ready","blocker":"none"}' \
  | tee "$OC_EVID/03_log_cod.json"

# 3. current state
curl -s "$OC_BASE/v1/state" | tee "$OC_EVID/04_state.json"

# 4. summary
curl -s "$OC_BASE/v1/summary" | tee "$OC_EVID/05_summary.json"

# 5. chat-compatible seam
curl -s -X POST "$OC_BASE/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d '{"model":"office-clerk-bootstrap","messages":[{"role":"user","content":"Summarize current state"}]}' \
  | tee "$OC_EVID/06_chat_completion.json"

# 6. invalid payload should fail honestly
curl -s -w '\nHTTP %{http_code}\n' -X POST "$OC_BASE/v1/log" \
  -H 'Content-Type: application/json' \
  -d '{"summary":"missing source"}' \
  | tee "$OC_EVID/07_invalid_log.txt"
```

Stop the service when done:

```bash
kill "$(cat "$OC_EVID/server.pid")"
```

## Pass Criteria

- `/health` returns 200 and identifies `office-clerk`.
- Both log writes return success and append entries.
- `/v1/state` reports `totalEntries: 2` and includes both `CoMM` and `CoD`.
- `/v1/summary` mentions that `office-clerk` has 2 logged updates.
- `/v1/chat/completions` returns `object: "chat.completion"` and a message content based on the current summary.
- Invalid log payload returns HTTP 400 with JSON `detail`.
- Validation does not require extra services, databases, browsers, or hidden host setup.

## Fail Criteria

- the validator has to guess branch flow or missing setup
- any endpoint returns 500 for the basic flow
- state aggregation drops actors unexpectedly
- the chat-compatible seam pretends to do more than summary reflection

## What To Record In `result.md`

- final branch tip SHA
- validation branch SHA
- PASS / FAIL / PARTIAL verdict
- which probes passed
- any surprise that should become a follow-up sprint
