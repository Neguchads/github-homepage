# OpenSSF Scorecard baseline

The post-merge Scorecard on GitHomepage commit `db7b987a8aa505e6e439bf8fbead2f4340488e97` completed successfully and uploaded SARIF: https://github.com/Neguchads/navi-githomepage/actions/runs/45614545885.

Baseline: 5.7/10. Vulnerabilities, CI tests, pinned dependencies, dangerous workflows, license, security policy, dependency update tool and binary artifacts scored 10/10. Token permissions scored 0 due to workflow-level write privileges in CodeQL and cache cleanup. This PR scopes those privileges to the relevant jobs and uses built-in gh cache deletion for the exact closed PR merge ref, without checkout or installing an external extension. The cleanup job's actions:write is still required; Scorecard may penalize it. No branch protection changes are attempted. Independent human review, branch protection, best-practices badge and fuzzing remain separate; new-repository age cannot be corrected by code. Review the next main-branch Scorecard output before claiming improvement. A successful scan is not a safety certification.

## Verified follow-up

Commit `3fad3a3edb6a24ca11970e16611a39490b838b93` scored 6.5/10, token permissions 10/10, vulnerabilities 10/10 (zero known), CI tests and pinned dependencies 10/10. See https://github.com/Neguchads/navi-githomepage/actions/runs/45615408392. Post-merge CodeQL passed. Branch protection and independent reviews remain owner governance tasks.
