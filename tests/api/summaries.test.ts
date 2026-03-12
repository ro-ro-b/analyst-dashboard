import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setFixtureDataDir, clearDataDir } from "../helpers/test-data-dir";
import { cacheClear } from "../../src/lib/cache";

beforeEach(() => {
  setFixtureDataDir();
  cacheClear();
});

afterEach(() => {
  clearDataDir();
  cacheClear();
  vi.restoreAllMocks();
});

async function callSummariesRoute(
  slug: string,
  query: Record<string, string> = {}
): Promise<Response> {
  const { GET } = await import(
    "../../src/app/api/channels/[slug]/summaries/route"
  );
  const params = new URLSearchParams(query);
  const url = `http://localhost/api/channels/${slug}/summaries?${params.toString()}`;
  const request = new Request(url);
  return GET(request, { params: Promise.resolve({ slug }) });
}

async function callSummaryDetailRoute(
  slug: string,
  filename: string
): Promise<Response> {
  const { GET } = await import(
    "../../src/app/api/channels/[slug]/summaries/[filename]/route"
  );
  const request = new Request(
    `http://localhost/api/channels/${slug}/summaries/${filename}`
  );
  return GET(request, { params: Promise.resolve({ slug, filename }) });
}

describe("GET /api/channels/[slug]/summaries", () => {
  it("returns 200 with summaries and total for jordi-visser", async () => {
    const response = await callSummariesRoute("jordi-visser");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("summaries");
    expect(body).toHaveProperty("total");
    expect(Array.isArray(body.summaries)).toBe(true);
  });

  it("returns all 2 summaries for jordi-visser", async () => {
    const response = await callSummariesRoute("jordi-visser");
    const body = await response.json();
    expect(body.total).toBe(2);
    expect(body.summaries).toHaveLength(2);
  });

  it("returns summaries sorted by date descending", async () => {
    const response = await callSummariesRoute("jordi-visser");
    const body = await response.json();
    expect(body.summaries[0].source_date).toBe("2026-03-08");
    expect(body.summaries[1].source_date).toBe("2026-03-01");
  });

  it("returns frontmatter only (no body_html)", async () => {
    const response = await callSummariesRoute("jordi-visser");
    const body = await response.json();
    for (const summary of body.summaries) {
      expect(summary.body_html).toBeUndefined();
    }
  });

  it("respects limit query param", async () => {
    const response = await callSummariesRoute("jordi-visser", { limit: "1" });
    const body = await response.json();
    expect(body.summaries).toHaveLength(1);
    expect(body.total).toBe(2);
  });

  it("respects offset query param", async () => {
    const response = await callSummariesRoute("jordi-visser", { offset: "1" });
    const body = await response.json();
    expect(body.summaries).toHaveLength(1);
    expect(body.summaries[0].source_date).toBe("2026-03-01");
  });

  it("returns empty summaries when offset exceeds total", async () => {
    const response = await callSummariesRoute("jordi-visser", { offset: "100" });
    const body = await response.json();
    expect(body.summaries).toHaveLength(0);
    expect(body.total).toBe(2);
  });

  it("uses default limit of 20 when not specified", async () => {
    const response = await callSummariesRoute("jordi-visser");
    const body = await response.json();
    // With only 2 summaries, all should be returned
    expect(body.summaries).toHaveLength(2);
  });

  it("returns 1 summary for anthropic-ai", async () => {
    const response = await callSummariesRoute("anthropic-ai");
    const body = await response.json();
    expect(body.total).toBe(1);
    expect(body.summaries).toHaveLength(1);
  });

  it("returns 404 for unknown slug", async () => {
    const response = await callSummariesRoute("unknown-channel");
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  it("includes filename in each summary", async () => {
    const response = await callSummariesRoute("jordi-visser");
    const body = await response.json();
    for (const summary of body.summaries) {
      expect(summary.filename).toBeDefined();
    }
  });

  it("returns 404 for slug with path traversal", async () => {
    const response = await callSummariesRoute("../etc");
    expect(response.status).toBe(404);
  });
});

describe("GET /api/channels/[slug]/summaries/[filename]", () => {
  it("returns 200 with full summary including body_html", async () => {
    const response = await callSummaryDetailRoute(
      "jordi-visser",
      "2026-03-08_sample-video-one.md"
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.type).toBe("video_summary");
    expect(body.body_html).toBeDefined();
    expect(body.body_html).toContain("<");
  });

  it("returns correct metadata for sample-video-one", async () => {
    const response = await callSummaryDetailRoute(
      "jordi-visser",
      "2026-03-08_sample-video-one.md"
    );
    const body = await response.json();
    expect(body.source_video).toBe("Sample Video One");
    expect(body.source_date).toBe("2026-03-08");
    expect(body.duration).toBe("12:34");
    expect(body.video_url).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("renders markdown body to HTML with headings and lists", async () => {
    const response = await callSummaryDetailRoute(
      "jordi-visser",
      "2026-03-08_sample-video-one.md"
    );
    const body = await response.json();
    expect(body.body_html).toContain("<h2");
    expect(body.body_html).toContain("<li");
  });

  it("works without .md extension in filename", async () => {
    const response = await callSummaryDetailRoute(
      "jordi-visser",
      "2026-03-08_sample-video-one"
    );
    expect(response.status).toBe(200);
  });

  it("returns anthropic summary with body_html", async () => {
    const response = await callSummaryDetailRoute(
      "anthropic-ai",
      "2026-02-05_sample-info-video.md"
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.type).toBe("video_summary");
    expect(body.body_html).toBeDefined();
  });

  it("returns 404 for unknown channel", async () => {
    const response = await callSummaryDetailRoute(
      "unknown-channel",
      "2026-03-08_sample-video-one.md"
    );
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  it("returns 404 for unknown filename", async () => {
    const response = await callSummaryDetailRoute(
      "jordi-visser",
      "nonexistent-file.md"
    );
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  it("returns 404 for filename with path traversal", async () => {
    const response = await callSummaryDetailRoute(
      "jordi-visser",
      "../../../etc/passwd"
    );
    expect(response.status).toBe(404);
  });
});
