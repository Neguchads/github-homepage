# Engineering Universe

A standalone interactive portfolio inspired by the procedural exploration concept of [Abyssal Garden](https://github.com/Noniv/abyssal-garden). The original project uses WebGPU and synthesized audio; this independent implementation uses a lightweight Canvas 2D perspective projection, no external libraries, no audio and no copied renderer code.

## Open

Download [index.html](index.html) (Raw / Download raw file on GitHub) and open it in a modern browser. It runs offline. For a public website, enable GitHub Pages for the main branch /docs folder, then open the /explore/ route of the published site. GitHub's repository file viewer itself does not execute HTML. Existing API endpoints and Vercel configuration are unchanged.

## Experience

- Four sectors: game engineering, AI and automation, applications, developer tools.
- Eleven explicitly selected public repository links, grouped by domain, not a generated private repository inventory.
- Procedural star field, grid, central hub, orbit camera and selectable nodes.
- Pointer/touch dragging, arrow keys or WASD, focused wheel zoom, reset and Low/High/Auto detail.
- English and Brazilian Portuguese UI, reduced-motion preference, paused animation when the tab is hidden, accessible station buttons and project links even when Canvas is unavailable.
- No telemetry, tokens, private data, backend or external assets. Project links navigate to GitHub only when selected.

The scene is a conceptual map, not a quantitative activity visualization. Node sizes and positions do not represent GitHub metrics.

## Verification

Run `node --test tests/brand/engineering-universe.mjs` from the repository root. Tests cover offline initialization, language and station navigation, projection, and the explicit public link list. Browser/GPU visual performance still needs manual testing.

The source and upstream MIT license are preserved. This is an independent adaptation of the exploration concept, with credit to Abyssal Garden.
