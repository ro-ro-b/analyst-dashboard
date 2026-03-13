import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ExternalLink } from 'lucide-react';
import { getChannelDetail, listChannelSummaries } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/content/empty-state';
import { ContentBlock } from '@/components/content/content-block';

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let channel;
  let summaries;
  let error: string | null = null;

  try {
    channel = await getChannelDetail(slug);
    summaries = await listChannelSummaries(slug);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load channel';
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to channels
          </Link>
          <div className="mt-6 rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400">
            {error || 'Channel not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to channels
        </Link>

        <header className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              {channel.name}
            </h1>
            <Badge variant={channel.type === 'narrative' ? 'narrative' : 'info'}>
              {channel.type}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <span className="font-mono">{channel.syncCount} syncs</span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Calendar className="h-3 w-3" />
              {channel.lastSync}
            </span>
          </div>
        </header>

        {/* Timeline navigation link */}
        <div className="mt-4">
          <Link
            href={`/channel/${slug}/timeline`}
            className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-md"
          >
            <Clock className="h-4 w-4" />
            View Timeline
          </Link>
        </div>

        {/* Content blocks */}
        <div className="mt-6 space-y-6">
          {channel.latest && (
            <ContentBlock title="Latest Summary" content={channel.latest} />
          )}
          {channel.rolling && (
            <ContentBlock title="Rolling Summary" content={channel.rolling} />
          )}
          {channel.narrative && (
            <ContentBlock title="Narrative Tracking" content={channel.narrative} />
          )}
        </div>

        {/* Video Summaries */}
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">
            Video Summaries
          </h2>
          {!summaries || summaries.items.length === 0 ? (
            <EmptyState message="No video summaries available" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {summaries.items.map((summary) => (
                <Link
                  key={summary.filename}
                  href={`/channel/${slug}/summary/${summary.filename}`}
                >
                  <Card className="cursor-pointer hover:border-slate-700 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium leading-5">
                        {summary.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          {summary.sourceDate}
                        </span>
                        {summary.duration && (
                          <span className="font-mono">{summary.duration}</span>
                        )}
                        {summary.model && (
                          <Badge variant="outline" className="text-[10px]">
                            {summary.model}
                          </Badge>
                        )}
                        {summary.videoUrl && (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
