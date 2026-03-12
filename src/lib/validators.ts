/**
 * Validation and normalization helpers.
 */

/** Allowed summary types */
const VALID_SUMMARY_TYPES = new Set(["video_summary", "latest", "rolling", "narrative"]);

/** Allowed channel types */
const VALID_CHANNEL_TYPES = new Set(["narrative", "info"]);

/**
 * Returns true if the given string is a safe slug (alphanumeric + hyphens only).
 * Prevents path traversal attacks.
 */
export function isSafeSlug(slug: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(slug);
}

/**
 * Returns true if the given filename is safe (no path separators or traversal).
 */
export function isSafeFilename(filename: string): boolean {
  return (
    typeof filename === "string" &&
    filename.length > 0 &&
    !filename.includes("/") &&
    !filename.includes("\\") &&
    !filename.includes("..") &&
    /^[a-zA-Z0-9._-]+$/.test(filename)
  );
}

/**
 * Validates that a channel type is one of the allowed values.
 */
export function isValidChannelType(type: unknown): type is "narrative" | "info" {
  return typeof type === "string" && VALID_CHANNEL_TYPES.has(type);
}

/**
 * Validates that a summary type is one of the allowed values.
 */
export function isValidSummaryType(
  type: unknown
): type is "video_summary" | "latest" | "rolling" | "narrative" {
  return typeof type === "string" && VALID_SUMMARY_TYPES.has(type);
}

/**
 * Parses a query parameter as a non-negative integer.
 * Returns the default value if the parameter is missing or invalid.
 */
export function parseIntParam(
  value: string | null | undefined,
  defaultValue: number,
  min = 0
): number {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min) {
    return defaultValue;
  }
  return parsed;
}

/**
 * Strips the .md extension from a filename if present.
 */
export function stripMdExtension(filename: string): string {
  return filename.endsWith(".md") ? filename.slice(0, -3) : filename;
}

/**
 * Ensures a filename has the .md extension.
 */
export function ensureMdExtension(filename: string): string {
  return filename.endsWith(".md") ? filename : `${filename}.md`;
}
