# office-clerk Expert Briefs

This repo follows the same small expert-brief rhythm used in `iHomeNerd`:

1. name the implementation host
2. name the working branch
3. name the merge target
4. name the validation lane
5. provide a paste-ready kickoff prompt
6. leave a runnable testing request behind

The point is to keep one real lane active at a time, avoid hidden coordination
magic, and make handoff honest when coding and validation happen on different
machines.

## Sprint Pack Shape

Each live sprint should carry:

```text
00-opencode-kickoff.md
01-brief.md
02-result-template.md
03-merge-note-template.md
```

The paired validation path lives under:

```text
testing/initiatives/<initiative>/<sprint-slug>/
```

`00-opencode-kickoff.md` is the paste-ready host note.
`01-brief.md` is the execution fence and success condition.
`02-result-template.md` is the implementer-side note shape.
`03-merge-note-template.md` is the short merge summary once validation passes.

Validation happens separately. Do not mark validation PASS from the coding
lane.
