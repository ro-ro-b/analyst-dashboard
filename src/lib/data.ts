import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { renderMarkdown } from "./markdown";
import { getDataDir } from "./env";
import type { Channel, ChannelMeta, SummaryMeta, SummaryList } from "./types";

function parseChannelConfig(configPath: string): ChannelMeta {
  const raw = fs.readFileSync(configPath, "utf-8");
  return yaml.load(raw) as ChannelMeta;
}

async function parseSummaryWithBody(
  filePath: string,
  filename: string
): Promise<SummaryMeta> {
  const raw = fs.readFileSync(filePath, "utf-8");

  // Split frontmatter from body
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/m);
  let frontmatter: Record<string, unknown> = {};
  let body = raw;

  if (fmMatch) {
    frontmatter = yaml.load(fmMatch[1]) as Record<string, unknown>;
    body = fmMatch[2];
  }

  const body_html = await renderMarkdown(body);

  return {
    filename,
    title: (frontmatter.title as string) ?? filename,
    date: (frontmatter.date as string) ?? "",
    video_id: (frontmatter.video_id as string) ?? "",
    duration: (frontmatter.duration as number) ?? 0,
    tags: (frontmatter.tags as string[]) ?? [],
    body_html,
  };
}

export async function getChannels(): Promise<ChannelMeta[]> {
  const dataDir = getDataDir();
  const entries = fs.readdirSync(dataDir, { withFileTypes: true });
  const channels: ChannelMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const configPath = path.join(dataDir, entry.name, "_channel.yaml");
    if (!fs.existsSync(configPath)) continue;
    channels.push(parseChannelConfig(configPath));
  }

  return channels;
}

export async function getChannel(slug: string): Promise<Channel> {
  const dataDir = getDataDir();
  const channelDir = path.join(dataDir, slug);
  const configPath = path.join(channelDir, "_channel.yaml");

  if (!fs.existsSync(configPath)) {
    const notFound = new Error(`Channel not found: ${slug}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  const meta = parseChannelConfig(configPath);

  // Load optional markdown files
  const latestPath = path.join(channelDir, "_latest.md");
  const rollingPath = path.join(channelDir, "_rolling.md");
  const narrativePath = path.join(channelDir, "_narrative.md");

  const latest_html = fs.existsSync(latestPath)
    ? await renderMarkdown(fs.readFileSync(latestPath, "utf-8"))
    : null;

  const rolling_html = fs.existsSync(rollingPath)
    ? await renderMarkdown(fs.readFileSync(rollingPath, "utf-8"))
    : null;

  const narrative_html = fs.existsSync(narrativePath)
    ? await renderMarkdown(fs.readFileSync(narrativePath, "utf-8"))
    : null;

  return {
    ...meta,
    latest_html,
    rolling_html,
    narrative_html,
  };
}

export async function getSummaries(
  slug: string,
  page: number,
  limit: number
): Promise<SummaryList> {
  const dataDir = getDataDir();
  const channelDir = path.join(dataDir, slug);
  const configPath = path.join(channelDir, "_channel.yaml");

  if (!fs.existsSync(configPath)) {
    const notFound = new Error(`Channel not found: ${slug}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  const summariesDir = path.join(channelDir, "_summaries");

  if (!fs.existsSync(summariesDir)) {
    return { items: [], total: 0, page, limit };
  }

  const files = fs
    .readdirSync(summariesDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  const total = files.length;
  const start = (page - 1) * limit;
  const pageFiles = files.slice(start, start + limit);

  const items = await Promise.all(
    pageFiles.map((filename) =>
      parseSummaryWithBody(path.join(summariesDir, filename), filename)
    )
  );

  return { items, total, page, limit };
}

export async function getSummary(
  slug: string,
  filename: string
): Promise<SummaryMeta> {
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

  const resolved = path.resolve(filePath);
  const resolvedBase = path.resolve(summariesDir);
  if (!resolved.startsWith(resolvedBase + path.sep) && resolved !== resolvedBase) {
    const notFound = new Error(`Summary not found: ${filename}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  if (!fs.existsSync(filePath)) {
    const notFound = new Error(`Summary not found: ${filename}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  return parseSummaryWithBody(filePath, filename);
}
