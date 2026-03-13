import { NextRequest } from 'next/server';
import { getChannelSummary } from '@/lib/data';
import { jsonOk, jsonError } from '@/lib/http';
import { assertSafeSegment } from '@/lib/paths';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  const { slug, filename } = await params;

  try {
    assertSafeSegment(slug, 'slug');
    assertSafeSegment(filename, 'filename');
  } catch {
    return jsonError(404, `Summary not found`);
  }

  try {
    const summary = await getChannelSummary(slug, filename);
    if (!summary) {
      return jsonError(404, `Summary not found: ${filename}`);
    }
    return jsonOk(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(500, message);
  }
}
