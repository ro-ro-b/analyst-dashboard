import { NextRequest } from 'next/server';
import { listChannelSummaries } from '@/lib/data';
import { jsonOk, jsonError } from '@/lib/http';
import { assertSafeSegment } from '@/lib/paths';
import { paginationSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    assertSafeSegment(slug, 'slug');
  } catch {
    return jsonError(404, `Channel not found: ${slug}`);
  }

  const { searchParams } = request.nextUrl;
  const pagination = paginationSchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
  });

  const limit = pagination.success ? pagination.data.limit : 20;
  const offset = pagination.success ? pagination.data.offset : 0;

  try {
    const result = await listChannelSummaries(slug, { limit, offset });
    return jsonOk(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.startsWith('CHANNEL_NOT_FOUND:')) {
      return jsonError(404, `Channel not found: ${slug}`);
    }
    return jsonError(500, message);
  }
}
