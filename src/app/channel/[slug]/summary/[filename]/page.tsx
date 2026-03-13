import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChannelSummary } from '@/lib/data';
import { RenderedHtml } from '@/components/content/rendered-html';
import { MetadataRow } from '@/components/content/metadata-row';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ slug: string; filename: string }>;
}) {
  const { slug, filename } = await params;

  let summary;
  try {
    summary = await getChannelSummary(slug, filename);
  } catch {
    notFound();
  }

  if (!summary) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href={`/channel/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {summary.channel}
          </Link>
        </div>

        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6">
          <header className="mb-6 space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              {summary.channel}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              {summary.title}
            </h1>
            <MetadataRow
              sourceDate={summary.sourceDate}
              duration={summary.duration}
              generatedDate={summary.generatedDate}
              model={summary.model}
            />
            {summary.videoUrl && (
              <div>
                <a
                  href={summary.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Watch on YouTube
                </a>
              </div>
            )}
          </header>
          <div className="border-t border-slate-800 pt-6">
            <RenderedHtml html={summary.html} />
          </div>
        </article>
      </main>
    </div>
  );
}
