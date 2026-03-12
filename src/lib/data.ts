import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getDataDir } from "./env";
import { renderMarkdown } from "./markdown";
import { cache } from "./cache";
import type {
  ChannelMeta,
  ChannelDetail,
  SummaryMeta,
  PaginatedSummaries,
} from "./types";

interface ChannelYaml {
  title: string;
  description: string;
  url: string;
  tags?: string[];
}

interface SummaryFrontMatter {
  title: string;
  date: string;
  tags?: string[];
}

function parseFrontMatter(content: string): {
  frontMatter: SummaryFrontMatter;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Invalid front matter format");
  }
  const frontMatter = yaml.load(match[1]) as SummaryFrontMatter;
  const body = match[2];
  return { frontMatter, body };
}

async function parseSummaryWithBody(
  filePath: string,
  filename: string
): Promise<SummaryMeta> {
  const content = fs.readFileSync(filePath, "utf-8");
  const { frontMatter, body } = parseFrontMatter(content);
  const body_html = await renderMarkdown(body);
  return {
    filename,
    date: frontMatter.date,
    title: frontMatter.title,
    tags: frontMatter.tags ?? [],
    body_html,
  };
}

export async function getChannels(): Promise<ChannelMeta[]> {
  const cacheKey = "channels:list";
  const cached = cache.get<ChannelMeta[]>(cacheKey);
  if (cached) return cached;

  const dataDir = getDataDir();
  const entries = fs.readdirSync(dataDir, { withFileTypes: true });
  const channels: ChannelMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const configPath = path.join(dataDir, slug, "_channel.yaml");
    if (!fs.existsSync(configPath)) continue;

    const raw = fs.readFileSync(configPath, "utf-8");
    const config = yaml.load(raw) as ChannelYaml;
    channels.push({
      slug,
      title: config.title,
      description: config.description,
      url: config.url,
      tags: config.tags ?? [],
    });
  }

  channels.sort((a, b) => a.slug.localeCompare(b.slug));
  cache.set(cacheKey, channels);
  return channels;
}

export async function getChannel(slug: string): Promise<ChannelDetail> {
  const cacheKey = `channel:${slug}`;
  const cached = cache.get<ChannelDetail>(cacheKey);
  if (cached) return cached;

  const dataDir = getDataDir();
  const channelDir = path.join(dataDir, slug);
  const configPath = path.join(channelDir, "_channel.yaml");

  if (!fs.existsSync(configPath)) {
    const notFound = new Error(`Channel not found: ${slug}`);
    (notFound as NodeJS.ErrnoException).code = "ENOENT";
    throw notFound;
  }

  const raw = fs.readFileSync(configPath, "utf-8");
  const config = yaml.load(raw) as ChannelYaml;

  const detail: ChannelDetail = {
    slug,
    title: config.title,
    description: config.description,
    url: config.url,
    tags: config.tags ?? [],
  };

  const latestPath = path.join(channelDir, "_latest.md");
  if (fs.existsSync(latestPath)) {
    detail.latest_html = await renderMarkdown(
      fs.readFileSync(latestPath, "utf-8")
    );
  }

  const narrativePath = path.join(channelDir, "_narrative.md");
  if (fs.existsSync(narrativePath)) {
    detail.narrative_html = await renderMarkdown(
      fs.readFileSync(narrativePath, "utf-8")
    );
  }

  const rollingPath = path.join(channelDir, "_rolling.md");
  if (fs.existsSync(rollingPath)) {
    detail.rolling_html = await renderMarkdown(
      fs.readFileSync(rollingPath, "utf-8")
    );
  }

  cache.set(cacheKey, detail);
  return detail;
}

export async function getSummaries(
  slug: string,
  page: number,
  limit: number
): Promise<PaginatedSummaries> {
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
    return { summaries: [], total: 0, page, limit, totalPages: 0 };
  }

  const files = fs
    .readdirSync(summariesDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  const total = files.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const pageFiles = files.slice(start, start + limit);

  const summaries = await Promise.all(
    pageFiles.map((filename) =>
      parseSummaryWithBody(path.join(summariesDir, filename), filename)
    )
  );

  return { summaries, total, page, limit, totalPages };
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
