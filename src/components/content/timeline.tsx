'use client';

import Link from 'next/link';
import { Calendar, Clock, Cpu } from 'lucide-react';
import type { SummaryMeta } from '@/types';

interface TimelineProps {
  items: SummaryMeta[];
  channelSlug: string;
}

interface MonthGroup {
  key: string;
  label: string;
  items: SummaryMeta[];
}

function groupByMonth(items: SummaryMeta[]): MonthGroup[] {
  // Sort a copy ascending by sourceDate (data layer returns descending)
  const sorted = [...items].sort(
    (a, b) => new Date(a.sourceDate).getTime() - new Date(b.sourceDate).getTime(),
  );

  const labelFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const groups: MonthGroup[] = [];
  const keyMap = new Map<string, MonthGroup>();

  for (const item of sorted) {
    const date = new Date(item.sourceDate);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    let group = keyMap.get(key);
    if (!group) {
      group = {
        key,
        label: labelFormatter.format(date),
        items: [],
      };
      keyMap.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }

  return groups;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function Timeline({ items, channelSlug }: TimelineProps) {
  const groups = groupByMonth(items);

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        No summaries available yet.
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {groups.map((group) => (
        <section key={group.key} className="relative">
          <div className="sticky top-0 z-10 -ml-1 mb-4 w-fit rounded-md border border-slate-800 bg-slate-950/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 backdrop-blur">
            {group.label}
          </div>
          <div className="relative space-y-4">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-700" />
            {group.items.map((item) => (
              <article key={item.filename} className="relative">
                <span className="absolute left-3 top-6 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-500 ring-4 ring-slate-950" />
                <Link
                  href={`/channel/${channelSlug}/summary/${item.filename}`}
                  className="group relative ml-8 block rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition-colors hover:border-slate-700 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:p-5"
                >
                  <h3 className="text-sm font-semibold leading-6 text-slate-100 transition-colors group-hover:text-white">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.sourceDate)}
                    </span>
                    {item.duration && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {item.duration}
                      </span>
                    )}
                    {item.model && (
                      <span className="inline-flex items-center gap-1.5">
                        <Cpu className="h-3 w-3" />
                        {item.model}
                      </span>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
