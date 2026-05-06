# office-clerk

`office-clerk` is a small cross-project coordination service.

It is meant to help orchestrators and agents exchange short, structured updates
without pretending to be the source of truth for product work.

## What It Is

- a place to append structured updates
- a place to read compact current state
- a place to keep append-only local records
- a small compatibility seam for AI-shaped callers

## What It Is Not

- a hidden governor over repos
- an autonomous merge authority
- a replacement for sprint briefs, testing requests, or result notes
- a giant orchestration platform

## Sprint 1 Scope

Sprint 1 is intentionally small:

- one local repo
- one bootstrap sprint
- one append-only log endpoint
- one current-state endpoint
- one narrow chat-compatible endpoint

## Endpoints

- `GET /health`
- `POST /v1/log`
- `GET /v1/state`
- `GET /v1/summary`
- `POST /v1/chat/completions`

## Run

```bash
node --test
node service/server.js
```

Default bind:

- `http://127.0.0.1:8788`

Default runtime storage:

- `storage/runtime/updates.jsonl`
