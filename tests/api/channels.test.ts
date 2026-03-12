import { describe, it, expect, beforeEach } from "vitest";
import { GET as getChannels } from "@/app/api/channels/route";
import { GET as getChannel } from "@/app/api/channels/[slug]/route";
import { clearCache } from "@/lib/cache";

const TEST_DATA_DIR = new URL("../helpers/test-data-dir.ts", import.meta.url)
  .pathname
  .replace(/\/[^/]+$/, "/data");

function makeSlugParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/channels", () => {
  beforeEach(() => {
    clearCache();
    process.env.DATA_DIR = TEST_DATA_DIR;
  });

  it("returns a list of channels", async () => {
    const response = await getChannels();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it("each channel has required fields", async () => {
    const response = await getChannels();
    const data = await response.json();
    for (const channel of data) {
      expect(channel).toHaveProperty("slug");
      expect(channel).toHaveProperty("name");
      expect(channel).toHaveProperty("description");
    }
  });
});

describe("GET /api/channels/[slug]", () => {
  beforeEach(() => {
    clearCache();
    process.env.DATA_DIR = TEST_DATA_DIR;
  });

  it("returns channel details for a valid slug", async () => {
    const response = await getChannel(
      new Request("http://localhost/api/channels/jordi-visser"),
      makeSlugParams("jordi-visser")
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.slug).toBe("jordi-visser");
  });

  it("returns 404 for unknown slug", async () => {
    const response = await getChannel(
      new Request("http://localhost/api/channels/unknown-channel"),
      makeSlugParams("unknown-channel")
    );
    expect(response.status).toBe(404);
  });
});
