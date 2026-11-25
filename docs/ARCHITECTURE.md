# Architecture

NAVI GitHub Homepage has three independent surfaces.

| Boundary | Paths | Role |
| --- | --- | --- |
| HTTP adapters | `api/` | Query parsing, fetching, SVG responses |
| Card engine | `src/cards/`, `src/common/`, `themes/` | Existing renderers, styling, reusable functions |
| Data adapters | `src/fetchers/` | GitHub and WakaTime data; public hosting requires restricted credentials |
| Offline explorer | `docs/explore/`, `scripts/build-portfolio.mjs` | Reviewed editorial catalog and deterministic static outputs |
| Universe | `docs/universe/`, `scripts/build-universe.mjs` | Reviewed versioned graph snapshot plus optional Abyss bundle |
| Governance | `.navi/`, `.github/`, `AGENTS.md` | Complementary NAVI gate and native CI |

Data flow: Graphify public export → reviewed snapshot → offline renderer → profile publishing repository. The browser is not a graph ingestion engine. GitHub card data is separate from graph metrics. The profile owns publication; this repository owns reusable rendering. No private data, write credentials or automatic deployment cross these boundaries.

NEF uses the existing javascript-tooling profile. Do not relocate framework-native files merely to meet a folder pattern. See [Decisions](DECISIONS.md).
