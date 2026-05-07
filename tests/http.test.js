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
    assert.match(chatPayload.choices[0].message.content, /office-clerk has 2 logged updates/);

    const afterStateResponse = await fetch(`${baseUrl}/v1/state`);
    const afterState = await afterStateResponse.json();
    assert.equal(afterState.totalEntries, 2);
    const chatActor = afterState.actors.find((a) => a.source === "opencode:unknown");
    assert.ok(chatActor);
    assert.match(chatActor.summary, /Summarize current state/);
  } finally {
    server.close();
  }
});

test("chat with hints appends structured entry to log", async () => {
  const storageDir = await mkdtemp(path.join(os.tmpdir(), "office-clerk-hint-"));
  const server = createServer({ storageDir });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const chatResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-office-clerk-source": "acer-hl-test",
        "x-office-clerk-initiative": "clerk-core",
        "x-office-clerk-sprint": "2026-05-07_oc-custom-provider-hookup",
        "x-office-clerk-branch": "feature/clerk-core/oc-custom-provider-hookup",
        "x-office-clerk-kind": "chat",
        "x-office-clerk-tags": "smoke,provider-hookup"
      },
      body: JSON.stringify({
        model: "office-clerk",
        messages: [{ role: "user", content: "test chat with hints" }]
      })
    });
    assert.equal(chatResponse.status, 200);
    const chatPayload = await chatResponse.json();
    assert.equal(chatPayload.object, "chat.completion");

    const stateResponse = await fetch(`${baseUrl}/v1/state`);
    const state = await stateResponse.json();
    assert.equal(state.totalEntries, 1);
    const actor = state.actors[0];
    assert.equal(actor.source, "acer-hl-test");
    assert.equal(actor.initiative, "clerk-core");
    assert.equal(actor.sprint, "2026-05-07_oc-custom-provider-hookup");
    assert.equal(actor.branch, "feature/clerk-core/oc-custom-provider-hookup");
    assert.match(actor.summary, /test chat with hints/);
  } finally {
    server.close();
  }
});

test("chat without hints uses defaults and still appends entry", async () => {
  const storageDir = await mkdtemp(path.join(os.tmpdir(), "office-clerk-nohint-"));
  const server = createServer({ storageDir });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const chatResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "office-clerk",
        messages: [{ role: "user", content: "no hints provided" }]
      })
    });
    assert.equal(chatResponse.status, 200);

    const stateResponse = await fetch(`${baseUrl}/v1/state`);
    const state = await stateResponse.json();
    assert.equal(state.totalEntries, 1);
    const actor = state.actors[0];
    assert.equal(actor.source, "opencode:unknown");
    assert.match(actor.summary, /no hints provided/);
  } finally {
    server.close();
  }
});

test("chat with malformed body returns 400", async () => {
  const storageDir = await mkdtemp(path.join(os.tmpdir(), "office-clerk-malform-"));
  const server = createServer({ storageDir });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const chatResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not valid json"
    });
    assert.equal(chatResponse.status, 400);

    const stateResponse = await fetch(`${baseUrl}/v1/state`);
    const state = await stateResponse.json();
    assert.equal(state.totalEntries, 0);
  } finally {
    server.close();
  }
});
