import fs from 'node:fs/promises';
import path from 'node:path';
import { getDataRoot, assertSafeSegment, resolveWithinDataRoot } from '@/lib/paths';
import { parseChannelYaml, parseMarkdownFile } from '@/lib/parsers';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { getCached, setCached } from '@/lib/cache';
import type { ChannelOverview, ChannelDetail, RenderedContent, SummaryMeta, SummaryFull } from '@/types';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

async function renderContentFile(
  filePath: string,
  expectedType: RenderedContent['type']
): Promise<RenderedContent | null> {
  const raw = await readFileIfExists(filePath);
  if (!raw) return null;

  const parsed = parseMarkdownFile(raw);
  if (!parsed) return null;

  const html = await renderMarkdownToHtml(parsed.content);

  return {
    type: parsed.frontmatter.type || expectedType,
    generatedDate: parsed.frontmatter.generated_date,
    model: parsed.frontmatter.model,
    sourceVideo: parsed.frontmatter.source_video,
    sourceDate: parsed.frontmatter.source_date,
    videoCount: parsed.frontmatter.video_count,
    html,
  };
}

async function countSummaries(channelDir: string): Promise<number> {
  const summariesDir = path.join(channelDir, '_summaries');
  try {
    const entries = await fs.readdir(summariesDir);
    return entries.filter((e) => e.endsWith('.md')).length;
  } catch {
    return 0;
  }
}

async function getNewestFileTime(channelDir: string): Promise<number> {
  let newest = 0;
  try {
    const entries = await fs.readdir(channelDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const stat = await fs.stat(path.join(channelDir, entry.name));
        if (stat.mtimeMs > newest) newest = stat.mtimeMs;
      }
    }
    // Also check _summaries
    const summariesDir = path.join(channelDir, '_summaries');
    try {
      const sEntries = await fs.readdir(summariesDir, { withFileTypes: true });
      for (const entry of sEntries) {
        if (entry.isFile()) {
          const stat = await fs.stat(path.join(summariesDir, entry.name));
          if (stat.mtimeMs > newest) newest = stat.mtimeMs;
        }
      }
    } catch {
      // no _summaries dir
    }
  } catch {
    // can't read dir
  }
  return newest;
}

function computeHasNew(latestGeneratedDate: string | undefined, newestFileTime: number): boolean {
  if (!latestGeneratedDate) return false;
  try {
    const genTime = new Date(latestGeneratedDate).getTime();
    return newestFileTime > genTime;
  } catch {
    return false;
  }
}

export async function listChannels(): Promise<ChannelOverview[]> {
  const cacheKey = 'listChannels';
  const cached = getCached<ChannelOverview[]>(cacheKey);
  if (cached) return cached;

  const root = getDataRoot();

  let entries: string[];
  try {
    const dirEntries = await fs.readdir(root, { withFileTypes: true });
    entries = dirEntries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (err) {
    throw new Error(`Data directory not found or unreadable: ${root}. ${err}`);
  }

  const channels: ChannelOverview[] = [];

  for (const dirName of entries) {
    const channelDir = resolveWithinDataRoot(dirName);
    const yamlPath = path.join(channelDir, '_channel.yaml');

    if (!(await fileExists(yamlPath))) continue;

    const yamlRaw = await readFileIfExists(yamlPath);
    if (!yamlRaw) continue;

    const config = parseChannelYaml(yamlRaw);
    if (!config) continue;

    const summaryCount = await countSummaries(channelDir);

    // Read _latest.md frontmatter for hasNew computation
    let latestGeneratedDate: string | undefined;
    const latestPath = path.join(channelDir, '_latest.md');
    const latestRaw = await readFileIfExists(latestPath);
    if (latestRaw) {
      const parsed = parseMarkdownFile(latestRaw);
      if (parsed) {
        latestGeneratedDate = parsed.frontmatter.generated_date;
      }
    }

    const newestFileTime = await getNewestFileTime(channelDir);
    const hasNew = computeHasNew(latestGeneratedDate, newestFileTime);

    channels.push({
      slug: config.channel_slug,
      name: config.channel_name,
      url: config.channel_url,
      type: config.channel_type,
      syncCount: config.sync_count,
      lastSync: config.last_sync,
      summaryCount,
      hasNew,
      notes: config.notes,
    });
  }

  channels.sort((a, b) => a.name.localeCompare(b.name));
  setCached(cacheKey, channels);
  return channels;
}

export async function getChannelDetail(slug: string): Promise<ChannelDetail | null> {
  const safeSlug = assertSafeSegment(slug, 'slug');
  const cacheKey = `channelDetail:${safeSlug}`;
  const cached = getCached<ChannelDetail>(cacheKey);
  if (cached) return cached;

  const channelDir = resolveWithinDataRoot(safeSlug);
  const yamlPath = path.join(channelDir, '_channel.yaml');

  if (!(await fileExists(yamlPath))) return null;

  const yamlRaw = await readFileIfExists(yamlPath);
  if (!yamlRaw) return null;

  const config = parseChannelYaml(yamlRaw);
  if (!config) return null;

  const latest = await renderContentFile(path.join(channelDir, '_latest.md'), 'latest');
  const rolling = await renderContentFile(path.join(channelDir, '_rolling.md'), 'rolling');
  const narrative = config.channel_type === 'narrative'
    ? await renderContentFile(path.join(channelDir, '_narrative.md'), 'narrative')
    : null;

  const detail: ChannelDetail = {
    slug: config.channel_slug,
    name: config.channel_name,
    type: config.channel_type,
    syncCount: config.sync_count,
    lastSync: config.last_sync,
    latest,
    rolling,
    narrative,
  };

  setCached(cacheKey, detail);
  return detail;
}

export async function listChannelSummaries(
  slug: string,
  options?: { limit?: number; offset?: number }
): Promise<{ items: SummaryMeta[]; total: number; limit: number; offset: number }> {
  const safeSlug = assertSafeSegment(slug, 'slug');
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const cacheKey = `summaries:${safeSlug}:${limit}:${offset}`;
  const cached = getCached<{ items: SummaryMeta[]; total: number; limit: number; offset: number }>(cacheKey);
  if (cached) return cached;

  const channelDir = resolveWithinDataRoot(safeSlug);
  const yamlPath = path.join(channelDir, '_channel.yaml');

  if (!(await fileExists(yamlPath))) {
    throw new Error(`CHANNEL_NOT_FOUND:${safeSlug}`);
  }

  const summariesDir = path.join(channelDir, '_summaries');
  let files: string[] = [];
  try {
    const entries = await fs.readdir(summariesDir);
    files = entries.filter((e) => e.endsWith('.md'));
  } catch {
    // No _summaries directory
  }

  const allMetas: SummaryMeta[] = [];

  for (const file of files) {
    const filePath = path.join(summariesDir, file);
    const raw = await readFileIfExists(filePath);
    if (!raw) continue;

    const parsed = parseMarkdownFile(raw);
    if (!parsed) continue;

    const filename = file.replace(/\.md$/, '');

    allMetas.push({
      filename,
      title: parsed.frontmatter.source_video || filename,
      sourceDate: parsed.frontmatter.source_date || '',
      duration: parsed.frontmatter.duration,
      videoUrl: parsed.frontmatter.video_url,
      generatedDate: parsed.frontmatter.generated_date,
      model: parsed.frontmatter.model,
    });
  }

  // Sort by sourceDate descending
  allMetas.sort((a, b) => b.sourceDate.localeCompare(a.sourceDate));

  const total = allMetas.length;
  const items = allMetas.slice(offset, offset + limit);

  const result = { items, total, limit, offset };
  setCached(cacheKey, result);
  return result;
}

export async function getChannelSummary(
  slug: string,
  filename: string
): Promise<SummaryFull | null> {
  const safeSlug = assertSafeSegment(slug, 'slug');
  const safeFilename = assertSafeSegment(filename, 'filename');

  const cacheKey = `summary:${safeSlug}:${safeFilename}`;
  const cached = getCached<SummaryFull>(cacheKey);
  if (cached) return cached;

  const channelDir = resolveWithinDataRoot(safeSlug);
  const yamlPath = path.join(channelDir, '_channel.yaml');

  if (!(await fileExists(yamlPath))) return null;

  // Read channel config for name
  const yamlRaw = await readFileIfExists(yamlPath);
  if (!yamlRaw) return null;
  const config = parseChannelYaml(yamlRaw);
  if (!config) return null;

  // Try with .md extension
  const mdFilename = safeFilename.endsWith('.md') ? safeFilename : `${safeFilename}.md`;
  const filePath = resolveWithinDataRoot(safeSlug, '_summaries', mdFilename);

  const raw = await readFileIfExists(filePath);
  if (!raw) return null;

  const parsed = parseMarkdownFile(raw);
  if (!parsed) return null;

  const html = await renderMarkdownToHtml(parsed.content);

  const result: SummaryFull = {
    filename: safeFilename.replace(/\.md$/, ''),
    title: parsed.frontmatter.source_video || safeFilename,
    sourceDate: parsed.frontmatter.source_date || '',
    duration: parsed.frontmatter.duration,
    videoUrl: parsed.frontmatter.video_url,
    channel: config.channel_name,
    channelSlug: config.channel_slug,
    generatedDate: parsed.frontmatter.generated_date,
    model: parsed.frontmatter.model,
    html,
  };

  setCached(cacheKey, result);
  return result;
}
