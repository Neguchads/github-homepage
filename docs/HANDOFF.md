# Handoff — identity migration

Baseline: `84ac9efc28650fc08c7b0f0c1f939061dbb852e4` on main. Proposed branch: `navi/homepage-identity`.

Scope: remove legacy branding, external support and operational coupling; retain upstream license, credits, core card APIs, existing NAVI integration and renderer layout. The inherited translated READMEs are retired in favor of maintained English and Portuguese documentation; older content remains in Git history.

Acceptance: scan for old identity outside notices, check package/lock alignment, native brand and Jest tests, NAVI pilot, and browser smoke. No tests or deployment are claimed by this handoff. The Core pin is retained at the previously reviewed candidate; upgrading it requires its own review.

Rollback: revert migration commit(s) or close the PR before merge. No force push or automatic production action. Next: check PR CI, inspect browser output, and update profile publishing only after separate review.

## CI follow-up (2026-11-25)

PR #7 initial head: `0da9f71353d1634bd978ee9dec093b758a16587e`. NAVI pilot and CodeQL passed; native Jest: 220/222 passed, 7/7 snapshots passed; brand rendering: 73/75 passed. Both failures were stale width assertions after the synthetic fixture name changed. Corrected two assertions using the logged deterministic output; no renderer logic changed. Scorecard v2.3.1 failed to pull its old GCR image; updated to reviewed v2.6.0 (GHCR), following the upstream default-branch-only workflow schedule. No branch protection changes or bypasses. Recheck all PR jobs before merge, then verify Scorecard on main. npm ci also reported 28 dependency vulnerabilities (1 critical, 13 high, 12 moderate, 2 low); triage production versus dev scope before deployment. Browser smoke remains pending.

## Dependency remediation

Initial inventory: 28 flagged package entries, 3 production (Axios, form-data, follow-redirects) and 25 development-only. Remove unused dependencies of retired upstream automation, regenerate the lockfile via npm without force, and require new audit and test evidence. WakaTime restricts outbound requests to the official host; this deliberately retires caller-selected custom domains. Formatting is applied to source files; generated explorer HTML remains reproducibility-checked. No deployment is authorized.

Candidate run [45605340249](https://github.com/Neguchads/github-homepage/actions/runs/45605340249): npm reports zero vulnerabilities for both complete and production trees; 246/246 Jest tests passed. Lint initially rejected optional JSDoc syntax, corrected before committing. Lockfile reconstructed and checked against the runner's Git blob SHA. The temporary read-only candidate workflow is retired. The permanent audit gate now requires zero reported vulnerabilities; final committed revision must pass CI independently.
