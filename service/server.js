import http from "node:http";
import process from "node:process";
import { pathToFileURL } from "node:url";
import {
  appendEntry,
  buildState,
  buildSummaryText,
  loadEntries,
  resolveStorageDir
} from "./store.js";

function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) {
    throw new Error("expected JSON body");
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("invalid JSON body");
  }
}

function buildChatCompletion(summaryText) {
  const created = Math.floor(Date.now() / 1000);
  return {
    id: `chatcmpl_${created}`,
    object: "chat.completion",
    created,
    model: "office-clerk-bootstrap",
    choices: [
      {
        index: 0,
        finish_reason: "stop",
        message: {
          role: "assistant",
          content: summaryText
        }
      }
    ]
  };
}

export function createServer(options = {}) {
  const storageDir = resolveStorageDir(options.storageDir);

  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");

      if (request.method === "GET" && url.pathname === "/health") {
        json(response, 200, {
          ok: true,
          service: "office-clerk",
          version: "0.1.0",
          storageDir
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/log") {
        const body = await readJsonBody(request);
        const entry = await appendEntry(storageDir, body);
        json(response, 201, { ok: true, entry });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/state") {
        const state = buildState(await loadEntries(storageDir));
        json(response, 200, state);
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/summary") {
        const state = buildState(await loadEntries(storageDir));
        json(response, 200, {
          summary: buildSummaryText(state),
          state
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/chat/completions") {
        await readJsonBody(request);
        const state = buildState(await loadEntries(storageDir));
        json(response, 200, buildChatCompletion(buildSummaryText(state)));
        return;
      }

      json(response, 404, { detail: "not found" });
    } catch (error) {
      json(response, 400, { detail: error.message || "bad request" });
    }
  });
}

export async function startServer(options = {}) {
  const port = Number(options.port || process.env.PORT || 8788);
  const host = options.host || process.env.HOST || "127.0.0.1";
  const server = createServer(options);

  await new Promise((resolve) => server.listen(port, host, resolve));
  return { server, host, port };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer()
    .then(({ host, port }) => {
      process.stdout.write(`office-clerk listening on http://${host}:${port}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.stack || error.message}\n`);
      process.exitCode = 1;
    });
}
