---
type: video_summary
channel: MetalSole
channel_slug: metalsole
generated_date: 2026-03-07
model: claude-sonnet
---

## Key Points
- AI silently drops 40% of requirements in controlled experiments across identical prompts - core features, not edge cases
- Folder-based workflow treats filesystem as workspace, not chat threads - artifacts persist across sessions and contexts
- Voice recording ("walks") generates 300-400 line transcripts that preserve tangents and uncertainties stripped during typing
- "Do Work" autonomous system runs multi-hour build sessions with git-based traceability - commits document every feature request and regression
- Context decay weakens initial instructions over long threads - clears context at feature-level boundaries, stores memory externally in documents
- PRD verification pass with coverage scoring (22% gaps typical, improved to 95%+ on second pass) forces different posture: coverage vs creativity
- Video workflow uses walk transcripts, question/answer cycles, and multiple script variants stored as discrete files before shooting

## Notable Claims or Positions
- Chat ephemerality is a fundamental constraint - treating conversations as work creates "vibes and half-decisions" instead of reusable artifacts
- Verification prompts work despite AI self-grading because they force a second pass with different evaluation posture
- Off-the-shelf tools are "built for everyone, perfectly for none of us" - custom tooling bar is low enough that workflow irritations should trigger building fixes
- Traceability enables confidence in autonomous execution - without answering "what changed, why, when" you cannot safely delegate work

## Actionable Takeaways
- Implement post-plan verification prompt that scores coverage against original requirements before execution - prevents silent requirement loss
- Shift from chat-based to folder-based AI workflow with explicit content_in/content_out separation and Claude.md guidance files
- Build custom autonomous execution loop with git-based change tracking if running multi-step feature implementations
