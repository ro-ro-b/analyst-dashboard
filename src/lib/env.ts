import path from "path";

/**
 * Resolves the ANALYST_DATA_DIR environment variable.
 * Defaults to ./data relative to the current working directory.
 */
export function getDataDir(): string {
  const raw = process.env.ANALYST_DATA_DIR ?? "./data";
  // Resolve relative to cwd so it works from any working directory
  return path.resolve(process.cwd(), raw);
}

/**
 * Resolves the PORT environment variable.
 * Defaults to 3000.
 */
export function getPort(): number {
  const raw = process.env.PORT;
  if (!raw) return 3000;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? 3000 : parsed;
}
