# OpenCode Kickoff - Office Clerk Bootstrap

Paste this into the OpenCode session on `Acer-HL` (`DeepSeek` preferred for
this sprint).

```text
You are working in repo `office-clerk` on `Acer-HL`.

Use this as a small bootstrap sprint for a cross-project coordination service.
Keep it boring. This sprint is not where we solve shared sessions, auth,
browser automation, dashboard UI, or hidden orchestration authority.

Sprint:
docs/expert-briefs/initiatives/repo-bootstrap/active/2026-05-06_office-clerk-bootstrap/01-brief.md

Before switching branches, run:

git status --short --branch

If there are uncommitted changes, stop and report them. Do not stash, commit,
or discard anything unless Alex explicitly approves.

Then create the sprint branch:

git fetch origin
git switch -c feature/repo-bootstrap/office-clerk-bootstrap origin/main

If `origin` is not configured yet, or if the repo was only handed to this host
as a local scratch copy, stop and report that blocker instead of inventing a
different branch flow.

If the branch already exists locally, switch to it and report current status
before editing files.

Read first:
- README.md
- docs/expert-briefs/README.md
- docs/architecture/DEFERRED.md
- docs/expert-briefs/initiatives/repo-bootstrap/active/2026-05-06_office-clerk-bootstrap/01-brief.md
- testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/request.md

Your fence:
- README.md
- service/store.js
- service/server.js
- tests/store.test.js
- tests/http.test.js
- testing/initiatives/repo-bootstrap/2026-05-06_office-clerk-bootstrap/request.md, only if implementation exposes extra validation risk

Do not add:
- databases
- auth or multi-user identity
- browser automation
- UI dashboards
- session hijacking or live OpenCode control
- package dependencies that are not clearly needed for sprint 1

Goal:
Ship the smallest credible office-clerk bootstrap:
- POST /v1/log appends structured JSON updates
- GET /v1/state returns current actor state
- GET /v1/summary returns a compact narrative summary
- POST /v1/chat/completions returns a narrow compatibility response backed by the current summary text

Before handoff:
1. Run `node --test`.
2. Run the local HTTP smoke from the testing request.
3. Treat the testing request as the minimum validation floor. If implementation reveals extra edge cases, add them to request.md.
4. Fill a concise implementation note using 02-result-template.md.
5. Commit changes on feature/repo-bootstrap/office-clerk-bootstrap.
6. Push the branch.
7. Do not mark validation PASS yourself. Leave that to `iMac-Debian`.
```
