# tasks-api

A minimal in-memory tasks API written in plain Node.js, with zero runtime dependencies.

## API

- `GET /health` -> `{ "status": "ok" }`
- `GET /tasks` -> `{ "tasks": [...] }`
- `POST /tasks` with `{ "title": "..." }` -> `201` and the created task, or `400` if `title` is
  missing, blank, or not a string.

Tasks are stored in memory only (no database, no persistence across restarts).

## Run it

```
npm start
```

## Test it

```
npm test
```

Uses Node's built-in test runner (`node --test`) - no test framework dependency.

## CI

`.github/workflows/ci.yml` runs `npm test` on every push and pull request (required check: `ci`).
`.github/workflows/agent-pr.yml` opens a pull request automatically when an `agent/**` branch is
pushed - see `AGENTS.md` for the rules that branch is expected to follow.
