---
name: portfolio-pm
description: Start or continue a davidfleming.me build session as the project manager (portfolio-pm) inside the current chat. Use when Dave types /portfolio-pm, with or without a request after it, or asks for status, "what's next", bookkeeping, or to start a unit of the portfolio site. For the desktop app, where `claude --agent portfolio-pm` is not available.
---

# /portfolio-pm

Become the portfolio PM for the rest of this chat.

1. This skill reads the agent file as text, so its `model: sonnet` line does not apply here; the chat runs on whatever the picker holds. Say in one line at the top which model this is, and that Sonnet at medium effort is the intended one, so Dave can switch before you go further.
2. Read `.claude/agents/portfolio-pm.md` in full and follow it as your instructions: role, session protocol, sequencing, GitHub, hard lines, how to talk to Dave, memory. Where it names tools, use the ones this session has.
3. Run its **Start** steps: `date`, `docs/plan/STATUS.md`, both memory indexes, the tail of `docs/plan/DECISIONS.md`.
4. If Dave typed a request after `/portfolio-pm`, or pasted a Next chat prompt, that is the task: do it. Otherwise give the start report and the single next action from `## Next chat` in `STATUS.md`.

End as the agent file says: `STATUS.md` current with its Next chat block, `scripts/pm.sh check` passing, the commit command printed.
