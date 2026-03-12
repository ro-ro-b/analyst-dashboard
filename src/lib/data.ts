import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { getDataDir } from "./env";
import { cacheGet, cacheSet } from "./cache";
import { renderMarkdown } from "./markdown";
import { isValidChannelType, isValidSummaryType } from "./validators";
import type {
  ChannelConfig,
  SummaryMeta,
  ChannelListItem,
  ChannelDetailResponse,
  SummariesListResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function channelCacheKey(slug: string): string {
  return `channel:${slug}`;
}

function summariesCacheKey(slug: string): string {
  return `summaries:${slug}`;
}

const CHANNELS_LIST_KEY = "channels:list";

/**
 * Reads and parses a _channel.yaml file.
 * Throws if the file is missing or the YAML is invalid.
 */
function parseChannelConfig(channelDir: string): ChannelConfig {
  const configPath = path.join(channelDir, "_channel.yaml");
  const raw = fs.readFileSync(configPath, "utf-8");
  const parsed = yaml.load(raw) as Record<string, unknown>;

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid channel config at ${configPath}`);
  }

  const channel_name = String(parsed.channel_name ?? "");
  const channel_slug = String(parsed.channel_slug ?? "");
  const channel_type = parsed.channel_type;

  if (!channel_name) throw new Error(`Missing channel_name in ${configPath}`);
  if (!channel_slug) throw new Error(`Missing channel_slug in ${configPath}`);
  if (!isValidChannelType(channel_type)) {
    throw new Error(`Invalid channel_type "${String(channel_type)}" in ${configPath}`);
  }

  const config: ChannelConfig = {
    channel_name,
    channel_slug,
    channel_type,
  };

  if (parsed.channel_url !== undefined) config.channel_url = String(parsed.channel_url);
  if (parsed.added_date !== undefined) config.added_date = String(parsed.added_date);
  if (parsed.last_sync !== undefined) config.last_sync = String(parsed.last_sync);
  if (parsed.sync_count !== undefined) config.sync_count = Number(parsed.sync_count);
  if (parsed.notes !== undefined) config.notes = String(parsed.notes);

  return config;
}

/**
 * Counts the number of .md files in the _summaries subdirectory.
 * Returns 0 if the directory does not exist.
 */
function countSummaryFiles(channelDir: string): number {
  const summariesDir = path.join(channelDir, "_summaries");
  if (!fs.existsSync(summariesDir)) return 0;
  try {
    const files = fs.readdirSync(summariesDir);
    return files.filter((f) => f.endsWith(".md")).length;
  } catch {
    return 0;
  }
}

/**
 * Parses a markdown file's frontmatter into a SummaryMeta object.
 * Does NOT render the body HTML (use parseSummaryWithBody for that).
 */
function parseSummaryFrontmatter(filePath: string, filename: string): SummaryMeta {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  const type = data.type;
  if (!isValidSummaryType(type)) {
    throw new Error(`Invalid summary type "${String(type)}" in ${filePath}`);
  }

  const meta: SummaryMeta = { type, filename };

  if (data.channel !== undefined) meta.channel = String(data.channel);
  if (data.channel_slug !== undefined) meta.channel_slug = String(data.channel_slug);
  if (data.source_video !== undefined) meta.source_video = String(data.source_video);
  if (data.source_date !== undefined) meta.source_date = String(data.source_date);
  if (data.duration !== undefined) meta.duration = String(data.duration);
  if (data.video_url !== undefined) meta.video_url = String(data.video_url);
  if (data.video_count !== undefined) meta.video_count = Number(data.video_count);
  if (data.generated_date !== undefined) meta.generated_date = String(data.generated_date);
  if (data.model !== undefined) meta.model = String(data.model);

  return meta;
}

/**
 * Parses a markdown file's frontmatter AND renders the body to HTML.
 */
async function parseSummaryWithBody(filePath: string, filename: string): Promise<SummaryMeta> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const type = data.type;
  if (!isValidSummaryType(type)) {
    throw new Error(`Invalid summary type "${String(type)}" in ${filePath}`);
  }

  const body_html = await renderMarkdown(content);

  const meta: SummaryMeta = { type, filename, body_html };

  if (data.channel !== undefined) meta.channel = String(data.channel);
  if (data.channel_slug !== undefined) meta.channel_slug = String(data.channel_slug);
  if (data.source_video !== undefined) meta.source_video = String(data.source_video);
  if (data.source_date !== undefined) meta.source_date = String(data.source_date);
  if (data.duration !== undefined) meta.duration = String(data.duration);
  if (data.video_url !== undefined) meta.video_url = String(data.video_url);
  if (data.video_count !== undefined) meta.video_count = Number(data.video_count);
  if (data.generated_date !== undefined) meta.generated_date = String(data.generated_date);
  if (data.model !== undefined) meta.model = String(data.model);

  return meta;
}

/**
 * Reads and parses a special markdown file (_latest.md, _rolling.md, _narrative.md)
 * with rendered HTML body. Returns null if the file does not exist.
 */
async function parseSpecialFile(
  channelDir: string,
  filename: string
): Promise<SummaryMeta | null> {
  const filePath = path.join(channelDir, filename);
  if (!fs.existsSync(filePath)) return null;
  return parseSummaryWithBody(filePath, filename);
}

/**
 * Sorts SummaryMeta array by source_date descending.
 * Entries without source_date are placed at the end.
 */
function sortSummariesDescending(summaries: SummaryMeta[]): SummaryMeta[] {
  return [...summaries].sort((a, b) => {
    const dateA = a.source_date ?? "";
    const dateB = b.source_date ?? "";
    if (dateA === dateB) return 0;
    return dateA > dateB ? -1 : 1;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the list of all discovered channels with metadata.
 * Auto-discovers channels by scanning ANALYST_DATA_DIR for subdirectories
 * containing _channel.yaml.
 */
export async function listChannels(): Promise<ChannelListItem[]> {
  const cached = cacheGet<ChannelListItem[]>(CHANNELS_LIST_KEY);
  if (cached) return cached;

  const dataDir = getDataDir();

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dataDir, { withFileTypes: true });
  } catch (err) {
    throw new Error(
      `Cannot read data directory "${dataDir}": ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const channels: ChannelListItem[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const channelDir = path.join(dataDir, entry.name);
    const configPath = path.join(channelDir, "_channel.yaml");
    if (!fs.existsSync(configPath)) continue;

    try {
      const config = parseChannelConfig(channelDir);
      const videoCount = countSummaryFiles(channelDir);

      channels.push({
        channel_name: config.channel_name,
        channel_slug: config.channel_slug,
        channel_type: config.channel_type,
        sync_count: config.sync_count ?? 0,
        last_sync: config.last_sync ?? "",
        video_count: videoCount,
      });
    } catch {
      // Skip channels with invalid config
      continue;
    }
  }

  cacheSet(CHANNELS_LIST_KEY, channels);
  return channels;
}

/**
 * Returns full channel detail for a given slug.
 * Throws a not-found error if the channel does not exist.
 */
export async function getChannelDetail(slug: string): Promise<ChannelDetailResponse> {
  const cacheKey = channelCacheKey(slug);
  const cached = cacheGet<ChannelDetailResponse>(cacheKey);
  if (cached) return cached;

  const dataDir = getDataDir();
  const channelDir = path.join(dataDir, slug);
  const configPath = path.join(channelDir, "_channel.yaml");

  if (!fs.existsSync(configPath)) {
    const notFound = new Error(`Channel not found: ${slug}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  const config = parseChannelConfig(channelDir);
  const latest = await parseSpecialFile(channelDir, "_latest.md");
  const rolling = await parseSpecialFile(channelDir, "_rolling.md");
  const narrative = await parseSpecialFile(channelDir, "_narrative.md");

  const detail: ChannelDetailResponse = { config, latest, rolling, narrative };
  cacheSet(cacheKey, detail);
  return detail;
}

/**
 * Returns paginated per-video summaries (frontmatter only) for a channel.
 * Sorted by source_date descending.
 * Throws a not-found error if the channel does not exist.
 */
export async function listSummaries(
  slug: string,
  limit: number,
  offset: number
): Promise<SummariesListResponse> {
  const cacheKey = summariesCacheKey(slug);

  // Check channel exists
  const dataDir = getDataDir();
  const channelDir = path.join(dataDir, slug);
  const configPath = path.join(channelDir, "_channel.yaml");

  if (!fs.existsSync(configPath)) {
    const notFound = new Error(`Channel not found: ${slug}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  // Try cache for full sorted list
  let allSummaries = cacheGet<SummaryMeta[]>(cacheKey);

  if (!allSummaries) {
    const summariesDir = path.join(channelDir, "_summaries");
    const summaries: SummaryMeta[] = [];

    if (fs.existsSync(summariesDir)) {
      const files = fs.readdirSync(summariesDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const filePath = path.join(summariesDir, file);
        try {
          const meta = parseSummaryFrontmatter(filePath, file);
          summaries.push(meta);
        } catch {
          // Skip files with invalid frontmatter
          continue;
        }
      }
    }

    allSummaries = sortSummariesDescending(summaries);
    cacheSet(cacheKey, allSummaries);
  }

  const total = allSummaries.length;
  const paginated = allSummaries.slice(offset, offset + limit);

  return { summaries: paginated, total };
}

/**
 * Returns a single summary with rendered HTML body.
 * Throws a not-found error if the channel or file does not exist.
 */
export async function getSummary(slug: string, filename: string): Promise<SummaryMeta> {
  const dataDir = getDataDir();
  const channelDir = path.join(dataDir, slug);
  const configPath = path.join(channelDir, "_channel.yaml");

  if (!fs.existsSync(configPath)) {
    const notFound = new Error(`Channel not found: ${slug}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  const summariesDir = path.join(channelDir, "_summaries");
  const filePath = path.join(summariesDir, filename);

  if (!fs.existsSync(filePath)) {
    const notFound = new Error(`Summary not found: ${filename}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  return parseSummaryWithBody(filePath, filename);
}
