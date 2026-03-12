# analyst-dashboard
Analyst Dashboard PWA - YouTube transcript summary browser

## Overview

A read-only REST API for browsing analyst transcript summaries stored as markdown files with YAML front matter. Built with Next.js 15 App Router (API routes only).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/channels` | List all channels |
| GET | `/api/channels/:slug` | Get channel detail with narrative/rolling content |
| GET | `/api/channels/:slug/summaries` | List summaries (paginated) |
| GET | `/api/channels/:slug/summaries/:filename` | Get a single summary with rendered HTML |

### Pagination

The summaries list endpoint supports `page` and `limit` query parameters. The `limit` parameter is clamped to a maximum of 100.

## Data Directory Structure

```
data/
  <channel-slug>/
    _channel.yaml          # channel metadata
    _latest.md             # latest content (optional)
    _narrative.md          # narrative content (optional)
    _rolling.md            # rolling content (optional)
    _summaries/
      YYYY-MM-DD_slug.md   # individual summaries
```

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local to set DATA_DIR if needed
```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
```

Uses ESLint 9 flat config (`eslint.config.mjs`) with the `eslint .` CLI command.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `./data` | Path to the data directory |
