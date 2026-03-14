---
type: video_summary
channel: MetalSole
channel_slug: metalsole
generated_date: 2026-03-05
model: claude-sonnet
---

## Key Points
- Six-month planning benchmark across 8+ frontier models shows consistent 70-90% coverage; Gemini 3.1 Pro scored 38-49% across five separate test runs using different harnesses (Gemini CLI, Anthropic, Cursor)
- Benchmark measures requirement coverage in planning phase using 10-file PRD with hundreds of requirements; evaluator checks plan completeness before build phase
- Gemini 3.1 Pro produced 90-line markdown plan from thousands of lines of PRD requirements, completing in under one minute versus 15+ minutes for other frontier models
- Single-file, smaller PRD test with Gemini 3.1 Pro achieved 85% initial coverage, reaching 98% after iterative evaluation prompts
- Presenter frames result not as model failure but as critical lesson in AI evaluation instincts, analogizing to learned skepticism toward misleading headlines and commercial claims

## Notable Claims or Positions
- Presenter asserts planning phase gaps cascade to final product: "If something doesn't make it into the plan, it's a near certainty that it won't make it into the final product"
- Suggests Gemini 3.1 Pro may be optimized for smaller, segmented requests rather than large multifile planning tasks based on single-file test performance improvement
- Argues users lack developed instincts for AI output validation comparable to decades-old filters for advertising and phishing: "AI is a brand new mode. And those instincts, they don't actually transfer"
- Emphasizes completeness versus correctness distinction in AI outputs: "It might be correct, sure. But complete, that's actually a different question"

## Actionable Takeaways
- Insert evaluation prompts after AI planning phases to audit requirement coverage before proceeding to implementation; use iterative review loops to reach 95%+ coverage
- Test models against consistent benchmarks across multiple harnesses before production deployment; download open-source planning benchmark (linked in video description) for repeatable testing
- Develop systematic validation protocols for AI outputs rather than relying on surface-level assessment of format and structure; question whether deliverables match full scope of original request
