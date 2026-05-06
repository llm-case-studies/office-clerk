import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_STORAGE_DIR = path.join(process.cwd(), "storage", "runtime");

export function resolveStorageDir(override) {
  return override || process.env.OFFICE_CLERK_STORAGE_DIR || DEFAULT_STORAGE_DIR;
}

function logFile(storageDir) {
  return path.join(storageDir, "updates.jsonl");
}

export async function ensureStorageDir(storageDir) {
  await mkdir(storageDir, { recursive: true });
}

export function normalizeEntry(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("expected JSON object");
  }

  if (!input.source || typeof input.source !== "string") {
    throw new Error("missing or invalid 'source'");
  }

  if (!input.summary || typeof input.summary !== "string") {
    throw new Error("missing or invalid 'summary'");
  }

  const now = new Date().toISOString();
  const entry = {
    id: input.id || `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: input.createdAt || now,
    source: input.source,
    kind: typeof input.kind === "string" ? input.kind : "update",
    initiative: typeof input.initiative === "string" ? input.initiative : null,
    sprint: typeof input.sprint === "string" ? input.sprint : null,
    branch: typeof input.branch === "string" ? input.branch : null,
    status: typeof input.status === "string" ? input.status : null,
    summary: input.summary,
    decision: typeof input.decision === "string" ? input.decision : null,
    blocker: typeof input.blocker === "string" ? input.blocker : null,
    nextAction: typeof input.nextAction === "string" ? input.nextAction : null,
    tags: Array.isArray(input.tags) ? input.tags.filter((x) => typeof x === "string") : []
  };

  return entry;
}

export async function appendEntry(storageDir, input) {
  const entry = normalizeEntry(input);
  await ensureStorageDir(storageDir);
  await appendFile(logFile(storageDir), `${JSON.stringify(entry)}\n`, "utf8");
  return entry;
}

export async function loadEntries(storageDir) {
  await ensureStorageDir(storageDir);
  try {
    const raw = await readFile(logFile(storageDir), "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function latestBySource(entries) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entry.source, entry);
  }
  return [...map.values()].sort((a, b) => a.source.localeCompare(b.source));
}

function latestNamed(entries, field) {
  return entries
    .filter((entry) => entry[field])
    .slice(-10)
    .reverse()
    .map((entry) => ({
      source: entry.source,
      initiative: entry.initiative,
      sprint: entry.sprint,
      createdAt: entry.createdAt,
      value: entry[field]
    }));
}

export function buildState(entries) {
  return {
    updatedAt: entries.length ? entries[entries.length - 1].createdAt : null,
    totalEntries: entries.length,
    actors: latestBySource(entries).map((entry) => ({
      source: entry.source,
      initiative: entry.initiative,
      sprint: entry.sprint,
      branch: entry.branch,
      status: entry.status,
      summary: entry.summary,
      updatedAt: entry.createdAt
    })),
    decisions: latestNamed(entries, "decision"),
    blockers: latestNamed(entries, "blocker"),
    nextActions: latestNamed(entries, "nextAction")
  };
}

export function buildSummaryText(state) {
  const header = `office-clerk has ${state.totalEntries} logged update${state.totalEntries === 1 ? "" : "s"}.`;
  const actorLines =
    state.actors.length === 0
      ? ["No active actors have reported yet."]
      : state.actors.map((actor) => {
          const bits = [actor.source];
          if (actor.initiative) bits.push(actor.initiative);
          if (actor.sprint) bits.push(actor.sprint);
          if (actor.status) bits.push(actor.status);
          return `- ${bits.join(" | ")}: ${actor.summary}`;
        });

  const blockerLine =
    state.blockers.length === 0
      ? "No blockers recorded."
      : `Latest blocker: ${state.blockers[0].source} — ${state.blockers[0].value}`;

  const nextLine =
    state.nextActions.length === 0
      ? "No next actions recorded."
      : `Latest next action: ${state.nextActions[0].source} — ${state.nextActions[0].value}`;

  return [header, "", ...actorLines, "", blockerLine, nextLine].join("\n");
}
