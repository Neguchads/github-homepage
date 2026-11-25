# Handoff — identity migration

Baseline: `84ac9efc28650fc08c7b0f0c1f939061dbb852e4` on main. Proposed branch: `navi/homepage-identity`.

Scope: remove legacy branding, external support and operational coupling; retain upstream license, credits, core card APIs, existing NAVI integration and renderer layout. The inherited translated READMEs are retired in favor of maintained English and Portuguese documentation; older content remains in Git history.

Acceptance: scan for old identity outside notices, check package/lock alignment, native brand and Jest tests, NAVI pilot, and browser smoke. No tests or deployment are claimed by this handoff. The Core pin is retained at the previously reviewed candidate; upgrading it requires its own review.

Rollback: revert migration commit(s) or close the PR before merge. No force push or automatic production action. Next: check PR CI, inspect browser output, and update profile publishing only after separate review.

## CI follow-up (2026-11-25)

PR #7 initial head: `0da9f71353d1634bd978ee9dec093b758a16587e`. NAVI pilot and CodeQL passed; native Jest: 220/222 passed, 7/7 snapshots passed; brand rendering: 73/75 passed. Both failures were stale width assertions after the synthetic fixture name changed. Corrected two assertions using the logged deterministic output; no renderer logic changed. Scorecard v2.3.1 failed to pull its old GCR image; updated to reviewed v2.6.0 (GHCR), following the upstream default-branch-only workflow schedule. No branch protection changes or bypasses. Recheck all PR jobs before merge, then verify Scorecard on main. npm ci also reported 28 dependency vulnerabilities (1 critical, 13 high, 12 moderate, 2 low); triage production versus dev scope before deployment. Browser smoke remains pending.

## Dependency remediation

Initial inventory: 28 flagged package entries, 3 production (Axios, form-data, follow-redirects) and 25 development-only. Remove unused dependencies of retired upstream automation, regenerate the lockfile via npm without force, and require new audit and test evidence. WakaTime restricts outbound requests to the official host; this deliberately retires caller-selected custom domains. Formatting is applied to source files; generated explorer HTML remains reproducibility-checked. No deployment is authorized.

Candidate run [45605340249](https://github.com/Neguchads/navi-githomepage/actions/runs/45605340249): npm reports zero vulnerabilities for both complete and production trees; 246/246 Jest tests passed. Lint initially rejected optional JSDoc syntax, corrected before committing. Lockfile reconstructed and checked against the runner's Git blob SHA. The temporary read-only candidate workflow is retired. The permanent audit gate now requires zero reported vulnerabilities; final committed revision must pass CI independently.

Repository rename: canonical URLs, package name and project manifest now use `navi-githomepage`; the Abyss link uses `navi-abyss`. Historical catalog snapshots and their provenance are retained until the Graphify/profile migration can be reviewed together.

## Rename verification

Commit `f91874667d18a0e201cb0d21c055289ec01f3c15`: npm audit all and production both zero, 246 Jest tests, 7 snapshots, 2 benchmarks, 9 native brand tests, ESLint, Prettier, renderer and CodeQL all passed. The next revision removes the remaining legacy Setup Node action, adds an offline real-browser gate and validates canonical navigation URLs in the concurrently synchronized 15-project catalog. Other ecosystem PRs remain separate. Main Scorecard and deployment validation remain pending.

## Base synchronization

All six active CI workflows passed at `c7912df` (dependency audit, native tests, NEF, theme, browser smoke and CodeQL). Main advanced in PR #8 to `2d76de8`; its canonical URLs and manifest are already included. The catalog's newer reviewed Graphify candidate was checked for exact JSON equivalence; it supersedes the historical normalization mapping. Retain the new standalone download link, refreshed 15-project catalog and cosmic integration. Merge main into the PR branch without a force push. Review final CI and upstream release pins before production publication.

Security follow-up: CodeQL check reported two high severity DOM text reinterpretation alerts (19 and 20) despite a successful workflow job. Harden literal text rendering, restrict generated links and validate image slugs; browser smoke exercises a hostile label in the actual Universe. Do not merge until the new CodeQL check itself is green.
