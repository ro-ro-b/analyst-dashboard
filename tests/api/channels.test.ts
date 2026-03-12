import { describe, it, expect, beforeAll } from "vitest";
import { setTestDataDir } from "../helpers/test-data-dir";
import { GET as getChannels } from "@/app/api/channels/route";
import { GET as getChannel } from "@/app/api/channels/[slug]/route";

beforeAll(() => {
  setTestDataDir();
});

describe("GET /api/channels", () => {
  it("returns a list of channels", async () => {
    const response = await getChannels();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("channels");
    expect(Array.isArray(data.channels)).toBe(true);
    expect(data.channels.length).toBeGreaterThan(0);
  });

  it("returns channels with required fields", async () => {
    const response = await getChannels();
    const data = await response.json();

    for (const channel of data.channels) {
      expect(channel).toHaveProperty("slug");
      expect(channel).toHaveProperty("title");
      expect(channel).toHaveProperty("description");
      expect(channel).toHaveProperty("url");
      expect(channel).toHaveProperty("tags");
      expect(Array.isArray(channel.tags)).toBe(true);
    }
  });

  it("includes known fixture channels", async () => {
    const response = await getChannels();
    const data = await response.json();
    const slugs = data.channels.map((c: { slug: string }) => c.slug);

    expect(slugs).toContain("jordi-visser");
    expect(slugs).toContain("anthropic-ai");
  });
});

describe("GET /api/channels/:slug", () => {
  it("returns channel detail for a valid slug", async () => {
    const request = new Request("http://localhost/api/channels/jordi-visser");
    const response = await getChannel(request, {
      params: Promise.resolve({ slug: "jordi-visser" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("channel");
    expect(data.channel.slug).toBe("jordi-visser");
  });

  it("returns 404 for unknown slug", async () => {
    const request = new Request("http://localhost/api/channels/unknown-channel");
    const response = await getChannel(request, {
      params: Promise.resolve({ slug: "unknown-channel" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns rendered HTML fields", async () => {
    const request = new Request("http://localhost/api/channels/jordi-visser");
    const response = await getChannel(request, {
      params: Promise.resolve({ slug: "jordi-visser" }),
    });
    const data = await response.json();

    expect(data.channel).toHaveProperty("narrative_html");
    expect(typeof data.channel.narrative_html).toBe("string");
    expect(data.channel.narrative_html).toContain("<");
  });
});
