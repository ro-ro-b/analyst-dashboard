'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/content/empty-state';
import type { SummaryMeta } from '@/types';

type BrowsableSummary = SummaryMeta & { channelName: string; channelSlug: string };

interface SummariesBrowserProps {
  items: BrowsableSummary[];
  channels: Array<{ slug: string; name: string }>;
}

export function SummariesBrowser({ items, channels }: SummariesBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (query && !item.title.toLowerCase().includes(query)) return false;
      if (selectedChannels.size > 0 && !selectedChannels.has(item.channelSlug)) return false;
      return true;
    });
  }, [items, searchQuery, selectedChannels]);

  function toggleChannel(slug: string) {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  return (
    <section className="space-y-5">
      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search summaries by title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 pl-10 pr-3 text-sm text-slate-50 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:border-blue-400/40 transition-colors"
          />
        </div>
        {channels.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {channels.map((ch) => (
              <Badge
                key={ch.slug}
                variant={selectedChannels.has(ch.slug) ? 'default' : 'outline'}
                className="cursor-pointer select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ring-offset-slate-950"
                onClick={() => toggleChannel(ch.slug)}
              >
                {ch.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-slate-400">
        {filteredItems.length} {filteredItems.length === 1 ? 'summary' : 'summaries'}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 md:gap-4">
          {filteredItems.map((item) => (
            <Link
              key={`${item.channelSlug}/${item.filename}`}
              href={`/channel/${item.channelSlug}/summary/${item.filename}`}
              className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition-all hover:border-slate-700 hover:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-400/60 md:p-5"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-50 group-hover:text-white">
                    {item.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {item.channelName}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="font-mono">{item.sourceDate}</span>
                  {item.duration && (
                    <span className="font-mono">{item.duration}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
