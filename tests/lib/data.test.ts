import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setFixtureDataDir, setDataDir, clearDataDir } from "../helpers/test-data-dir";
import { cacheClear } from "../../src/lib/cache";
import {
  listChannels,
  getChannelDetail,
  listSummaries,
  getSummary,
} from "../../src/lib/data";

beforeEach(() => {
  setFixtureDataDir();
  cacheClear();
});

afterEach(() => {
  clearDataDir();
  cacheClear();
});

describe("listChannels", () => {
  it("discovers both fixture channels", async () => {
    const channels = await listChannels();
    expect(channels).toHaveLength(2);
  });

  it("returns correct jordi-visser metadata", async () => {
    const channels = await listChannels();
    const jordi = channels.find((c) => c.channel_slug === "jordi-visser");
    expect(jordi).toBeDefined();
    expect(jordi!.channel_name).toBe("Jordi Visser Labs");
    expect(jordi!.channel_type).toBe("narrative");
    expect(jordi!.sync_count).toBe(82);
    expect(jordi!.last_sync).toBe("2026-03-09");
  });

  it("returns correct anthropic-ai metadata", async () => {
    const channels = await listChannels();
    const anthropic = channels.find((c) => c.channel_slug === "anthropic-ai");
    expect(anthropic).toBeDefined();
    expect(anthropic!.channel_name).toBe("Anthropic");
    expect(anthropic!.channel_type).toBe("info");
    expect(anthropic!.sync_count).toBe(9);
    expect(anthropic!.last_sync).toBe("2026-03-09");
  });

  it("counts video files correctly for jordi-visser", async () => {
    const channels = await listChannels();
    const jordi = channels.find((c) => c.channel_slug === "jordi-visser");
    expect(jordi!.video_count).toBe(2);
  });

  it("counts video files correctly for anthropic-ai", async () => {
    const channels = await listChannels();
    const anthropic = channels.find((c) => c.channel_slug === "anthropic-ai");
    expect(anthropic!.video_count).toBe(1);
  });

  it("throws when data directory does not exist", async () => {
    setDataDir("/nonexistent/path/that/does/not/exist");
    cacheClear();
    await expect(listChannels()).rejects.toThrow();
  });

  it("returns cached result on second call", async () => {
    const first = await listChannels();
    const second = await listChannels();
    expect(first).toBe(second); // same reference from cache
  });
});

describe("getChannelDetail", () => {
  it("returns config for jordi-visser", async () => {
    const detail = await getChannelDetail("jordi-visser");
    expect(detail.config.channel_name).toBe("Jordi Visser Labs");
    expect(detail.config.channel_slug).toBe("jordi-visser");
    expect(detail.config.channel_type).toBe("narrative");
  });

  it("returns latest with rendered HTML for jordi-visser", async () => {
    const detail = await getChannelDetail("jordi-visser");
    expect(detail.latest).not.toBeNull();
    expect(detail.latest!.type).toBe("latest");
    expect(detail.latest!.body_html).toContain("<");
    expect(detail.latest!.generated_date).toBe("2026-03-09");
    expect(detail.latest!.model).toBe("claude-sonnet-4-6");
  });

  it("returns rolling with rendered HTML for jordi-visser", async () => {
    const detail = await getChannelDetail("jordi-visser");
    expect(detail.rolling).not.toBeNull();
    expect(detail.rolling!.type).toBe("rolling");
    expect(detail.rolling!.body_html).toContain("<");
    expect(detail.rolling!.video_count).toBe(3);
  });

  it("returns narrative with rendered HTML for jordi-visser", async () => {
    const detail = await getChannelDetail("jordi-visser");
    expect(detail.narrative).not.toBeNull();
    expect(detail.narrative!.type).toBe("narrative");
    expect(detail.narrative!.body_html).toContain("<");
    expect(detail.narrative!.model).toBe("claude-opus-4-6");
  });

  it("returns null narrative for anthropic-ai (info type)", async () => {
    const detail = await getChannelDetail("anthropic-ai");
    expect(detail.narrative).toBeNull();
  });

  it("returns latest and rolling for anthropic-ai", async () => {
    const detail = await getChannelDetail("anthropic-ai");
    expect(detail.latest).not.toBeNull();
    expect(detail.rolling).not.toBeNull();
  });

  it("throws not-found error for unknown slug", async () => {
    await expect(getChannelDetail("unknown-channel")).rejects.toThrow();
  });

  it("returns cached result on second call", async () => {
    const first = await getChannelDetail("jordi-visser");
    const second = await getChannelDetail("jordi-visser");
    expect(first).toBe(second);
  });
});

describe("listSummaries", () => {
  it("returns all summaries for jordi-visser", async () => {
    const result = await listSummaries("jordi-visser", 20, 0);
    expect(result.total).toBe(2);
    expect(result.summaries).toHaveLength(2);
  });

  it("sorts summaries by source_date descending", async () => {
    const result = await listSummaries("jordi-visser", 20, 0);
    expect(result.summaries[0].source_date).toBe("2026-03-08");
    expect(result.summaries[1].source_date).toBe("2026-03-01");
  });

  it("returns frontmatter only (no body_html)", async () => {
    const result = await listSummaries("jordi-visser", 20, 0);
    for (const summary of result.summaries) {
      expect(summary.body_html).toBeUndefined();
    }
  });

  it("paginates with limit", async () => {
    const result = await listSummaries("jordi-visser", 1, 0);
    expect(result.summaries).toHaveLength(1);
    expect(result.total).toBe(2);
  });

  it("paginates with offset", async () => {
    const result = await listSummaries("jordi-visser", 20, 1);
    expect(result.summaries).toHaveLength(1);
    expect(result.summaries[0].source_date).toBe("2026-03-01");
  });

  it("returns empty array when offset exceeds total", async () => {
    const result = await listSummaries("jordi-visser", 20, 100);
    expect(result.summaries).toHaveLength(0);
    expect(result.total).toBe(2);
  });

  it("returns correct summary for anthropic-ai", async () => {
    const result = await listSummaries("anthropic-ai", 20, 0);
    expect(result.total).toBe(1);
    expect(result.summaries[0].source_video).toBe("Sample Info Video");
  });

  it("throws not-found error for unknown slug", async () => {
    await expect(listSummaries("unknown-channel", 20, 0)).rejects.toThrow();
  });

  it("includes filename in each summary", async () => {
    const result = await listSummaries("jordi-visser", 20, 0);
    for (const summary of result.summaries) {
      expect(summary.filename).toBeDefined();
      expect(summary.filename).toMatch(/\.md$/);
    }
  });
});

describe("getSummary", () => {
  it("returns full summary with body_html", async () => {
    const summary = await getSummary(
      "jordi-visser",
      "2026-03-08_sample-video-one.md"
    );
    expect(summary.type).toBe("video_summary");
    expect(summary.source_video).toBe("Sample Video One");
    expect(summary.source_date).toBe("2026-03-08");
    expect(summary.duration).toBe("12:34");
    expect(summary.video_url).toBe("https://www.youtube.com/watch?v=abc123");
    expect(summary.body_html).toBeDefined();
    expect(summary.body_html).toContain("<");
  });

  it("renders markdown body to HTML", async () => {
    const summary = await getSummary(
      "jordi-visser",
      "2026-03-08_sample-video-one.md"
    );
    expect(summary.body_html).toContain("<h2");
    expect(summary.body_html).toContain("<li");
  });

  it("throws not-found for unknown channel", async () => {
    await expect(
      getSummary("unknown-channel", "2026-03-08_sample-video-one.md")
    ).rejects.toThrow();
  });

  it("throws not-found for unknown filename", async () => {
    await expect(
      getSummary("jordi-visser", "nonexistent-file.md")
    ).rejects.toThrow();
  });

  it("returns anthropic summary with body_html", async () => {
    const summary = await getSummary(
      "anthropic-ai",
      "2026-02-05_sample-info-video.md"
    );
    expect(summary.type).toBe("video_summary");
    expect(summary.body_html).toBeDefined();
    expect(summary.body_html).toContain("<");
  });
});
