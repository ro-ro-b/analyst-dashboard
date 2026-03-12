/**
 * Shared TypeScript types for the Analyst Dashboard API.
 */

/** Channel configuration parsed from _channel.yaml */
export interface ChannelConfig {
  channel_name: string;
  channel_url?: string;
  channel_slug: string;
  channel_type: "narrative" | "info";
  added_date?: string;
  last_sync?: string;
  sync_count?: number;
  notes?: string;
}

/** Summary metadata parsed from markdown frontmatter */
export interface SummaryMeta {
  type: "video_summary" | "latest" | "rolling" | "narrative";
  channel?: string;
  channel_slug?: string;
  source_video?: string;
  source_date?: string;
  duration?: string;
  video_url?: string;
  video_count?: number;
  generated_date?: string;
  model?: string;
  filename?: string;
  body_html?: string;
}

/** Response shape for GET /api/channels */
export interface ChannelListItem {
  channel_name: string;
  channel_slug: string;
  channel_type: string;
  sync_count: number;
  last_sync: string;
  video_count: number;
}

/** Response shape for GET /api/channels/[slug] */
export interface ChannelDetailResponse {
  config: ChannelConfig;
  latest: SummaryMeta | null;
  rolling: SummaryMeta | null;
  narrative: SummaryMeta | null;
}

/** Response shape for GET /api/channels/[slug]/summaries */
export interface SummariesListResponse {
  summaries: SummaryMeta[];
  total: number;
}

/** Standard API error response */
export interface ApiError {
  error: string;
}

/** Internal parsed channel data (includes video count) */
export interface ParsedChannel {
  config: ChannelConfig;
  videoCount: number;
}

/** Internal cache entry */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
