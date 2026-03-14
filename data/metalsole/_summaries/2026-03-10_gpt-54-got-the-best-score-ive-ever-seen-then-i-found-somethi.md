---
type: video_summary
channel: MetalSole
channel_slug: metalsole
generated_date: 2026-03-14
model: claude-sonnet
---

## Key Points
- GPT-5.4 extra high scored 95% on planning benchmark — highest ever recorded for maintaining context across 100+ features in a product requirements document
- Cursor outperforms all native CLIs across every model tested: Opus 46 (77% → 93%), Sonnet 46 (87.4% → 92%), GPT-5.4 high (82% → 88.4%)
- Sonnet 4.6 jumped from 77% range to 92.4%, now matching Opus 4.6 performance on planning tasks
- Claude Code planning mode underperforms execution mode by 15 points (77% vs 92% for Opus 46)
- Gemini 3.1 Pro consistently worst performer at 52-57% across all tools
- Cursor appears to implement automatic verification pass, checking planned features against original requirements
- Benchmark rebuilt from scratch to ensure consistency after unexpected Sonnet 4.6 results

## Notable Claims or Positions
- Tool selection matters as much as model selection: Cursor's orchestration advantage creates 5-16 point swings regardless of underlying model
- Planning mode in Claude Code is counterproductive — execution mode with manual planning instruction produces superior results, suggesting workflow constraints limit model flexibility
- GPT-5.4's million-token context window specifically optimized for long-attention planning tasks, not general coding superiority

## Actionable Takeaways
- Switch to Cursor for planning phases across all models to capture 5-15 point performance gains
- If using Claude Code, bypass planning mode entirely — use execution mode with explicit planning prompts to allow model freedom in structuring approach
- For maximum planning accuracy, use GPT-5.4 extra high in Cursor (projected 95%+ coverage), but recognize Opus 4.6 and Sonnet 4.6 in Cursor both deliver 92-93% at lower cost
