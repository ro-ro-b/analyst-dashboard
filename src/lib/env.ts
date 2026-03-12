import path from "path";

export function getDataDir(): string {
  const dataDir = process.env.DATA_DIR;
  if (dataDir) {
    return path.resolve(dataDir);
  }
  return path.resolve(process.cwd(), "data");
}
