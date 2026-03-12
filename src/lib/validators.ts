export function parseIntParam(
  value: string | null | undefined,
  defaultValue: number,
  min = 0,
  max = 100
): number {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < min) {
    return defaultValue;
  }
  return Math.min(parsed, max);
}
