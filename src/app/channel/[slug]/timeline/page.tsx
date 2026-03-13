import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getChannelDetail, listChannelSummaries } from '@/lib/data';
import { Timeline } from '@/components/content/timeline';
import { EmptyState } from '@/components/content/empty-state';

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const channel = await getChannelDetail(slug);
  const summaries = await listChannelSummaries(slug);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href={`/channel/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-md active:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to channel
        </Link>

        <header className="mt-4 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            {channel.name} — Timeline
          </h1>
          <p className="text-sm text-slate-400">
            All video summaries in chronological order.
          </p>
        </header>

        {summaries.items.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6">
            <EmptyState message="No summaries yet" />
          </div>
        ) : (
          <Timeline items={summaries.items} channelSlug={slug} />
        )}
      </main>
    </div>
  );
}
