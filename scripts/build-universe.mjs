import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [snapshot, abyss, profile, out] = process.argv.slice(2);
if (!out)
  throw Error(
    "Usage: node scripts/build-universe.mjs SNAPSHOT ABYSS_ROOT PROFILE_ROOT OUTPUT",
  );
const read = (p) => fs.readFileSync(p, "utf8"),
  d = JSON.parse(read(snapshot));
if (
  d.schema_version !== 1 ||
  d.scope !== "public-only" ||
  d.owner !== "Neguchads" ||
  !Array.isArray(d.sectors) ||
  d.sectors.length !== 4 ||
  !/^\d{4}-\d{2}-\d{2}$/.test(d.date)
)
  throw Error("Invalid snapshot");
const slugOK = (s) =>
  typeof s === "string" && /^[A-Za-z0-9_-][A-Za-z0-9_.-]{0,99}$/.test(s);
const countOK = (v) => Number.isSafeInteger(v) && v >= 0;
const sectorIDs = new Set();
const names = new Set();
for (const s of d.sectors) {
  if (
    !s ||
    !slugOK(s.id) ||
    sectorIDs.has(s.id) ||
    typeof s.en !== "string" ||
    typeof s.pt !== "string" ||
    !/^#[a-fA-F0-9]{6}$/.test(s.color) ||
    !Array.isArray(s.pos) ||
    s.pos.length !== 3 ||
    !s.pos.every(Number.isFinite) ||
    !Array.isArray(s.projects)
  )
    throw Error("Invalid public sector");
  sectorIDs.add(s.id);
  for (const p of s.projects) {
    if (
      !p ||
      !slugOK(p.slug) ||
      names.has(p.slug) ||
      typeof p.title !== "string" ||
      ![p.stars, p.forks, p.open_items].every(countOK)
    )
      throw Error("Invalid public project");
    names.add(p.slug);
  }
}
if (
  !Array.isArray(d.featured) ||
  d.featured.some((s) => !names.has(s)) ||
  new Set(d.featured).size !== d.featured.length ||
  !d.totals ||
  ![
    d.totals.public_repositories,
    d.totals.active_originals,
    d.totals.stars,
    d.totals.forks,
    d.totals.open_items,
    d.totals.followers,
  ].every(countOK) ||
  !Object.values(d.totals).every(countOK)
)
  throw Error("Invalid public data");
if (d.core_status !== undefined && d.core_status !== null) {
  const c = d.core_status;
  if (
    !c ||
    typeof c !== "object" ||
    Object.keys(c).sort().join(",") !==
      "commit,repository,run_id,scope,state" ||
    c.scope !== "public-core-ci" ||
    c.repository !== "Neguchads/navi-core" ||
    !/^[a-f0-9]{40}$/.test(c.commit) ||
    !Number.isSafeInteger(c.run_id) ||
    c.run_id <= 0 ||
    ![
      "success",
      "failure",
      "cancelled",
      "skipped",
      "timed_out",
      "action_required",
      "neutral",
      "stale",
      "in_progress",
      "queued",
      "unknown",
    ].includes(c.state)
  )
    throw Error("Invalid public Core status");
}
fs.mkdirSync(path.join(out, "assets/projects"), { recursive: true });
fs.copyFileSync(
  path.join(profile, "assets/banner.svg"),
  path.join(out, "assets/banner.svg"),
);
for (const slug of d.featured)
  fs.copyFileSync(
    path.join(profile, "assets/projects", slug + ".svg"),
    path.join(out, "assets/projects", slug + ".svg"),
  );
fs.writeFileSync(
  path.join(out, "abyss.html"),
  read(path.join(abyss, "index.html")).replace(
    'href="reference.html"',
    'href="cosmic.html"',
  ),
);
const cosmic = read(path.join(abyss, "reference.html"))
  .replace('href="index.html"', 'href="abyss.html"')
  .replace(
    'href="docs/CAPTURES.md"',
    'href="https://github.com/Neguchads/navi-abyss/blob/main/docs/CAPTURES.md"',
  )
  .replace('href="LICENSE"', 'href="ABYSS-LICENSE.txt"');
fs.writeFileSync(path.join(out, "cosmic.html"), cosmic);
fs.copyFileSync(
  path.join(abyss, "LICENSE"),
  path.join(out, "ABYSS-LICENSE.txt"),
);
const safe = JSON.stringify(d).replace(/</g, "\\u003c");
const template = read(path.join(root, "docs/universe/template.html"));
const html = template
  .replace("/*THEME*/", () =>
    read(path.join(abyss, "integration/universe.css")),
  )
  .replace("/*DATA*/", () => safe)
  .replace("/*SCRIPT*/", () =>
    read(path.join(root, "docs/universe/universe.js")),
  );
fs.writeFileSync(path.join(out, "index.html"), html);
fs.writeFileSync(
  path.join(out, "snapshot.json"),
  JSON.stringify(d, null, 2) + "\n",
);
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
for (const pt of [false, true]) {
  const labels = pt
    ? ["Públicos", "Originais", "Stars", "Forks", "Seguidores"]
    : ["Public repos", "Originals", "Stars", "Forks", "Followers"];
  const vals = [
    d.totals.public_repositories,
    d.totals.active_originals,
    d.totals.stars,
    d.totals.forks,
    d.totals.followers,
  ];
  const positions = [
    [32, 85],
    [608, 85],
    [32, 240],
    [608, 240],
  ];
  let svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="492" viewBox="0 0 960 492" role="img"><title>NAVI Engineering Universe</title><desc>Curated project graph and public metrics, not extracted dependencies.</desc><rect x="1" y="1" width="958" height="490" rx="16" fill="#0b111b" stroke="#34516a"/><g font-family="Arial,sans-serif"><text x="25" y="35" fill="#63daff" font-size="15" letter-spacing="2">NEGUCHADS / NAVI ENGINEERING UNIVERSE</text><text x="25" y="57" fill="#a9c3d9" font-size="12">' +
    (pt
      ? "Mapa de conhecimento · Projetos · Tecnologias · Analytics"
      : "Knowledge map · Projects · Technologies · Analytics") +
    "</text>";
  for (let i = 0; i < 4; i++) {
    const [x, y] = positions[i],
      s = d.sectors[i],
      sx = i % 2 ? x : x + 320,
      sy = y + 65;
    svg +=
      '<path d="M480 220L' +
      sx +
      " " +
      sy +
      '" stroke="' +
      esc(s.color) +
      '" stroke-width="1.5" stroke-dasharray="4 5"/><rect x="' +
      x +
      '" y="' +
      y +
      '" width="320" height="145" rx="10" fill="#122235" stroke="#34516a"/><circle cx="' +
      (x + 17) +
      '" cy="' +
      (y + 19) +
      '" r="5" fill="' +
      esc(s.color) +
      '"/><text x="' +
      (x + 29) +
      '" y="' +
      (y + 24) +
      '" fill="#eaf4ff" font-size="14" font-weight="bold">' +
      esc(pt ? s.pt : s.en) +
      "</text>";
    for (let j = 0; j < Math.min(6, s.projects.length); j++) {
      const p = s.projects[j],
        py = y + 42 + j * 17;
      svg +=
        '<path d="M' +
        (x + 17) +
        " " +
        (y + 25) +
        "V" +
        py +
        "H" +
        (x + 28) +
        '" fill="none" stroke="' +
        esc(s.color) +
        '" opacity=".5"/><circle cx="' +
        (x + 28) +
        '" cy="' +
        py +
        '" r="3" fill="' +
        esc(s.color) +
        '"/><text x="' +
        (x + 38) +
        '" y="' +
        (py + 4) +
        '" fill="#d5e5f5" font-size="12">' +
        esc(p.title) +
        "</text>";
    }
  }
  svg +=
    '<circle cx="480" cy="220" r="75" fill="none" stroke="#34516a" stroke-dasharray="3 5"/><circle cx="480" cy="220" r="58" fill="#122235" stroke="#63daff" stroke-width="1.5"/><text x="480" y="212" text-anchor="middle" fill="#eaf4ff" font-size="27" font-weight="bold">NAVI</text><text x="480" y="233" text-anchor="middle" fill="#63daff" font-size="11">3D EXPLORER</text><text x="480" y="248" text-anchor="middle" fill="#a9c3d9" font-size="10">' +
    names.size +
    " " +
    (pt ? "projetos" : "projects") +
    "</text>";
  for (let i = 0; i < vals.length; i++) {
    const x = 105 + i * 187;
    svg +=
      '<text x="' +
      x +
      '" y="424" text-anchor="middle" font-size="23" fill="#63daff">' +
      vals[i] +
      '</text><text x="' +
      x +
      '" y="444" text-anchor="middle" font-size="12" fill="#a9c3d9">' +
      labels[i] +
      "</text>";
  }
  svg +=
    '<text x="25" y="475" font-size="11" fill="#a9c3d9">' +
    esc(d.date) +
    " UTC · " +
    (pt
      ? "Relações editoriais · métricas públicas · abra o dashboard para explorar"
      : "Curated relationships · public metrics · open the dashboard to explore") +
    "</text></g></svg>\n";
  fs.writeFileSync(
    path.join(out, pt ? "universe.pt-BR.svg" : "universe.en.svg"),
    svg,
  );
}
