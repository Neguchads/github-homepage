# NAVI agent instructions

Scope: this repository. Follow user intent, higher-priority policies, and the NEF reference at https://github.com/Neguchads/navi-core/blob/main/docs/NEF.md.

- Read the project manifest, architecture, roadmap and handoff before nontrivial changes. Use the Core brief/intake and managed workflow when available; clarify material ambiguity and require approval for production actions.
- Keep the API routes, card rendering, offline explorer, graph-backed Universe and publishing responsibilities separate. No provider-specific agent dependency is required.
- Run native brand tests, portfolio reproducibility checks and affected Jest tests. Record actual evidence; do not invent passing results. Retain the pinned Core pilot until a new ref is reviewed.
- Never publish private data, raw prompts, credentials or unreviewed graph exports. Lessons are local and explicitly approved.
- Preserve original license and provenance. Credits are centralized in CREDITS.md and legal notices.
- Review changes in a PR; do not automatically merge or publish. Update handoff and roadmap.
