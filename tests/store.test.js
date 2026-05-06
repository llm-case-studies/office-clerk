import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";
import { appendEntry, buildState, buildSummaryText, loadEntries } from "../service/store.js";

test("appendEntry stores updates and buildState keeps latest actor state", async () => {
  const storageDir = await mkdtemp(path.join(os.tmpdir(), "office-clerk-store-"));

  await appendEntry(storageDir, {
    source: "CoD",
    initiative: "repo-orchestration",
    sprint: "init-review",
    status: "reviewing",
    summary: "Checking the hard-mode kickoff",
    nextAction: "Update the result note"
  });

  await appendEntry(storageDir, {
    source: "CoD",
    initiative: "repo-orchestration",
    sprint: "init-review",
    status: "done",
    summary: "Review note committed",
    decision: "Keep taxonomy minimal"
  });

  const entries = await loadEntries(storageDir);
  const state = buildState(entries);

  assert.equal(entries.length, 2);
  assert.equal(state.actors.length, 1);
  assert.equal(state.actors[0].status, "done");
  assert.equal(state.decisions[0].value, "Keep taxonomy minimal");
  assert.match(buildSummaryText(state), /Review note committed/);
});
