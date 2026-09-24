# company-mode-sandbox

This is the demo target repository for [Company Mode](https://github.com/DanushArun/company-mode): a
tiny, dependency-free Node.js "tasks API" that Company Mode's agents (Forge, Pixel, Sentinel) work
against to demonstrate the full Linear -> Paperclip -> branch -> PR -> review -> merge loop.

It is deliberately small and boring so that the interesting part of any demo is the agent workflow,
not the app.

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
pushed (see `AGENTS.md` and Company Mode's `docs/CONTRACTS.md`).

## Demo tickets

See `DEMO_TICKETS.md` for suggested Linear tickets to run through Company Mode against this repo.

