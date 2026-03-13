import { NextRequest } from 'next/server';
import { getChannelDetail } from '@/lib/data';
import { jsonOk, jsonError } from '@/lib/http';
import { assertSafeSegment } from '@/lib/paths';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    assertSafeSegment(slug, 'slug');
  } catch {
    return jsonError(404, `Channel not found: ${slug}`);
  }

  try {
    const detail = await getChannelDetail(slug);
    if (!detail) {
      return jsonError(404, `Channel not found: ${slug}`);
    }
    return jsonOk(detail);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error parsing channel files';
    return jsonError(500, message);
  }
}
