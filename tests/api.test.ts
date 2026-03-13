import { describe, it, expect, beforeEach } from 'vitest';
import { parseChannelYaml, parseMarkdownFile } from '@/lib/parsers';
import { assertSafeSegment, resolveWithinDataRoot, getDataRoot } from '@/lib/paths';
import { getCached, setCached, clearAllCache } from '@/lib/cache';
import { renderMarkdownToHtml } from '@/lib/markdown';
import path from 'node:path';

describe('parsers', () => {
  describe('parseChannelYaml', () => {
    it('parses valid channel YAML', () => {
      const yaml = `
channel_name: "Test Channel"
channel_url: "https://youtube.com/@test"
channel_slug: test-channel
channel_type: narrative
added_date: 2026-01-01
last_sync: 2026-03-09
sync_count: 42
notes: "Test notes"
`;
      const result = parseChannelYaml(yaml);
      expect(result).not.toBeNull();
      expect(result!.channel_name).toBe('Test Channel');
      expect(result!.channel_slug).toBe('test-channel');
      expect(result!.channel_type).toBe('narrative');
      expect(result!.sync_count).toBe(42);
      expect(result!.notes).toBe('Test notes');
    });

    it('returns null for empty input', () => {
      const result = parseChannelYaml('');
      expect(result).toBeNull();
    });

    it('returns null for malformed YAML', () => {
      const result = parseChannelYaml('{{{{invalid yaml');
      expect(result).toBeNull();
    });

    it('returns null for YAML missing required fields', () => {
      const yaml = `
channel_url: "https://youtube.com/@test"
`;
      const result = parseChannelYaml(yaml);
      expect(result).toBeNull();
    });

    it('defaults channel_type to narrative for unknown types', () => {
      const yaml = `
channel_name: "Test"
channel_slug: test
channel_type: unknown
`;
      const result = parseChannelYaml(yaml);
      expect(result).not.toBeNull();
      expect(result!.channel_type).toBe('narrative');
    });

    it('parses info type correctly', () => {
      const yaml = `
channel_name: "Info Channel"
channel_slug: info-ch
channel_type: info
`;
      const result = parseChannelYaml(yaml);
      expect(result).not.toBeNull();
      expect(result!.channel_type).toBe('info');
    });
  });

  describe('parseMarkdownFile', () => {
    it('parses valid markdown with frontmatter', () => {
      const md = `---
type: latest
channel: "Test Channel"
channel_slug: test-channel
source_video: "Test Video"
source_date: 2026-03-08
generated_date: 2026-03-09
model: claude-sonnet
---

## Key Points

- Point one
- Point two
`;
      const result = parseMarkdownFile(md);
      expect(result).not.toBeNull();
      expect(result!.frontmatter.type).toBe('latest');
      expect(result!.frontmatter.channel).toBe('Test Channel');
      expect(result!.frontmatter.source_video).toBe('Test Video');
      expect(result!.frontmatter.source_date).toBe('2026-03-08');
      expect(result!.frontmatter.generated_date).toBe('2026-03-09');
      expect(result!.frontmatter.model).toBe('claude-sonnet');
      expect(result!.content).toContain('## Key Points');
    });

    it('parses video_summary with all fields', () => {
      const md = `---
type: video_summary
channel: "Test"
channel_slug: test
source_video: "Video Title"
source_date: 2026-03-08
duration: "56:15"
video_url: https://youtube.com/watch?v=abc
generated_date: 2026-03-09
model: claude-sonnet
---

Body content here.
`;
      const result = parseMarkdownFile(md);
      expect(result).not.toBeNull();
      expect(result!.frontmatter.type).toBe('video_summary');
      expect(result!.frontmatter.duration).toBe('56:15');
      expect(result!.frontmatter.video_url).toBe('https://youtube.com/watch?v=abc');
    });

    it('parses rolling summary with video_count', () => {
      const md = `---
type: rolling
video_count: 3
---

Rolling content.
`;
      const result = parseMarkdownFile(md);
      expect(result).not.toBeNull();
      expect(result!.frontmatter.video_count).toBe(3);
    });

    it('handles markdown without frontmatter', () => {
      const md = `# Just a heading

Some content without frontmatter.
`;
      const result = parseMarkdownFile(md);
      expect(result).not.toBeNull();
      expect(result!.content).toContain('# Just a heading');
    });
  });
});

describe('paths', () => {
  describe('assertSafeSegment', () => {
    it('accepts valid slugs', () => {
      expect(assertSafeSegment('jordi-visser', 'slug')).toBe('jordi-visser');
      expect(assertSafeSegment('anthropic-ai', 'slug')).toBe('anthropic-ai');
      expect(assertSafeSegment('test_channel.v2', 'slug')).toBe('test_channel.v2');
    });

    it('accepts valid filenames', () => {
      expect(assertSafeSegment('2026-03-08_sample-one', 'filename')).toBe('2026-03-08_sample-one');
      expect(assertSafeSegment('2026-03-08_sample-one.md', 'filename')).toBe('2026-03-08_sample-one.md');
    });

    it('rejects empty strings', () => {
      expect(() => assertSafeSegment('', 'slug')).toThrow();
    });

    it('rejects dot segments', () => {
      expect(() => assertSafeSegment('.', 'slug')).toThrow();
      expect(() => assertSafeSegment('..', 'slug')).toThrow();
    });

    it('rejects path separators', () => {
      expect(() => assertSafeSegment('foo/bar', 'slug')).toThrow();
      expect(() => assertSafeSegment('foo\\bar', 'slug')).toThrow();
    });

    it('rejects special characters', () => {
      expect(() => assertSafeSegment('foo bar', 'slug')).toThrow();
      expect(() => assertSafeSegment('foo@bar', 'slug')).toThrow();
      expect(() => assertSafeSegment('../etc/passwd', 'filename')).toThrow();
    });
  });

  describe('resolveWithinDataRoot', () => {
    it('resolves valid paths within data root', () => {
      const result = resolveWithinDataRoot('jordi-visser', '_channel.yaml');
      const root = getDataRoot();
      expect(result).toBe(path.resolve(root, 'jordi-visser', '_channel.yaml'));
    });

    it('throws for path traversal attempts', () => {
      expect(() => resolveWithinDataRoot('..', '..', 'etc', 'passwd')).toThrow('Path traversal detected');
    });
  });
});

describe('cache', () => {
  beforeEach(() => {
    clearAllCache();
  });

  it('stores and retrieves values', () => {
    setCached('test-key', { foo: 'bar' });
    const result = getCached<{ foo: string }>('test-key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('returns null for missing keys', () => {
    const result = getCached('nonexistent');
    expect(result).toBeNull();
  });

  it('returns null for expired entries', () => {
    setCached('expired', 'value', 0); // 0ms TTL = immediately expired
    const result = getCached('expired');
    expect(result).toBeNull();
  });

  it('respects custom TTL', () => {
    setCached('long-lived', 'value', 600000); // 10 minutes
    const result = getCached('long-lived');
    expect(result).toBe('value');
  });
});

describe('markdown rendering', () => {
  it('renders basic markdown to HTML', async () => {
    const html = await renderMarkdownToHtml('## Hello World\n\nThis is a test.');
    expect(html).toContain('<h2>Hello World</h2>');
    expect(html).toContain('<p>This is a test.</p>');
  });

  it('renders lists', async () => {
    const html = await renderMarkdownToHtml('- Item one\n- Item two\n- Item three');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item one</li>');
  });

  it('renders bold text', async () => {
    const html = await renderMarkdownToHtml('**bold text**');
    expect(html).toContain('<strong>bold text</strong>');
  });

  it('sanitizes dangerous HTML', async () => {
    const html = await renderMarkdownToHtml('<script>alert("xss")</script>');
    expect(html).not.toContain('<script>');
  });

  it('renders GFM tables', async () => {
    const md = `| Header | Value |\n|--------|-------|\n| A      | 1     |`;
    const html = await renderMarkdownToHtml(md);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Header</th>');
  });

  it('handles empty input', async () => {
    const html = await renderMarkdownToHtml('');
    expect(html).toBe('');
  });
});

describe('data layer integration', () => {
  // These tests use the actual fixture data in ./data
  // They test the full data layer pipeline

  it('lists channels from fixture data', async () => {
    const { listChannels } = await import('@/lib/data');
    clearAllCache();
    const channels = await listChannels();
    expect(channels).toBeInstanceOf(Array);
    expect(channels.length).toBe(3);

    const slugs = channels.map((c) => c.slug);
    expect(slugs).toContain('jordi-visser');
    expect(slugs).toContain('anthropic-ai');
    expect(slugs).toContain('spotgamma');
  });

  it('returns correct channel overview fields', async () => {
    const { listChannels } = await import('@/lib/data');
    clearAllCache();
    const channels = await listChannels();
    const jordi = channels.find((c) => c.slug === 'jordi-visser');
    expect(jordi).toBeDefined();
    expect(jordi!.name).toBe('Jordi Visser Labs');
    expect(jordi!.type).toBe('narrative');
    expect(jordi!.syncCount).toBe(82);
    expect(jordi!.lastSync).toBe('2026-03-09');
    expect(jordi!.summaryCount).toBe(2);
    expect(typeof jordi!.hasNew).toBe('boolean');
    expect(jordi!.notes).toBe('Macro / AI / Finance');
  });

  it('returns channel detail for valid slug', async () => {
    const { getChannelDetail } = await import('@/lib/data');
    clearAllCache();
    const detail = await getChannelDetail('jordi-visser');
    expect(detail).not.toBeNull();
    expect(detail!.slug).toBe('jordi-visser');
    expect(detail!.name).toBe('Jordi Visser Labs');
    expect(detail!.type).toBe('narrative');
    expect(detail!.latest).not.toBeNull();
    expect(detail!.latest!.type).toBe('latest');
    expect(detail!.latest!.html).toContain('Key Points');
    expect(detail!.rolling).not.toBeNull();
    expect(detail!.narrative).not.toBeNull();
  });

  it('returns null narrative for info-type channel', async () => {
    const { getChannelDetail } = await import('@/lib/data');
    clearAllCache();
    const detail = await getChannelDetail('anthropic-ai');
    expect(detail).not.toBeNull();
    expect(detail!.type).toBe('info');
    expect(detail!.narrative).toBeNull();
    expect(detail!.latest).not.toBeNull();
    expect(detail!.rolling).not.toBeNull();
  });

  it('returns null for non-existent channel', async () => {
    const { getChannelDetail } = await import('@/lib/data');
    clearAllCache();
    const detail = await getChannelDetail('nonexistent-channel');
    expect(detail).toBeNull();
  });

  it('lists summaries for a channel', async () => {
    const { listChannelSummaries } = await import('@/lib/data');
    clearAllCache();
    const result = await listChannelSummaries('jordi-visser');
    expect(result.items).toBeInstanceOf(Array);
    expect(result.items.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);

    // Should be sorted by sourceDate descending
    expect(result.items[0].sourceDate >= result.items[1].sourceDate).toBe(true);
  });

  it('returns correct summary meta fields', async () => {
    const { listChannelSummaries } = await import('@/lib/data');
    clearAllCache();
    const result = await listChannelSummaries('jordi-visser');
    const first = result.items[0];
    expect(first.filename).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.sourceDate).toBeDefined();
    expect(first.duration).toBeDefined();
    expect(first.videoUrl).toBeDefined();
  });

  it('supports pagination for summaries', async () => {
    const { listChannelSummaries } = await import('@/lib/data');
    clearAllCache();
    const result = await listChannelSummaries('jordi-visser', { limit: 1, offset: 0 });
    expect(result.items.length).toBe(1);
    expect(result.total).toBe(2);
    expect(result.limit).toBe(1);
    expect(result.offset).toBe(0);
  });

  it('throws for non-existent channel summaries', async () => {
    const { listChannelSummaries } = await import('@/lib/data');
    clearAllCache();
    await expect(listChannelSummaries('nonexistent')).rejects.toThrow('CHANNEL_NOT_FOUND');
  });

  it('returns full summary with HTML', async () => {
    const { getChannelSummary } = await import('@/lib/data');
    clearAllCache();
    const summary = await getChannelSummary('jordi-visser', '2026-03-08_sample-video-one');
    expect(summary).not.toBeNull();
    expect(summary!.filename).toBe('2026-03-08_sample-video-one');
    expect(summary!.title).toBe('Markets Are Shifting: What You Need to Know');
    expect(summary!.sourceDate).toBe('2026-03-08');
    expect(summary!.duration).toBe('56:15');
    expect(summary!.videoUrl).toBe('https://www.youtube.com/watch?v=sample1');
    expect(summary!.channel).toBe('Jordi Visser Labs');
    expect(summary!.channelSlug).toBe('jordi-visser');
    expect(summary!.html).toContain('Key Points');
  });

  it('returns null for non-existent summary', async () => {
    const { getChannelSummary } = await import('@/lib/data');
    clearAllCache();
    const summary = await getChannelSummary('jordi-visser', 'nonexistent-file');
    expect(summary).toBeNull();
  });

  it('returns null for summary in non-existent channel', async () => {
    const { getChannelSummary } = await import('@/lib/data');
    clearAllCache();
    const summary = await getChannelSummary('nonexistent', '2026-03-08_sample-video-one');
    expect(summary).toBeNull();
  });
});
