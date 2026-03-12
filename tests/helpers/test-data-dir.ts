import path from "path";

/**
 * Returns the absolute path to the fixture data directory.
 * This is the data/ directory at the project root.
 */
export function getFixtureDataDir(): string {
  return path.resolve(process.cwd(), "data");
}

/**
 * Sets the ANALYST_DATA_DIR environment variable to the fixture data directory.
 * Call this in beforeEach/beforeAll to ensure tests use fixture data.
 */
export function setFixtureDataDir(): void {
  process.env.ANALYST_DATA_DIR = getFixtureDataDir();
}

/**
 * Sets the ANALYST_DATA_DIR environment variable to a custom path.
 */
export function setDataDir(dir: string): void {
  process.env.ANALYST_DATA_DIR = dir;
}

/**
 * Clears the ANALYST_DATA_DIR environment variable.
 */
export function clearDataDir(): void {
  delete process.env.ANALYST_DATA_DIR;
}
