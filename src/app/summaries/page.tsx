import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { listChannels, listChannelSummaries } from '@/lib/data';
import { SummariesBrowser } from '@/components/content/summaries-browser';
import type { SummaryMeta } from '@/types';

type BrowsableSummary = SummaryMeta & { channelName: string; channelSlug: string };

/**
 * Cross-channel summaries browser.
 *
 * Fetches all summaries from every channel using the existing data layer.
 * The limit of 1000 per channel is a safe ceiling — the current dataset
 * has fewer than 10 summaries total across all channels.
 */
export default async function SummariesPage() {
  const channels = await listChannels();

  const nested = await Promise.all(
    channels.map(async (channel) => {
      const result = await listChannelSummaries(channel.slug, { limit: 1000 });
      return result.items.map((item): BrowsableSummary => ({
        ...item,
        channelName: channel.name,
        channelSlug: channel.slug,
      }));
    }),
  );

  const allSummaries = nested
    .flat()
    .sort((a, b) => new Date(b.sourceDate).getTime() - new Date(a.sourceDate).getTime());

  const channelList = channels.map(({ slug, name }) => ({ slug, name }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              All Summaries
            </h1>
            <p className="text-sm text-slate-400">
              Search and filter summaries across all analyst channels.
            </p>
          </header>

          <SummariesBrowser items={allSummaries} channels={channelList} />
        </div>
      </main>
    </div>
  );
}
