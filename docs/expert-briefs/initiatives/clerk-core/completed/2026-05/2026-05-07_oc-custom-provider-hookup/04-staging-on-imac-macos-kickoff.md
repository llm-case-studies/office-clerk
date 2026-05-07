# Follow-Up Kickoff - Staging On iMac-macOS

This is a follow-up extension to the same sprint
(`2026-05-07_oc-custom-provider-hookup`). It closes the OC-UI-probe
blocker the implementation result note flagged on Acer-HL by moving the
probe to a fresh staging host (`iMac-macOS`) where the OC instance is
brought up from a clean slate with the office-clerk provider config in
place from the start.

The staging install also turns iMac-macOS into the office-clerk shared
host going forward. From this sprint onward, mac-mini, Acer-HL, and
iMac-Debian client OCs point at the iMac-macOS clerk rather than each
running their own. That cross-client config rewiring is a separate
orchestrator setup task, not part of this sprint.

## Where To Work

- coding host: `Acer-HL` (you, DeepSeek)
- staging host: `iMac-macOS` (you SSH into it)

The trust web is wired up. From Acer-HL: `ssh iMac-macOS.local` works
key-based via `~/.ssh/funhome-local` and the `Host iMac-macOS ...` entry
in `~/.ssh/config`.

## Branch

Stay on `feature/clerk-core/oc-custom-provider-hookup`. Pull the latest
from origin first; orchestrator may have added docs:

```bash
cd /home/alex/Projects/office-clerk
git fetch origin
git checkout feature/clerk-core/oc-custom-provider-hookup
git pull --ff-only
```

Your prior commits stay; new work goes on top.

## Read First

- `docs/expert-briefs/initiatives/clerk-core/active/2026-05-07_oc-custom-provider-hookup/01-brief.md`
  (original sprint scope — still applies)
- `docs/architecture/oc-provider-hookup.md` (your earlier architecture note,
  including the "untested" caveat about `options.headers` — already partially
  closed by mac-mini probe)
- `testing/initiatives/clerk-core/2026-05-07_oc-custom-provider-hookup/result.md`
  (your prior implementation result, including the open questions you flagged)

## Tasks

### 1. Verify prerequisites on iMac-macOS

```bash
ssh iMac-macOS.local 'which brew && brew --version | head -1'
ssh iMac-macOS.local 'ssh -T git@github.com 2>&1 | head -1'
```

Brew should be present (it's an existing macOS dev host). GitHub SSH was
fixed by the orchestrator already — `Hi llm-case-studies!` is the success
message.

If brew is missing, install it via the official one-liner from
`https://brew.sh`. If GitHub SSH fails, stop and report — the orchestrator
will fix it.

### 2. Install node and OpenCode on iMac-macOS

```bash
ssh iMac-macOS.local 'brew install node'
ssh iMac-macOS.local 'curl -fsSL https://opencode.ai/install | bash'
ssh iMac-macOS.local 'opencode --version || ~/.opencode/bin/opencode --version'
```

Use whichever install path matches what Acer-HL and iMac-Debian have. If
the install needs interactive auth (e.g., browser-based first-run for
OpenCode), document that as a stop condition rather than improvising.

### 3. Clone office-clerk on iMac-macOS

```bash
ssh iMac-macOS.local '
  mkdir -p ~/Projects
  cd ~/Projects
  git clone git@github.com:llm-case-studies/office-clerk.git
  cd office-clerk
  git checkout feature/clerk-core/oc-custom-provider-hookup
  git rev-parse HEAD
'
```

Confirm the checkout sits at the same SHA as Acer-HL.

### 4. Run the office-clerk service bound to LAN

The current `service/server.js` already reads `HOST` and `PORT` env vars.
Bind to `0.0.0.0` so other hosts on the LAN can reach it; pick a
predictable storage dir under `~/.office-clerk-staging/`:

```bash
ssh iMac-macOS.local '
  mkdir -p ~/.office-clerk-staging/runtime
  cd ~/Projects/office-clerk
  HOST=0.0.0.0 PORT=18788 \
    OFFICE_CLERK_STORAGE_DIR=~/.office-clerk-staging/runtime \
    nohup node service/server.js \
      >~/.office-clerk-staging/server.log 2>&1 &
  echo $! >~/.office-clerk-staging/server.pid
  sleep 1
'
```

Verify health from Acer-HL:

```bash
curl -fsS http://iMac-macOS.local:18788/health
```

Track the PID. Don't start it as a launchd service this sprint — that's
deferred to a later persistence sprint.

### 5. Configure OpenCode on iMac-macOS

Add the office-clerk provider to iMac-macOS's
`~/.config/opencode/opencode.jsonc`. Since OC and the clerk are
co-located, `127.0.0.1:18788` works; that also avoids a network hop and a
LAN-vs-localhost edge case for this first probe.

Use the snippet shape the orchestrator already verified on mac-mini
(`docs/architecture/oc-provider-hookup.md`), but with `source` set to
`imac-macos-staging` and `branch` set to
`feature/clerk-core/oc-custom-provider-hookup` so the resulting log
entries are clearly attributable.

### 6. Start OpenCode web on iMac-macOS

Default port 4096 is fine — iMac-macOS isn't running anything else
there. Standard `opencode web --hostname 0.0.0.0 --port 4096`
invocation. Capture the OPENCODE_SERVER_PASSWORD that gets generated (or
the auth setup notes) so you can hit the UI from a browser.

### 7. End-to-end probe

From a browser on Acer-HL (or mac-mini — orchestrator can help drive),
open `http://iMac-macOS.local:4096`, authenticate, select the
`office-clerk/office-clerk` model, send a chat such as
`"staging probe from imac-macos OpenCode web"`.

Confirm a new entry appears in
`~/.office-clerk-staging/runtime/updates.jsonl` on iMac-macOS. Capture:

- the OC config snippet that worked
- the JSONL entry shape (one or two lines OC produced — the mac-mini
  probe saw two requests per chat; record what staging shows)
- request/response timings if obvious

### 8. Update result.md and architecture note

Append to
`testing/initiatives/clerk-core/2026-05-07_oc-custom-provider-hookup/result.md`
a "Staging Round-Trip On iMac-macOS" section recording verdict, the
config used, what landed in the JSONL, and any new findings.

In `docs/architecture/oc-provider-hookup.md`, replace the
`however, this is untested` caveat about `options.headers` with a
short confirmation note (mac-mini probe already validated headers; this
adds the multi-host LAN-deployed case).

### 9. Commit and push

Stay on `feature/clerk-core/oc-custom-provider-hookup`. Push.

The next step after you're done is iMac-Debian validation — the
orchestrator will update the testing request to point at the staging
deployment rather than a local-only validation, then hand it to the
tester.

## Stop Conditions

- If OpenCode install on iMac-macOS requires interactive browser auth you
  cannot provide non-interactively, stop and report. Don't fall back to
  weird workarounds (storage-file edits, etc.) — same rule as the
  original brief.
- If `node` install fails (brew missing, network issue, etc.), stop.
- If LAN binding (`HOST=0.0.0.0`) trips a host firewall the user hasn't
  pre-authorized, stop and report — don't open firewall rules silently.
- If the OC web round-trip works at the wire level but the JSONL entry
  shape is wrong, that's a real defect — surface it instead of patching
  to make symptoms go away.

## Out Of Scope

- auth on the clerk service (separate sprint when LAN exposure
  warrants it)
- launchd / systemd persistent service definition (separate sprint)
- updating mac-mini, Acer-HL, iMac-Debian client OC configs to point at
  iMac-macOS (orchestrator setup task, not coding work)
- merging to `main` (waits for iMac-Debian validation)
