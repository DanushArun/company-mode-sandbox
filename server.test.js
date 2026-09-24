import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./server.js";

let server;
let base;

before(async () => {
  server = createApp();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("GET /health returns ok", async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, { status: "ok" });
});

test("GET /tasks returns an empty list on a fresh server", async () => {
  const res = await fetch(`${base}/tasks`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.tasks, []);
});

test("POST /tasks creates a task and returns 201", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write tests" }),
  });
  assert.equal(res.status, 201);
  const task = await res.json();
  assert.equal(task.title, "Write tests");
  assert.equal(task.done, false);
  assert.equal(typeof task.id, "string");
  assert.equal(typeof task.createdAt, "string");
});

test("created task shows up in GET /tasks", async () => {
  await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Ship it" }),
  });
  const res = await fetch(`${base}/tasks`);
  const body = await res.json();
  assert.ok(body.tasks.some((t) => t.title === "Ship it"));
});

test("two created tasks get distinct ids", async () => {
  const a = await (
    await fetch(`${base}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task A" }),
    })
  ).json();
  const b = await (
    await fetch(`${base}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task B" }),
    })
  ).json();
  assert.notEqual(a.id, b.id);
});

test("POST /tasks without a title returns 400", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
});

test("POST /tasks with a blank title returns 400", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "   " }),
  });
  assert.equal(res.status, 400);
});

test("POST /tasks with a non-string title returns 400", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: 123 }),
  });
  assert.equal(res.status, 400);
});

test("POST /tasks with invalid JSON returns 400", async () => {
  const res = await fetch(`${base}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });
  assert.equal(res.status, 400);
});

test("unknown route returns 404", async () => {
  const res = await fetch(`${base}/nope`);
  assert.equal(res.status, 404);
});
