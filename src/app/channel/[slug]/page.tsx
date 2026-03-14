import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChannelDetail, listChannelSummaries } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/content/empty-state';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { ChannelTabs } from './channel-tabs';

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let channel;
  try {
    channel = await getChannelDetail(slug);
  } catch {
    notFound();
  }

  if (!channel) {
    notFound();
  }

  let summariesResult;
  try {
    summariesResult = await listChannelSummaries(slug);
  } catch {
    summariesResult = { items: [], total: 0, limit: 20, offset: 0 };
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <header className="mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              {channel.name}
            </h1>
            <Badge variant={channel.type === 'narrative' ? 'narrative' : 'info'}>
              {channel.type}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 font-mono">
            <span>last sync {channel.lastSync}</span>
            <span>{channel.syncCount} syncs</span>
          </div>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
          <ChannelTabs channel={channel} />
        </section>

        <div className="mt-4 mb-2">
          <Link
            href={`/channel/${slug}/timeline`}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Clock className="h-4 w-4" />
            View Timeline
          </Link>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Video Summaries</h2>
          </div>
          <div className="space-y-3">
            {summariesResult.items.length > 0 ? (
              summariesResult.items.map((summary) => (
                <Link
                  key={summary.filename}
                  href={`/channel/${slug}/summary/${summary.filename}`}
                >
                  <div className="group flex w-full flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors">
                        {summary.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {summary.sourceDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {summary.sourceDate}
                        </span>
                      )}
                      {summary.duration && <span>{summary.duration}</span>}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState message="No summaries available for this channel yet." />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
