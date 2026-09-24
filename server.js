import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

export const MAX_TITLE_LENGTH = 120;

export function createTaskStore() {
  const tasks = new Map();
  return {
    list() {
      return [...tasks.values()];
    },
    get(id) {
      return tasks.get(id);
    },
    create(title) {
      const task = { id: randomUUID(), title, done: false, createdAt: new Date().toISOString() };
      tasks.set(task.id, task);
      return task;
    },
  };
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

export function createApp() {
  const store = createTaskStore();

  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/health") {
      return sendJson(res, 200, { status: "ok" });
    }

    if (req.method === "GET" && url.pathname === "/tasks") {
      return sendJson(res, 200, { tasks: store.list() });
    }

    if (req.method === "POST" && url.pathname === "/tasks") {
      let raw;
      try {
        raw = await readBody(req);
      } catch {
        return sendJson(res, 400, { error: "Could not read request body" });
      }

      let data;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON" });
      }

      const title = typeof data.title === "string" ? data.title.trim() : "";
      if (!title) {
        return sendJson(res, 400, { error: "title is required" });
      }

      const task = store.create(title);
      return sendJson(res, 201, task);
    }

    return sendJson(res, 404, { error: "Not found" });
  });
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`tasks API listening on :${port}`);
  });
}
