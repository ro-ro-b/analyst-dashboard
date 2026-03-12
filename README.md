# Analyst Dashboard

Analyst Dashboard PWA — YouTube transcript summary browser.

A read-only consumption layer for analyst transcript summaries stored as markdown files with YAML frontmatter.

## Purpose

This project provides a REST API for browsing analyst channel summaries. Data comes from flat files on disk organized into channel directories. There is no database.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANALYST_DATA_DIR` | No | `./data` | Path to the channels data directory |
| `PORT` | No | `3000` | Server port |

## Data Directory Structure

```
data/
  <channel-slug>/
    _channel.yaml          # Channel configuration
    _latest.md             # Most recent video briefing
    _rolling.md            # 3-video rolling synthesis
    _narrative.md          # Cumulative thesis (narrative channels only)
    _summaries/
      YYYY-MM-DD_slug.md   # Per-video summaries
```

## API Endpoints

### `GET /api/channels`
Returns an array of all discovered channels with metadata.

**Response:**
```json
[
  {
    "channel_name": "Jordi Visser Labs",
    "channel_slug": "jordi-visser",
    "channel_type": "narrative",
    "sync_count": 82,
    "last_sync": "2026-03-09",
    "video_count": 2
  }
]
```

### `GET /api/channels/[slug]`
Returns full channel detail including latest, rolling, and narrative content.

**Response:**
```json
{
  "config": { ... },
  "latest": { ... },
  "rolling": { ... },
  "narrative": { ... }
}
```

### `GET /api/channels/[slug]/summaries`
Returns paginated list of per-video summaries (frontmatter only, no body) sorted by date descending.

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)

**Response:**
```json
{
  "summaries": [ ... ],
  "total": 10
}
```

### `GET /api/channels/[slug]/summaries/[filename]`
Returns a single full summary with rendered HTML body.

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Testing

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

Tests use the sample fixtures in the `data/` directory.
