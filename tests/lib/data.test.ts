import { describe, it, expect, beforeAll } from "vitest";
import { setTestDataDir } from "../helpers/test-data-dir";
import { getChannels, getChannel, getSummaries, getSummary } from "@/lib/data";

beforeAll(() => {
  setTestDataDir();
});

describe("getChannels", () => {
  it("returns all channels", async () => {
    const channels = await getChannels();
    expect(Array.isArray(channels)).toBe(true);
    expect(channels.length).toBeGreaterThan(0);
  });

  it("returns channels sorted by slug", async () => {
    const channels = await getChannels();
    const slugs = channels.map((c) => c.slug);
    const sorted = [...slugs].sort();
    expect(slugs).toEqual(sorted);
  });
});

describe("getChannel", () => {
  it("returns channel detail", async () => {
    const channel = await getChannel("jordi-visser");
    expect(channel.slug).toBe("jordi-visser");
    expect(channel.title).toBeTruthy();
  });

  it("throws ENOENT for unknown slug", async () => {
    await expect(getChannel("no-such-channel")).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});

describe("getSummaries", () => {
  it("returns paginated summaries", async () => {
    const result = await getSummaries("jordi-visser", 1, 10);
    expect(result.summaries.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it("throws ENOENT for unknown channel", async () => {
    await expect(getSummaries("no-such-channel", 1, 10)).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});

describe("getSummary", () => {
  it("returns a summary with body_html", async () => {
    const summary = await getSummary(
      "jordi-visser",
      "2026-03-08_sample-video-one.md"
    );
    expect(summary.filename).toBe("2026-03-08_sample-video-one.md");
    expect(summary.body_html).toContain("<");
  });

  it("throws ENOENT for unknown filename", async () => {
    await expect(
      getSummary("jordi-visser", "nonexistent.md")
    ).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("throws ENOENT for path traversal attempt", async () => {
    await expect(
      getSummary("jordi-visser", "../../../etc/passwd")
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
