export function RenderedHtml({ html }: { html: string }) {
  return (
    <div
      className="max-w-[65ch] text-sm leading-7 text-slate-200 [&_h1]:mt-8 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_p]:mt-3 [&_p]:text-slate-300 [&_strong]:font-semibold [&_strong]:text-slate-100 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:text-slate-300 [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400 [&_a]:text-blue-300 [&_a]:underline-offset-4 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_hr]:my-6 [&_hr]:border-slate-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
