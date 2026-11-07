---
name: pr-images
description: Visual PRs must carry images; changes to existing UI need before and after
metadata:
  type: feedback
---

Any PR with visual changes carries images in its body. A change to something that already exists carries a before and an after (new things: after only; one per breakpoint or theme that matters).

**Why:** the owner judges visual work from the picture, not the diff (stated 2026-11-07 on PR #30, which had none).

**How to apply:** before asking for approval, check the PR body for images. Put the rule in every `/senior` brief for a visual unit, and capture the before from `main` before the branch changes the page. Review and QA screenshots in `.team-verdicts/screenshots/` are the usual source of afters.
