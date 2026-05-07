Work in:

`/Users/alex/Projects/office-clerk` (on Acer-HL).

Branch:

`feature/clerk-core/oc-custom-provider-hookup`

This sprint is a bounded follow-up. It turns the existing stub
`/v1/chat/completions` seam into a real OpenCode custom-provider hookup
with evidence. It is not a license to redesign the service.

Start with safety:

```bash
cd /Users/alex/Projects/office-clerk
git fetch origin
git status --short --branch
```

If there are uncommitted changes from another lane, stop and report.

The branch already exists on `origin` (cut from `origin/main` by the
orchestrator). Check it out:

```bash
git checkout feature/clerk-core/oc-custom-provider-hookup
git pull --ff-only
```

Read first:

- `README.md`
- `docs/expert-briefs/README.md`
- `docs/expert-briefs/LESSONS.md`
- `docs/expert-briefs/initiatives/clerk-core/README.md`
- `docs/expert-briefs/initiatives/clerk-core/INDEX.md`
- `docs/expert-briefs/initiatives/clerk-core/active/2026-05-07_oc-custom-provider-hookup/README.md`
- `docs/expert-briefs/initiatives/clerk-core/active/2026-05-07_oc-custom-provider-hookup/01-brief.md`
- `testing/initiatives/clerk-core/2026-05-07_oc-custom-provider-hookup/request.md`
- `service/server.js`
- `service/store.js`
- `tests/http.test.js`

Important context:

- `office-clerk` is supporting infrastructure
- `PronunCo` is still the main product focus
- the Acer-HL OpenCode instance is a fair coding-host probe target; the
  iMac-Debian OpenCode instance is off-limits to this implementation work
  (validation handles iMac-Debian)
- do not bind the clerk to anything other than `127.0.0.1`
- do not add auth to the clerk in this sprint
- if OpenCode rejects the endpoint, do not reshape the clerk to chase it —
  record the blocker

Before handoff:

1. make the bounded service/test/doc changes
2. run `node --test`
3. start the server on a non-default port and probe `/v1/chat/completions`
   with curl; confirm the JSONL log grew
4. attempt the OpenCode-as-client step on Acer-HL; record the result
   honestly
5. capture the working config snippet at
   `docs/architecture/oc-provider-hookup.md`
6. update
   `testing/initiatives/clerk-core/2026-05-07_oc-custom-provider-hookup/result.md`
7. commit and push the branch
