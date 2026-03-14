---
type: video_summary
channel: MetalSole
channel_slug: metalsole
generated_date: 2026-03-05
model: claude-sonnet
---

## Key Points
- Claude Code Remote Control launched as research preview for Claude Max plan users (not available on $20 tier yet), enabling session visibility across devices without opening ports or pushing code to cloud
- Setup requires single command `/remote` in terminal or config file flag `enable_remote_control_for_all_sessions: true` to persist across all sessions
- Remote sessions connect through existing Anthropic TLS-encrypted servers; code never leaves local machine, phone acts as window into desktop session already running
- Workflow shift from synchronous pair programming to asynchronous session management: multiple project folders can run concurrent Claude Code sessions that remain accessible remotely
- Session persistence allows work to continue when user walks away, with decision points waiting for input rather than terminating, enabling check-ins from any location

## Notable Claims or Positions
- MetalSole positions this as solving a fundamental problem: "Your sessions don't stop when you walk away. Now you can see them — and steer them — from wherever you are"
- Claims security model is sound: "remote control does not open any new ports on your machine... Your code never leaves your machine. The phone is just a window into the session"
- Describes workflow transformation: "I'm not sitting with the work anymore. I'm coexisting with work that's happening" — framing as paradigm shift from location-bound to presence-optional development
- Acknowledges limitation: "It's absolutely not a replacement for being able to work on it locally if you're really doing a lot of file stuff" or visual testing needs

## Actionable Takeaways
- Enable remote control via `/remote` command in active session or set `enable_remote_control_for_all_sessions: true` in Claude Code config to auto-enable for all future sessions
- Structure workflow around multiple concurrent project folders with separate Claude Code sessions, checking in remotely to redirect, approve, or course-correct as needed
- Keep terminal/laptop open to maintain session availability (closing terminal ends remote access to that session)
