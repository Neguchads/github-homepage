import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const html = readFileSync(
  new URL("../../docs/explore/index.html", import.meta.url),
  "utf8",
);
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function setup() {
  const elements = new Map();
  function element() {
    return {
      textContent: "",
      children: [],
      attrs: {},
      options: [{}, {}, {}],
      listeners: {},
      setAttribute(k, v) {
        this.attrs[k] = v;
      },
      addEventListener(k, v) {
        this.listeners[k] = v;
      },
      replaceChildren() {
        this.children = [];
      },
      append(v) {
        this.children.push(v);
      },
      getContext() {
        return null;
      },
    };
  }
  const buttons = Array.from({ length: 4 }, element);
  const document = {
    documentElement: {},
    hidden: false,
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    querySelectorAll() {
      return buttons;
    },
    createElement: element,
    addEventListener() {},
  };
  const ctx = vm.createContext({
    document,
    matchMedia: () => ({ matches: true, addEventListener() {} }),
  });
  vm.runInContext(script, ctx);
  return { ctx, document, buttons };
}

test("offline page loads with no graphics context and retains project navigation", () => {
  const { ctx, document, buttons } = setup();
  assert.equal(document.documentElement.lang, "en");
  assert.equal(document.getElementById("projects").children.length, 4);
  buttons[3].listeners.click();
  assert.equal(
    document.getElementById("detail-title").textContent,
    "Developer tools",
  );
  assert.equal(document.getElementById("projects").children.length, 5);
  assert.equal(vm.runInContext("moving", ctx), false);
  document.getElementById("language").listeners.click();
  assert.equal(document.documentElement.lang, "pt-BR");
  assert.equal(
    document.getElementById("detail-title").textContent,
    "Ferramentas de desenvolvimento",
  );
});

test("projection is finite and centered, quality and privacy boundaries are explicit", () => {
  const { ctx } = setup();
  const p = vm.runInContext(
    "w=800; h=400; yaw=0; pitch=0; distance=12; project([0,0,0])",
    ctx,
  );
  assert.equal(p[0], 400);
  assert.equal(p[1], 216);
  assert.ok(p[2] > 0);
  assert.equal(vm.runInContext("project([0,0,20])", ctx), null);
  assert.doesNotMatch(
    html,
    /<script[^>]+src=|<link[^>]+stylesheet|fetch\s*\(|XMLHttpRequest|localStorage/,
  );
  const slugs = vm
    .runInContext("sectors.flatMap(s=>s.repos.map(r=>r[0])).join(',')", ctx)
    .split(",");
  assert.deepEqual(
    slugs.sort(),
    [
      "chad-recomp",
      "cdos-nintendods-recomp",
      "ccod-xbox-recomp",
      "csotn-saturn-recomp",
      "ScriptForge",
      "comfyui",
      "starlight-bi",
      "favorite-manager",
      "spec-to-proof",
      "codex-config-universal",
      "github-homepage",
      "navi-graphify",
      "Neguchads",
    ].sort(),
  );
});
