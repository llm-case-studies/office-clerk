# Lessons Learned

These lessons are intentionally short and only capture what sprint 1 actually
proved.

## Bootstrap Scope

- Keep the first real lane small.
- A tiny service plus explicit validation is better than a clever but fuzzy
  orchestration platform.
- A narrow OpenAI-shaped seam is acceptable when it is obviously reflective and
  not pretending to be a general intelligence layer.

## Persistence

- File-backed append-only JSONL was the right first persistence choice.
- It is simple enough to validate, inspect, and recover.
- Do not replace it with a database until the product shape demands it.

## Validation Discipline

- Validation should live on its own `validation/...` branch.
- Evidence belongs in the repo, not only in chat transcripts.
- Result notes should record both product behavior and host-safety findings when
  shared infrastructure is involved.

## Shared Host Safety

- Never use blind kill patterns on shared validation hosts.
- Commands shaped like `kill $(...)`, `ss ... | head -1`, or `lsof ... | head -1 | xargs kill`
  are unacceptable when unrelated long-running services may be present.
- Test services must be started with a tracked PID and cleaned up only through
  that PID.
- If a host carries protected local infrastructure such as `opencode-web.service`,
  say so explicitly in the request and treat it as off-limits.

## Host Roles

- Coding host, validation host, and protected local service host are not always
  interchangeable.
- If a sprint depends on a shared service already running on the validation
  host, validation instructions must avoid disturbing it.

## What Sprint 1 Did Not Prove

- It did not prove live posting into OpenCode sessions.
- It did not prove auth, multi-user identity, or remote synchronization.
- It did not prove that `office-clerk` should become a large control plane.

Those remain follow-up questions, not implied truths.
