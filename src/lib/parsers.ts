import matter from 'gray-matter';
import yaml from 'js-yaml';

export interface ParsedChannelYaml {
  channel_name: string;
  channel_url: string;
  channel_slug: string;
  channel_type: 'narrative' | 'info';
  added_date?: string;
  last_sync: string;
  sync_count: number;
  notes?: string;
}

export interface ParsedMarkdownFrontmatter {
  type?: 'latest' | 'rolling' | 'narrative' | 'video_summary';
  channel?: string;
  channel_slug?: string;
  source_video?: string;
  source_date?: string;
  duration?: string;
  video_url?: string;
  video_count?: number;
  generated_date?: string;
  model?: string;
}

export function parseChannelYaml(raw: string): ParsedChannelYaml | null {
  try {
    const parsed = yaml.load(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.channel_name || !parsed.channel_slug) return null;

    return {
      channel_name: String(parsed.channel_name),
      channel_url: String(parsed.channel_url || ''),
      channel_slug: String(parsed.channel_slug),
      channel_type: parsed.channel_type === 'info' ? 'info' : 'narrative',
      added_date: parsed.added_date ? String(parsed.added_date) : undefined,
      last_sync: String(parsed.last_sync || ''),
      sync_count: typeof parsed.sync_count === 'number' ? parsed.sync_count : 0,
      notes: parsed.notes ? String(parsed.notes) : undefined,
    };
  } catch (err) {
    console.warn('[parsers] Failed to parse _channel.yaml:', err);
    return null;
  }
}

export function parseMarkdownFile(raw: string): { frontmatter: ParsedMarkdownFrontmatter; content: string } | null {
  try {
    const { data, content } = matter(raw);
    if (!data || typeof data !== 'object') return null;

    const fm: ParsedMarkdownFrontmatter = {
      type: data.type as ParsedMarkdownFrontmatter['type'],
      channel: data.channel ? String(data.channel) : undefined,
      channel_slug: data.channel_slug ? String(data.channel_slug) : undefined,
      source_video: data.source_video ? String(data.source_video) : undefined,
      source_date: data.source_date ? String(data.source_date) : undefined,
      duration: data.duration ? String(data.duration) : undefined,
      video_url: data.video_url ? String(data.video_url) : undefined,
      video_count: typeof data.video_count === 'number' ? data.video_count : undefined,
      generated_date: data.generated_date ? String(data.generated_date) : undefined,
      model: data.model ? String(data.model) : undefined,
    };

    return { frontmatter: fm, content };
  } catch (err) {
    console.warn('[parsers] Failed to parse markdown frontmatter:', err);
    return null;
  }
}
