import { listChannels } from '@/lib/data';
import { jsonOk, jsonError } from '@/lib/http';

export async function GET() {
  try {
    const channels = await listChannels();
    return jsonOk(channels);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(500, message);
  }
}
