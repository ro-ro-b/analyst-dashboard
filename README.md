# analyst-dashboard
Analyst Dashboard PWA - YouTube transcript summary browser

## Setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and set `DATA_DIR` if needed (defaults to `./data`).

## Development

```bash
npm run dev
```

## API Endpoints

- `GET /api/channels` — list all channels
- `GET /api/channels/[slug]` — get channel details
- `GET /api/channels/[slug]/summaries` — list summaries (supports `?page=1&limit=20`)
- `GET /api/channels/[slug]/summaries/[filename]` — get a single summary with rendered markdown

## Lint

```bash
npm run lint
```

Uses ESLint 9 flat config (`eslint.config.mjs`) via the `eslint` CLI directly.

## Tests

```bash
npm test
```

All tests use Vitest and import route handlers directly (no HTTP server required).

## Build

```bash
npm run build
```
