# Follow-Up Note

Sprint 1 is complete and validated.

What is now proven:

- separate repo works
- lightweight sprint/testing structure works
- append-only clerk storage works
- compact summary/state endpoints work
- validation branch flow works

What should **not** happen next:

- do **not** jump straight into auth, browser UI, or OpenCode session injection
- do **not** turn the repo into a general orchestration platform in one leap
- do **not** normalize unsafe host-side kill patterns in any future request

## Recommended Next Step

If a second sprint is cut now, it should be a bounded `clerk-core` sprint:

- `panel-runner-bootstrap`

That sprint should stay small and solve only the next useful layer above the
current clerk loop.

## Suggested Panel-Runner Scope

Good sprint-2 scope:

- accept a panel definition
- record participant submissions or summaries
- keep per-round artifacts explicit
- return a compact synthesis-ready state view

Still out of scope:

- live OpenCode session control
- direct browser automation
- hidden merge/governance authority
- speculative workflow engines

## Safety Carry-Forward

Any validation request written after sprint 1 should explicitly state:

- whether protected local services exist on the validation host
- which ports are reserved
- how the test service PID is recorded
- how cleanup is scoped only to that PID

## Human Review Gate

Before a new orchestrator starts sprint 2, they should read:

- `README.md`
- `docs/expert-briefs/README.md`
- `docs/expert-briefs/LESSONS.md`
- this follow-up note

That is enough context to continue without pretending the repo has more proven
architecture than it actually does.
