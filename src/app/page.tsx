import Link from 'next/link';
import { listChannels } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default async function DashboardPage() {
  let channels;
  let error: string | null = null;

  try {
    channels = await listChannels();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load channels';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Analyst Dashboard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Channel Briefings
          </h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Browse latest analyst transcript summaries and thesis tracking across discovered channels.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {channels && channels.length > 0 ? (
              channels.map((channel) => (
                <Link key={channel.slug} href={`/channel/${channel.slug}`}>
                  <Card className="cursor-pointer hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{channel.name}</CardTitle>
                        <Badge variant={channel.type === 'narrative' ? 'narrative' : 'info'}>
                          {channel.type}
                        </Badge>
                        {channel.hasNew && (
                          <Badge variant="new">NEW</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                        <span className="font-mono">{channel.summaryCount} summaries</span>
                        <span className="font-mono">{channel.syncCount} syncs</span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          {channel.lastSync}
                        </span>
                      </div>
                      {channel.notes && (
                        <p className="mt-2 text-xs text-slate-500">{channel.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-slate-800 bg-slate-950/60 px-4 py-8 text-center">
                <p className="text-sm text-slate-500">No channels discovered yet.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
