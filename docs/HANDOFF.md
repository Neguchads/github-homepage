# Handoff — identity migration

Baseline: `84ac9efc28650fc08c7b0f0c1f939061dbb852e4` on main. Proposed branch: `navi/homepage-identity`.

Scope: remove legacy branding, external support and operational coupling; retain upstream license, credits, core card APIs, existing NAVI integration and renderer layout. The inherited translated READMEs are retired in favor of maintained English and Portuguese documentation; older content remains in Git history.

Acceptance: scan for old identity outside notices, check package/lock alignment, native brand and Jest tests, NAVI pilot, and browser smoke. No tests or deployment are claimed by this handoff. The Core pin is retained at the previously reviewed candidate; upgrading it requires its own review.

Rollback: revert migration commit(s) or close the PR before merge. No force push or automatic production action. Next: check PR CI, inspect browser output, and update profile publishing only after separate review.
