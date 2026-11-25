# Verification

Use Node.js 22. Run from the repository root:

```sh
npm ci --ignore-scripts
npm run test:brand
npm run verify:portfolio
npm test -- --runInBand
npm run lint
npm run format:check
npm run bench
```

The existing pinned Core reusable workflow executes the complementary native Node brand gate on PRs. For local governance with a reviewed Core installation: `navi validate project .navi/project.toml`, `navi verify --root .`, `navi verify --root . --execute`. Review the current Core CLI contract before updating the pin.

Jest covers API and rendering with mocked data; it does not prove deployment security. Browser smoke: open the offline explorer, test keyboard/touch, language, reduced motion and project links. Full Universe requires the reviewed input bundle. No live API or browser acceptance is claimed by this migration.
