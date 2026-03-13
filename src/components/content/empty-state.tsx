interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 px-4 py-8 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
