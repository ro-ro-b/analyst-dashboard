import path from 'node:path';

export function getDataRoot(): string {
  return path.resolve(process.env.ANALYST_DATA_DIR || './data');
}

const SAFE_SEGMENT_RE = /^[a-zA-Z0-9._-]+$/;

export function assertSafeSegment(value: string, label: 'slug' | 'filename'): string {
  if (!value || value === '.' || value === '..') {
    throw new Error(`Invalid ${label}: "${value}"`);
  }
  if (value.includes('/') || value.includes('\\')) {
    throw new Error(`Invalid ${label}: contains path separator`);
  }
  if (!SAFE_SEGMENT_RE.test(value)) {
    throw new Error(`Invalid ${label}: "${value}" contains disallowed characters`);
  }
  return value;
}

export function resolveWithinDataRoot(...segments: string[]): string {
  const root = getDataRoot();
  const resolved = path.resolve(root, ...segments);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path traversal detected: resolved path is outside data root`);
  }
  return resolved;
}
