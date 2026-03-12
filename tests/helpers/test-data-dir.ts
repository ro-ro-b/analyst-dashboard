import path from "path";

export function setTestDataDir(): void {
  process.env.DATA_DIR = path.resolve(process.cwd(), "data");
}
