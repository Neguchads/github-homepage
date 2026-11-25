# Contributing to NAVI GitHub Homepage

Open an [issue](https://github.com/Neguchads/navi-githomepage/issues) for bugs and proposals. Use a scoped branch and describe the goal, acceptance criteria, changed boundaries, tests and rollback in the PR.

## Development

Use Node.js 22 and `npm ci --ignore-scripts`. Run `npm run test:brand`, `npm run verify:portfolio`, `npm test -- --runInBand`, and `npm run lint`. See [Testing](docs/TESTING.md). Do not commit tokens, private data, or unreviewed generated artifacts.

## Themes contribution

Keep public theme IDs stable. Add accessible light/dark palettes in `themes/index.js`, provide deterministic examples, and run contrast and card renderer tests. Regenerate the catalog with `npm run theme-readme-gen`.

## NAVI governance

Read [AGENTS.md](AGENTS.md) and the [NEF reference](https://github.com/Neguchads/navi-core/blob/main/docs/NEF.md). Human and agent contributions use the same acceptance evidence. Do not bypass verification or publish automatically. Update roadmap and handoff as needed.

[Code of conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md) · [License](LICENSE) · [Credits](CREDITS.md).
