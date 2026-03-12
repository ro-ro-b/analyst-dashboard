import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { getChannels, getChannel, getSummaries, getSummary } from "@/lib/data";
import { clearCache } from "@/lib/cache";

const TEST_DATA_DIR = path.join(
  new URL(".", import.meta.url).pathname,
  "../data"
);

describe("data layer", () => {
  beforeEach(() => {
    clearCache();
    process.env.DATA_DIR = TEST_DATA_DIR;
  });

  describe("getChannels", () => {
    it("returns all channels", async () => {
      const channels = await getChannels();
      expect(Array.isArray(channels)).toBe(true);
      expect(channels.length).toBeGreaterThanOrEqual(2);
    });

    it("each channel has slug and name", async () => {
      const channels = await getChannels();
      for (const ch of channels) {
        expect(ch.slug).toBeTruthy();
        expect(ch.name).toBeTruthy();
      }
    });
  });

  describe("getChannel", () => {
    it("returns channel with html fields", async () => {
      const channel = await getChannel("jordi-visser");
      expect(channel.slug).toBe("jordi-visser");
      expect(typeof channel.latest_html === "string" || channel.latest_html === null).toBe(true);
    });

    it("throws ENOENT for unknown slug", async () => {
      await expect(getChannel("no-such-channel")).rejects.toMatchObject({
        code: "ENOENT",
      });
    });
  });

  describe("getSummaries", () => {
    it("returns paginated list", async () => {
      const result = await getSummaries("jordi-visser", 1, 10);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it("throws ENOENT for unknown channel", async () => {
      await expect(getSummaries("no-such", 1, 10)).rejects.toMatchObject({
        code: "ENOENT",
      });
    });
  });

  describe("getSummary", () => {
    it("returns summary with body_html", async () => {
      const summary = await getSummary(
        "jordi-visser",
        "2026-03-08_sample-video-one.md"
      );
      expect(summary.body_html).toBeTruthy();
      expect(summary.title).toBeTruthy();
    });

    it("throws ENOENT for unknown file", async () => {
      await expect(
        getSummary("jordi-visser", "nonexistent.md")
      ).rejects.toMatchObject({ code: "ENOENT" });
    });

    it("throws ENOENT for path traversal", async () => {
      await expect(
        getSummary("jordi-visser", "../_channel.yaml")
      ).rejects.toMatchObject({ code: "ENOENT" });
    });
  });
});
