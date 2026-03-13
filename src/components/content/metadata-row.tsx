import { Calendar, Clock } from 'lucide-react';

interface MetadataRowProps {
  generatedDate?: string;
  model?: string;
  sourceDate?: string;
  duration?: string;
  videoCount?: number;
}

export function MetadataRow({ generatedDate, model, sourceDate, duration, videoCount }: MetadataRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
      {sourceDate && (
        <span className="inline-flex items-center gap-1 font-mono">
          <Calendar className="h-3 w-3" />
          {sourceDate}
        </span>
      )}
      {duration && (
        <span className="inline-flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" />
          {duration}
        </span>
      )}
      {generatedDate && (
        <span className="font-mono">generated {generatedDate}</span>
      )}
      {model && (
        <span className="font-mono">{model}</span>
      )}
      {videoCount !== undefined && (
        <span className="font-mono">{videoCount} videos</span>
      )}
    </div>
  );
}
