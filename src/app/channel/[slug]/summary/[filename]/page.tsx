import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getChannelSummary } from '@/lib/data';
import { RenderedHtml } from '@/components/content/rendered-html';
import { MetadataRow } from '@/components/content/metadata-row';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/content/share-button';

export default async function SummaryDetailPage({
  params,
}: {
  params: Promise<{ slug: string; filename: string }>;
}) {
  const { slug, filename } = await params;
  const summary = await getChannelSummary(slug, filename);

  if (!summary) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Link
            href={`/channel/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {summary.channel}
          </Link>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
                  {summary.title}
                </h1>
                <MetadataRow
                  label="Source Date"
                  value={summary.sourceDate}
                />
                {summary.duration && (
                  <MetadataRow
                    label="Duration"
                    value={summary.duration}
                  />
                )}
                {summary.generatedDate && (
                  <MetadataRow
                    label="Generated"
                    value={summary.generatedDate}
                  />
                )}
                {summary.model && (
                  <MetadataRow
                    label="Model"
                    value={summary.model}
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {summary.videoUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={summary.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      YouTube
                    </a>
                  </Button>
                )}
                <ShareButton
                  title={summary.title}
                  text={`${summary.channel}: ${summary.title}`}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur-sm md:p-6">
            <RenderedHtml html={summary.html} />
          </div>
        </div>
      </main>
    </div>
  );
}
