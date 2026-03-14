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
  const items = summaries.items;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 border-b border-slate-800 pb-6">
        <Link
          href={`/channel/${slug}`}
          className="inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to channel
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            {channel.name} — Timeline
          </h1>
          <p className="text-sm text-slate-400">
            Chronological view of all video summaries.
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <EmptyState message="No summaries yet" />
      ) : (
        <Timeline items={items} channelSlug={slug} />
      )}
    </main>
  );
}
