# Analyst Dashboard

A mobile-first Next.js 14 dashboard for browsing analyst transcript summaries and thesis tracking. Read-only — reads structured markdown files with YAML frontmatter from a configurable data directory.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ANALYST_DATA_DIR` | `./data` | Path to the channels data directory |
| `PORT` | `3000` | Server port |

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

## Data Directory Structure

The app reads from `ANALYST_DATA_DIR`, which contains channel subdirectories:

```
data/
├── jordi-visser/              # narrative-type channel
│   ├── _channel.yaml          # Channel config
│   ├── _latest.md             # Most recent video briefing
│   ├── _rolling.md            # Rolling synthesis
│   ├── _narrative.md          # Thesis evolution (narrative type only)
│   └── _summaries/            # Per-video summaries
│       ├── 2026-03-08_sample-video-one.md
│       └── 2026-03-01_sample-video-two.md
├── anthropic-ai/              # info-type channel (no _narrative.md)
└── spotgamma/                 # narrative-type channel
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/channels` | List all discovered channels |
| GET | `/api/channels/:slug` | Get channel detail with rendered content |
| GET | `/api/channels/:slug/summaries` | List per-video summary metadata |
| GET | `/api/channels/:slug/summaries/:filename` | Get full summary with HTML |

### Query Parameters

`GET /api/channels/:slug/summaries` supports:
- `limit` (default: 20) — number of items per page
- `offset` (default: 0) — pagination offset

## Pages

| Path | Description |
|------|-------------|
| `/` | Dashboard — channel card grid |
| `/channel/:slug` | Channel view — tabbed content (Latest, Rolling, Narrative) |
| `/channel/:slug/summary/:filename` | Summary view — full per-video summary |

## Testing

```bash
npm test
```

Tests use vitest and cover:
- YAML/frontmatter parsing
- Path safety validation
- Cache layer
- Markdown rendering and sanitization
- Data layer integration with fixture data

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **CSS:** Tailwind CSS 3
- **Components:** shadcn/ui + Radix UI
- **Icons:** Lucide React
- **Markdown:** remark + rehype pipeline with sanitization
- **Testing:** Vitest
