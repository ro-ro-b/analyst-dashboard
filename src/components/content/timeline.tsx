'use client';

import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import type { SummaryMeta } from '@/types';

interface TimelineProps {
  items: SummaryMeta[];
  channelSlug: string;
}

export function Timeline({ items, channelSlug }: TimelineProps) {
  // Group summaries by month+year, preserving incoming order (descending by sourceDate)
  const groups: { label: string; items: SummaryMeta[] }[] = [];
  const groupMap = new Map<string, SummaryMeta[]>();

  for (const item of items) {
    const key = new Date(item.sourceDate).toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    if (!groupMap.has(key)) {
      const arr: SummaryMeta[] = [];
      groupMap.set(key, arr);
      groups.push({ label: key, items: arr });
    }
    groupMap.get(key)!.push(item);
  }

  return (
    <div className="relative mt-6 space-y-8">
      {groups.map((group) => (
        <section key={group.label} className="relative">
          <div className="sticky top-0 z-10 -mx-2 mb-3 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
            {group.label}
          </div>

          <div className="relative space-y-4">
            {/* Vertical timeline line */}
            <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-slate-700 sm:left-2" />

            {group.items.map((item) => (
              <div
                key={item.filename}
                className="relative flex items-start gap-3 sm:gap-4 pl-0"
              >
                {/* Timeline dot */}
                <div className="relative z-10 mt-5 h-2 w-2 shrink-0 rounded-full bg-blue-500 ring-4 ring-slate-950" />

                {/* Summary card */}
                <Link
                  href={`/channel/${channelSlug}/summary/${item.filename}`}
                  className="group block flex-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-sm transition-colors hover:border-slate-700 hover:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 active:border-slate-600"
                >
                  <div className="text-sm sm:text-base font-medium leading-6 text-slate-100 transition-colors group-hover:text-white">
                    {item.title}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {item.sourceDate}
                    </span>

                    {item.duration && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {item.duration}
                      </span>
                    )}

                    {item.model && (
                      <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                        {item.model}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
