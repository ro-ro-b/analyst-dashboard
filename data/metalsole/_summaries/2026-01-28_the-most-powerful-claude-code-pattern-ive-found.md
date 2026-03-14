---
type: video_summary
channel: MetalSole
channel_slug: metalsole
generated_date: 2026-03-09
model: claude-sonnet
---

## Key Points
- Two-panel development workflow: capture side (ideas/requests via slash command) + builder side (sub-agent execution loop working through queued files)
- Request files stored in dedicated folder structure (do-work/requests), moved through states as work progresses, archived on completion with screenshots
- Sub-agent pattern eliminates context pollution by spawning fresh context per task via Claude Code's sub-agent API
- Orchestrator pattern: top agent manages run loop, delegates to specialized sub-agents (planner, evaluator, executor, builder) rather than nested agent creation
- Atomic task execution with intelligent grouping: capture agent analyzes multi-item requests, creates single task if related (e.g., multiple color changes), splits if independent
- 1.5 hour continuous execution across 25+ changes demonstrated, no manual code written
- Available via npx install: `npx add-skill` from do-work GitHub repo, installs globally with symlink

## Notable Claims or Positions
- Context pollution is primary failure mode for long-running Claude sessions; flat orchestrator pattern with fresh sub-agent contexts per task solves token disappearance and planning drift
- Skills are more valuable for workflow automation than plugin architectures that required years of IDE-specific development effort
- Task-level systems make architectural mistake by splitting logically-cohesive work (e.g., three button color changes become three tasks with potentially different blues)
- Conversation-driven tool building via natural language PRD sessions replaces traditional plugin development workflow

## Actionable Takeaways
- Install do-work skill via npx, use dual-panel Claude Code setup (one for `/do-work` capture, one for continuous builder loop) to separate planning from execution
- Build custom skills for repetitive project workflows by asking Claude "can you build a skill for this pattern we keep doing" rather than writing automation code
- When token usage spikes unexpectedly, check for nested sub-agent loops; flatten to orchestrator pattern where top agent delegates to parallel specialized agents
