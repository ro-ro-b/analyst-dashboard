import { describe, it, expect, beforeAll } from "vitest";
import { setTestDataDir } from "../helpers/test-data-dir";
import { GET as getSummaries } from "@/app/api/channels/[slug]/summaries/route";
import { GET as getSummary } from "@/app/api/channels/[slug]/summaries/[filename]/route";

beforeAll(() => {
  setTestDataDir();
});

describe("GET /api/channels/:slug/summaries", () => {
  it("returns paginated summaries", async () => {
    const request = new Request(
      "http://localhost/api/channels/jordi-visser/summaries"
    );
    const response = await getSummaries(request, {
      params: Promise.resolve({ slug: "jordi-visser" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("summaries");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("page");
    expect(data).toHaveProperty("limit");
    expect(data).toHaveProperty("totalPages");
  });

  it("returns summaries with required fields", async () => {
    const request = new Request(
      "http://localhost/api/channels/jordi-visser/summaries"
    );
    const response = await getSummaries(request, {
      params: Promise.resolve({ slug: "jordi-visser" }),
    });
    const data = await response.json();

    for (const summary of data.summaries) {
      expect(summary).toHaveProperty("filename");
      expect(summary).toHaveProperty("date");
      expect(summary).toHaveProperty("title");
      expect(summary).toHaveProperty("tags");
      expect(summary).toHaveProperty("body_html");
    }
  });

  it("returns 404 for unknown channel", async () => {
    const request = new Request(
      "http://localhost/api/channels/unknown-channel/summaries"
    );
    const response = await getSummaries(request, {
      params: Promise.resolve({ slug: "unknown-channel" }),
    });

    expect(response.status).toBe(404);
  });

  it("respects pagination parameters", async () => {
    const request = new Request(
      "http://localhost/api/channels/jordi-visser/summaries?page=1&limit=1"
    );
    const response = await getSummaries(request, {
      params: Promise.resolve({ slug: "jordi-visser" }),
    });
    const data = await response.json();

    expect(data.limit).toBe(1);
    expect(data.summaries.length).toBeLessThanOrEqual(1);
  });
});

describe("GET /api/channels/:slug/summaries/:filename", () => {
  it("returns a single summary", async () => {
    const request = new Request(
      "http://localhost/api/channels/jordi-visser/summaries/2026-03-08_sample-video-one.md"
    );
    const response = await getSummary(request, {
      params: Promise.resolve({
        slug: "jordi-visser",
        filename: "2026-03-08_sample-video-one.md",
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("summary");
    expect(data.summary.filename).toBe("2026-03-08_sample-video-one.md");
  });

  it("returns 404 for unknown filename", async () => {
    const request = new Request(
      "http://localhost/api/channels/jordi-visser/summaries/nonexistent.md"
    );
    const response = await getSummary(request, {
      params: Promise.resolve({
        slug: "jordi-visser",
        filename: "nonexistent.md",
      }),
    });

    expect(response.status).toBe(404);
  });

  it("returns rendered body_html", async () => {
    const request = new Request(
      "http://localhost/api/channels/jordi-visser/summaries/2026-03-08_sample-video-one.md"
    );
    const response = await getSummary(request, {
      params: Promise.resolve({
        slug: "jordi-visser",
        filename: "2026-03-08_sample-video-one.md",
      }),
    });
    const data = await response.json();

    expect(typeof data.summary.body_html).toBe("string");
    expect(data.summary.body_html).toContain("<");
  });
});
