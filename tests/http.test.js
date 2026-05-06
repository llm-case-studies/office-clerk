import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp } from "node:fs/promises";
import { createServer } from "../service/server.js";

test("HTTP bootstrap supports log, state, summary, and chat completion endpoints", async () => {
  const storageDir = await mkdtemp(path.join(os.tmpdir(), "office-clerk-http-"));
  const server = createServer({ storageDir });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const logResponse = await fetch(`${baseUrl}/v1/log`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "CoMM",
        initiative: "repo-bootstrap",
        sprint: "office-clerk-bootstrap",
        status: "coding",
        summary: "Minimal service skeleton is in place",
        blocker: "No remote configured yet"
      })
    });
    assert.equal(logResponse.status, 201);

    const stateResponse = await fetch(`${baseUrl}/v1/state`);
    const state = await stateResponse.json();
    assert.equal(state.totalEntries, 1);
    assert.equal(state.actors[0].source, "CoMM");

    const summaryResponse = await fetch(`${baseUrl}/v1/summary`);
    const summaryPayload = await summaryResponse.json();
    assert.match(summaryPayload.summary, /Minimal service skeleton/);

    const chatResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "office-clerk-bootstrap",
        messages: [{ role: "user", content: "Summarize current state" }]
      })
    });
    const chatPayload = await chatResponse.json();
    assert.equal(chatResponse.status, 200);
    assert.equal(chatPayload.object, "chat.completion");
    assert.match(chatPayload.choices[0].message.content, /office-clerk has 1 logged update/);
  } finally {
    server.close();
  }
});
