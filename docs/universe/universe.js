"use strict";
const d = JSON.parse(document.getElementById("data").textContent),
  $ = (id) => document.getElementById(id),
  el = (tag, text, parent) => {
    const e = document.createElement(tag);
    if (text != null) e.append(document.createTextNode(String(text)));
    if (parent) parent.append(e);
    return e;
  };
const languageKey = "navi-universe-language";
let preference = null;
try {
  preference = localStorage.getItem(languageKey);
} catch {}
const urlLanguage = new URL(location.href).searchParams.get("lang");
const locale = ["en", "pt-BR"].includes(urlLanguage)
  ? urlLanguage
  : preference === "pt-BR"
    ? "pt-BR"
    : "en";
const pt = locale === "pt-BR",
  t = (en, br) => (pt ? br : en);
document.documentElement.lang = locale;
if (pt) {
  for (const e of document.querySelectorAll("[data-pt]"))
    e.replaceChildren(document.createTextNode(e.dataset.pt));
  for (const e of document.querySelectorAll("[data-pt-label]"))
    e.setAttribute("aria-label", e.dataset.ptLabel);
  for (const e of document.querySelectorAll("[data-pt-placeholder]"))
    e.placeholder = e.dataset.ptPlaceholder;
}
for (const [id, lang] of [
  ["lang-en", "en"],
  ["lang-pt", "pt-BR"],
]) {
  const b = $(id);
  b.setAttribute("aria-pressed", String(locale === lang));
  b.style.borderColor = locale === lang ? "#63daff" : "";
  b.onclick = () => {
    try {
      localStorage.setItem(languageKey, lang);
    } catch {}
    const u = new URL(location.href);
    u.searchParams.set("lang", lang);
    location.assign(u.href);
  };
}
const kindLabel = (k) =>
  ({
    Profile: t("Profile", "Perfil"),
    Analytics: t("Analytics", "Análise"),
    Featured: t("Featured", "Destaques"),
    Setor: t("Sector", "Setor"),
    Projeto: t("Project", "Projeto"),
    Tecnologia: t("Technology", "Tecnologia"),
  })[k] || k;
const relationLabel = (k) =>
  ({
    membership: t("Membership", "Pertencimento"),
    integration: t("Integration", "Integração"),
    technology: t("Technology", "Tecnologia"),
  })[k] || k;
const labels = {
  public_repositories: t("Public repositories", "Repositórios públicos"),
  active_originals: t("Active originals", "Originais ativos"),
  stars: "Stars",
  forks: t("Received forks", "Forks recebidos"),
  open_items: t("Open items", "Itens abertos"),
  followers: t("Followers", "Seguidores"),
};
for (const [k, v] of Object.entries(d.totals)) {
  const card = el("div", null, $("totals"));
  card.className = "panel metric";
  el("strong", String(v), card);
  el("span", labels[k], card);
}
$("date").textContent =
  t("Public snapshot • ", "Snapshot público • ") + d.date + " UTC";
const cs = d.core_status,
  statusPanel = $("core-status");
if (
  cs &&
  cs.scope === "public-core-ci" &&
  cs.repository === "Neguchads/navi-core" &&
  /^[a-f0-9]{40}$/.test(cs.commit) &&
  Number.isSafeInteger(cs.run_id) &&
  cs.run_id > 0 &&
  [
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
  ].includes(cs.state)
) {
  const states = {
    success: t("Passed", "Aprovado"),
    failure: t("Failed", "Falhou"),
    cancelled: t("Cancelled", "Cancelado"),
    skipped: t("Skipped", "Ignorado"),
    timed_out: t("Timed out", "Tempo excedido"),
    action_required: t("Action required", "Ação necessária"),
    neutral: t("Neutral", "Neutro"),
    stale: t("Stale", "Desatualizado"),
    in_progress: t("In progress", "Em execução"),
    queued: t("Queued", "Na fila"),
    unknown: t("Unknown", "Desconhecido"),
  };
  el(
    "p",
    t("Latest observed main-branch CI: ", "Última CI observada na main: ") +
      states[cs.state],
    statusPanel,
  );
  const a = el("a", "GitHub Actions · " + cs.commit.slice(0, 10), statusPanel);
  a.href = new URL(
    String(cs.run_id),
    "https://github.com/Neguchads/navi-core/actions/runs/",
  ).href;
} else
  el(
    "p",
    t("Core CI status unavailable.", "Estado da CI do Core indisponível."),
    statusPanel,
  );
el(
  "p",
  t(
    "CI status is not agentic validation or production certification.",
    "Estado da CI não equivale à validação agêntica ou homologação de produção.",
  ),
  statusPanel,
);
const nodes = [],
  edges = [],
  map = new Map(),
  projects = new Map();
function node(id, label, color, pos, kind, repo) {
  const n = { id, label, color, pos, kind, repo };
  nodes.push(n);
  map.set(id, n);
  return n;
}
function edge(a, b, kind) {
  if (map.has(a) && map.has(b)) edges.push({ a, b, kind });
}
node("core", "NAVI / Neguchads", "#eaf4ff", [0, 0, 0], "Profile");
node(
  "analytics",
  t("GitHub Analytics", "Análise do GitHub"),
  "#63daff",
  [0, 3, 0],
  "Analytics",
);
edge("core", "analytics", "membership");
node(
  "featured",
  t("Featured projects", "Projetos em destaque"),
  "#63daff",
  [0, -3, 0],
  "Featured",
);
edge("core", "featured", "membership");
for (const s of d.sectors) {
  node(s.id, pt ? s.pt : s.en, s.color, s.pos, "Setor");
  edge("core", s.id, "membership");
  s.projects.forEach((p, i) => {
    projects.set(p.slug, p);
    const a = (i * Math.PI * 2) / Math.max(1, s.projects.length);
    node(
      p.slug,
      p.title,
      s.color,
      [
        s.pos[0] + 1.65 * Math.cos(a),
        1.4 * Math.sin(a),
        s.pos[2] + 1.6 * Math.sin(a),
      ],
      "Projeto",
      p,
    );
    edge(s.id, p.slug, "membership");
    if (d.featured.includes(p.slug)) edge("featured", p.slug, "membership");
  });
}
const tech = [
  ...new Set([...projects.values()].map((p) => p.language).filter(Boolean)),
];
tech.forEach((t, i) => {
  const a = (i * 2 * Math.PI) / tech.length;
  node(
    "tech:" + t,
    t,
    "#a9c3d9",
    [4 * Math.cos(a), 2.4, 4 * Math.sin(a)],
    "Tecnologia",
  );
  edge("analytics", "tech:" + t, "technology");
});
for (const p of projects.values())
  if (p.language) edge(p.slug, "tech:" + p.language, "technology");
for (const e of d.integrations) edge(e.source, e.target, "integration");
function link(parent, label, url) {
  // Only fixed local fragments and canonical public GitHub repository paths.
  const prefix = "https://github.com/Neguchads";
  const local = /^#(?:analytics|featured)$/.test(url);
  const path = url.startsWith(prefix) ? url.slice(prefix.length) : null;
  const repository = /^\/[A-Za-z0-9_-][A-Za-z0-9_.-]{0,99}$/;
  const commit =
    /^\/[A-Za-z0-9_-][A-Za-z0-9_.-]{0,99}\/commit\/[a-f0-9]{40}$/;
  if (!local && path !== "" && !repository.test(path) && !commit.test(path))
    return null;
  const a = el("a", label, parent);
  a.href = url;
  return a;
}
function selectNode(n) {
  selected = n.id;
  $("detail-title").replaceChildren(document.createTextNode(String(n.label)));
  const box = $("detail");
  box.replaceChildren();
  el("p", kindLabel(n.kind), box);
  if (n.repo) {
    const p = n.repo;
    el(
      "p",
      p.stars +
        " stars · " +
        p.forks +
        " forks · " +
        p.open_items +
        t(" open items", " itens abertos"),
      box,
    );
    el(
      "p",
      (p.language || t("Language not specified", "Linguagem não informada")) +
        " · " +
        (p.fork ? "Fork" : "Original") +
        (p.archived ? t(" · Archived", " · Arquivado") : ""),
      box,
    );
    link(
      box,
      t("Open repository", "Abrir repositório"),
      "https://github.com/Neguchads/" + encodeURIComponent(p.slug),
    );
    const m = d.structural[p.slug];
    el(
      "p",
      m
        ? m.nodes +
            t(" AST nodes · ", " nós AST · ") +
            m.edges +
            t(" edges · commit ", " arestas · commit ") +
            m.commit.slice(0, 8)
        : t(
            "Graphify: structural metric unavailable.",
            "Graphify: métrica estrutural indisponível.",
          ),
      box,
    );
  } else if (n.id === "analytics")
    link(box, t("View analytics", "Ver analytics"), "#analytics");
  else if (n.id === "featured")
    link(box, t("View projects", "Ver projetos"), "#featured");
  else if (n.id === "core")
    link(
      box,
      t("GitHub profile", "Perfil GitHub"),
      "https://github.com/Neguchads",
    );
  const ul = el("ul", null, box);
  for (const e of edges.filter((e) => e.a === n.id || e.b === n.id)) {
    const target = map.get(e.a === n.id ? e.b : e.a);
    const li = el("li", null, ul),
      b = el("button", target.label + " · " + relationLabel(e.kind), li);
    b.addEventListener("click", () => selectNode(target));
  }
}
let selected = "core",
  angle = 0.55,
  tilt = 0.35,
  spinning = !matchMedia("(prefers-reduced-motion: reduce)").matches,
  drag = null,
  moved = false,
  hits = [];
const canvas = $("canvas"),
  ctx = canvas.getContext("2d");
function visible() {
  const q = $("search").value.trim().toLowerCase();
  return new Set(
    nodes
      .filter(
        (n) =>
          !q ||
          [n.label, n.id, n.repo?.language].join(" ").toLowerCase().includes(q),
      )
      .map((n) => n.id),
  );
}
function list() {
  const v = visible();
  $("nodes").replaceChildren();
  for (const n of nodes.filter((n) => v.has(n.id))) {
    const b = el("button", n.label + " · " + kindLabel(n.kind), $("nodes"));
    b.addEventListener("click", () => selectNode(n));
  }
}
$("search").addEventListener("input", list);
$("rotate").onclick = () => {
  spinning = !spinning;
};
$("reset").onclick = () => {
  angle = 0.55;
  tilt = 0.35;
  selectNode(map.get("core"));
};
function frame() {
  if (!ctx) return;
  const w = canvas.clientWidth,
    h = canvas.clientHeight,
    ratio = Math.min(devicePixelRatio || 1, 2);
  if (
    canvas.width !== Math.round(w * ratio) ||
    canvas.height !== Math.round(h * ratio)
  ) {
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (spinning && !drag) angle += 0.0025;
  const project = (n) => {
    const [x, y, z] = n.pos,
      xx = x * Math.cos(angle) - z * Math.sin(angle),
      zz = x * Math.sin(angle) + z * Math.cos(angle),
      yy = y * Math.cos(tilt) - zz * Math.sin(tilt),
      depth = y * Math.sin(tilt) + zz * Math.cos(tilt),
      s = ((13 / (13 + depth)) * Math.min(w, h)) / 13;
    return {
      n,
      x: w / 2 + xx * s,
      y: h / 2 - yy * s,
      z: depth,
      r: ((n.kind === "Projeto" ? 5 : 8) * 13) / (13 + depth),
    };
  };
  const ps = nodes.map(project),
    points = new Map(ps.map((p) => [p.n.id, p])),
    v = visible(),
    f = $("filter").value;
  for (const e of edges) {
    if (f !== "all" && e.kind !== f) continue;
    const a = points.get(e.a),
      b = points.get(e.b);
    ctx.strokeStyle =
      e.a === selected || e.b === selected ? "#63daff" : "#34516a";
    ctx.globalAlpha = v.has(e.a) && v.has(e.b) ? 0.8 : 0.12;
    ctx.setLineDash(
      e.kind === "integration" ? [6, 4] : e.kind === "technology" ? [2, 5] : [],
    );
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  hits = ps.sort((a, b) => b.z - a.z);
  for (const p of hits) {
    const n = p.n;
    ctx.globalAlpha = v.has(n.id) ? 1 : 0.13;
    ctx.fillStyle = n.color;
    ctx.shadowColor = n.color;
    ctx.shadowBlur = n.id === selected ? 20 : 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (n.id === selected || n.kind !== "Projeto" || v.size < nodes.length) {
      ctx.fillStyle = "#eaf4ff";
      ctx.font = "11px system-ui";
      ctx.fillText(n.label, p.x + p.r + 4, p.y + 3);
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}
canvas.addEventListener("pointerdown", (e) => {
  drag = [e.clientX, e.clientY];
  moved = false;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag[0],
    dy = e.clientY - drag[1];
  if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
  angle += dx * 0.008;
  tilt = Math.max(-1.3, Math.min(1.3, tilt + dy * 0.008));
  drag = [e.clientX, e.clientY];
});
canvas.addEventListener("pointerup", (e) => {
  if (!moved) {
    const r = canvas.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top;
    const hit = [...hits]
      .reverse()
      .find((p) => Math.hypot(p.x - x, p.y - y) < Math.max(12, p.r + 5));
    if (hit) selectNode(hit.n);
  }
  drag = null;
});
canvas.addEventListener("pointercancel", () => (drag = null));
for (const slug of d.featured) {
  if (
    typeof slug !== "string" ||
    !/^[A-Za-z0-9_.-]{1,100}$/.test(slug) ||
    slug === "." ||
    slug === ".."
  )
    continue;
  const p = projects.get(slug);
  if (!p) continue;
  const c = el("div", null, $("projects"));
  c.className = "panel project";
  const image = el("img", null, c);
  image.src = "assets/projects/" + encodeURIComponent(slug) + ".svg";
  image.alt = p.title;
  link(c, p.title, "https://github.com/Neguchads/" + encodeURIComponent(slug));
  el("span", p.stars + " stars · " + p.forks + " forks", c);
  const b = el("button", t("Explore in graph", "Explorar no grafo"), c);
  b.onclick = () => {
    selectNode(map.get(slug));
    location.hash = "graph";
  };
}
const max = Math.max(1, ...Object.values(d.languages));
for (const [k, v] of Object.entries(d.languages)) {
  el("p", k + " · " + v, $("languages"));
  const bar = el("div", null, $("languages"));
  bar.className = "bar";
  el("i", null, bar).style.width = (100 * v) / max + "%";
}
const trend = el("div", null, null);
trend.className = "panel";
$("history").closest(".scroll").before(trend);
el(
  "p",
  t(
    "Received stars over time (active original projects)",
    "Evolução de stars recebidas (projetos originais ativos)",
  ),
  trend,
);
if (d.history.length < 2)
  el(
    "p",
    t(
      "The chart will appear after the second daily snapshot.",
      "O gráfico será formado a partir do segundo snapshot diário.",
    ),
    trend,
  );
else {
  const ns = "http://www.w3.org/2000/svg",
    svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 600 150");
  svg.setAttribute("width", "100%");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", t("Star history", "Histórico de stars"));
  const vs = d.history.map((r) => r.stars),
    lo = Math.min(...vs),
    hi = Math.max(...vs),
    pts = vs.map(
      (v, i) =>
        20 +
        (i * 560) / (vs.length - 1) +
        "," +
        (120 - (100 * (v - lo)) / Math.max(1, hi - lo)),
    );
  const line = document.createElementNS(ns, "polyline");
  line.setAttribute("points", pts.join(" "));
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#63daff");
  line.setAttribute("stroke-width", "3");
  svg.append(line);
  trend.append(svg);
  el(
    "p",
    d.history[0].date +
      " · " +
      lo +
      "–" +
      hi +
      " stars · " +
      d.history.at(-1).date,
    trend,
  );
}
for (const row of [...d.history].reverse()) {
  const tr = el("tr", null, $("history"));
  for (const k of ["date", "active_originals", "stars", "forks", "open_items"])
    el("td", String(row[k]), tr);
}
if (!Object.keys(d.structural).length)
  el(
    "p",
    t(
      "No validated AST extraction in this snapshot.",
      "Nenhuma extração AST homologada neste snapshot.",
    ),
    $("structural"),
  );
for (const [slug, m] of Object.entries(d.structural))
  el(
    "p",
    slug +
      " · " +
      m.nodes +
      t(" nodes / ", " nós / ") +
      m.edges +
      t(" edges / ", " arestas / ") +
      m.communities +
      t(" communities · ", " comunidades · ") +
      m.commit.slice(0, 8),
    $("structural"),
  );
for (const [r, sha] of Object.entries(d.sources)) {
  const p = el("p", null, $("sources"));
  link(
    p,
    r + " @ " + sha.slice(0, 10),
    "https://github.com/Neguchads/" + r + "/commit/" + sha,
  );
}
list();
selectNode(map.get("core"));
frame();
