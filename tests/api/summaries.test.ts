import { describe, it, expect, beforeEach } from "vitest";
import { GET as getSummaries } from "@/app/api/channels/[slug]/summaries/route";
import { GET as getSummary } from "@/app/api/channels/[slug]/summaries/[filename]/route";
import { clearCache } from "@/lib/cache";

const TEST_DATA_DIR = new URL("../helpers/test-data-dir.ts", import.meta.url)
  .pathname
  .replace(/\/[^/]+$/, "/data");

function makeParams(slug: string, filename?: string) {
  return {
    params: Promise.resolve(
      filename ? { slug, filename } : { slug, filename: "" }
    ),
  };
}

describe("GET /api/channels/[slug]/summaries", () => {
  beforeEach(() => {
    clearCache();
    process.env.DATA_DIR = TEST_DATA_DIR;
  });

  it("returns paginated summaries for a valid channel", async () => {
    const response = await getSummaries(
      new Request("http://localhost/api/channels/jordi-visser/summaries"),
      makeParams("jordi-visser")
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("page");
    expect(data).toHaveProperty("limit");
    expect(Array.isArray(data.items)).toBe(true);
  });

  it("returns 404 for unknown channel", async () => {
    const response = await getSummaries(
      new Request("http://localhost/api/channels/unknown/summaries"),
      makeParams("unknown")
    );
    expect(response.status).toBe(404);
  });

  it("respects pagination params", async () => {
    const response = await getSummaries(
      new Request(
        "http://localhost/api/channels/jordi-visser/summaries?page=1&limit=1"
      ),
      makeParams("jordi-visser")
    );
    const data = await response.json();
    expect(data.items.length).toBeLessThanOrEqual(1);
    expect(data.limit).toBe(1);
  });
});

describe("GET /api/channels/[slug]/summaries/[filename]", () => {
  beforeEach(() => {
    clearCache();
    process.env.DATA_DIR = TEST_DATA_DIR;
  });

  it("returns a summary with body_html", async () => {
    const response = await getSummary(
      new Request(
        "http://localhost/api/channels/jordi-visser/summaries/2026-03-08_sample-video-one.md"
      ),
      makeParams("jordi-visser", "2026-03-08_sample-video-one.md")
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("body_html");
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("filename");
  });

  it("returns 404 for unknown summary", async () => {
    const response = await getSummary(
      new Request(
        "http://localhost/api/channels/jordi-visser/summaries/nonexistent.md"
      ),
      makeParams("jordi-visser", "nonexistent.md")
    );
    expect(response.status).toBe(404);
  });

  it("returns 404 for path traversal attempt", async () => {
    const response = await getSummary(
      new Request(
        "http://localhost/api/channels/jordi-visser/summaries/..%2F_channel.yaml"
      ),
      makeParams("jordi-visser", "../_channel.yaml")
    );
    expect(response.status).toBe(404);
  });
});
