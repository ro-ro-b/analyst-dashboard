import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setFixtureDataDir, setDataDir, clearDataDir } from "../helpers/test-data-dir";
import { cacheClear } from "../../src/lib/cache";

// We test the route handlers directly by importing them and constructing
// Request objects, since supertest doesn't work well with Next.js app router.

beforeEach(() => {
  setFixtureDataDir();
  cacheClear();
});

afterEach(() => {
  clearDataDir();
  cacheClear();
  vi.restoreAllMocks();
});

async function callChannelsRoute(): Promise<Response> {
  const { GET } = await import("../../src/app/api/channels/route");
  return GET();
}

async function callChannelDetailRoute(slug: string): Promise<Response> {
  const { GET } = await import("../../src/app/api/channels/[slug]/route");
  const request = new Request(`http://localhost/api/channels/${slug}`);
  return GET(request, { params: Promise.resolve({ slug }) });
}

describe("GET /api/channels", () => {
  it("returns 200 with array of channels", async () => {
    const response = await callChannelsRoute();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("returns both fixture channels", async () => {
    const response = await callChannelsRoute();
    const body = await response.json();
    expect(body).toHaveLength(2);
  });

  it("includes expected fields for each channel", async () => {
    const response = await callChannelsRoute();
    const body = await response.json();
    for (const channel of body) {
      expect(channel).toHaveProperty("channel_name");
      expect(channel).toHaveProperty("channel_slug");
      expect(channel).toHaveProperty("channel_type");
      expect(channel).toHaveProperty("sync_count");
      expect(channel).toHaveProperty("last_sync");
      expect(channel).toHaveProperty("video_count");
    }
  });

  it("returns correct jordi-visser data", async () => {
    const response = await callChannelsRoute();
    const body = await response.json();
    const jordi = body.find((c: { channel_slug: string }) => c.channel_slug === "jordi-visser");
    expect(jordi).toBeDefined();
    expect(jordi.channel_name).toBe("Jordi Visser Labs");
    expect(jordi.channel_type).toBe("narrative");
    expect(jordi.sync_count).toBe(82);
    expect(jordi.last_sync).toBe("2026-03-09");
    expect(jordi.video_count).toBe(2);
  });

  it("returns correct anthropic-ai data", async () => {
    const response = await callChannelsRoute();
    const body = await response.json();
    const anthropic = body.find((c: { channel_slug: string }) => c.channel_slug === "anthropic-ai");
    expect(anthropic).toBeDefined();
    expect(anthropic.channel_name).toBe("Anthropic");
    expect(anthropic.channel_type).toBe("info");
    expect(anthropic.sync_count).toBe(9);
    expect(anthropic.video_count).toBe(1);
  });

  it("returns 500 when data directory does not exist", async () => {
    setDataDir("/nonexistent/path/that/does/not/exist");
    cacheClear();
    const response = await callChannelsRoute();
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });
});

describe("GET /api/channels/[slug]", () => {
  it("returns 200 with channel detail for jordi-visser", async () => {
    const response = await callChannelDetailRoute("jordi-visser");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty("config");
    expect(body).toHaveProperty("latest");
    expect(body).toHaveProperty("rolling");
    expect(body).toHaveProperty("narrative");
  });

  it("returns correct config for jordi-visser", async () => {
    const response = await callChannelDetailRoute("jordi-visser");
    const body = await response.json();
    expect(body.config.channel_name).toBe("Jordi Visser Labs");
    expect(body.config.channel_slug).toBe("jordi-visser");
    expect(body.config.channel_type).toBe("narrative");
    expect(body.config.sync_count).toBe(82);
  });

  it("returns latest with body_html for jordi-visser", async () => {
    const response = await callChannelDetailRoute("jordi-visser");
    const body = await response.json();
    expect(body.latest).not.toBeNull();
    expect(body.latest.type).toBe("latest");
    expect(body.latest.body_html).toContain("<");
  });

  it("returns narrative for jordi-visser (narrative type)", async () => {
    const response = await callChannelDetailRoute("jordi-visser");
    const body = await response.json();
    expect(body.narrative).not.toBeNull();
    expect(body.narrative.type).toBe("narrative");
  });

  it("returns null narrative for anthropic-ai (info type)", async () => {
    const response = await callChannelDetailRoute("anthropic-ai");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.narrative).toBeNull();
  });

  it("returns 404 for unknown slug", async () => {
    const response = await callChannelDetailRoute("unknown-channel");
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  it("returns 404 for slug with path traversal attempt", async () => {
    const response = await callChannelDetailRoute("../etc/passwd");
    expect(response.status).toBe(404);
  });
});
