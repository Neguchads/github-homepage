import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
test("public universe bundle and SVG", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "navi-test-"));
  try {
    const a = path.join(root, "abyss"),
      p = path.join(root, "profile"),
      o = path.join(root, "out"),
      s = path.join(root, "snapshot.json");
    fs.mkdirSync(path.join(a, "integration"), { recursive: true });
    fs.mkdirSync(path.join(p, "assets/projects"), { recursive: true });
    fs.writeFileSync(
      path.join(a, "integration/universe.css"),
      "body{color:white}",
    );
    fs.writeFileSync(
      path.join(a, "index.html"),
      '<a href="reference.html">Cosmic</a>',
    );
    fs.writeFileSync(
      path.join(a, "reference.html"),
      '<a href="index.html">Legacy</a><a href="LICENSE">MIT</a><a href="docs/CAPTURES.md">Evidence</a>',
    );
    fs.writeFileSync(path.join(a, "LICENSE"), "MIT");
    fs.writeFileSync(path.join(p, "assets/banner.svg"), "<svg/>");
    const totals = {
      public_repositories: 1,
      active_originals: 1,
      stars: 2,
      forks: 3,
      open_items: 0,
      followers: 4,
    };
    const sectors = Array.from({ length: 4 }, (_, i) => ({
      id: "s" + i,
      en: "Sector " + i,
      pt: "Setor " + i,
      color: "#63daff",
      pos: [i, 0, i],
      projects:
        i === 0
          ? [
              {
                slug: "test",
                title: "<script>test</script>",
                language: "C",
                stars: 2,
                forks: 3,
                open_items: 0,
              },
            ]
          : [],
    }));
    fs.writeFileSync(
      s,
      JSON.stringify({
        schema_version: 1,
        scope: "public-only",
        owner: "Neguchads",
        date: "2026-11-24",
        sectors,
        totals,
        featured: [],
        languages: { C: 1 },
        history: [],
        structural: {},
        sources: {},
        integrations: [],
        core_status: {
          scope: "public-core-ci",
          repository: "Neguchads/navi-core",
          commit: "a".repeat(40),
          run_id: 123,
          state: "success",
        },
      }),
    );
    execFileSync(process.execPath, ["--check", "docs/universe/universe.js"]);
    execFileSync(process.execPath, ["scripts/build-universe.mjs", s, a, p, o]);
    const html = fs.readFileSync(path.join(o, "index.html"), "utf8"),
      svg = fs.readFileSync(path.join(o, "universe.en.svg"), "utf8");
    assert.ok(html.includes('<html lang="en">'));
    assert.ok(html.includes('id="lang-pt"'));
    assert.ok(
      html.includes('data-pt="Inteligência de engenharia interconectada"'),
    );
    assert.ok(html.includes("navi-universe-language"));
    assert.ok(html.includes("\\u003cscript>"));
    assert.ok(!html.includes("<script>test</script>"));
    assert.ok(svg.includes("&lt;script&gt;"));
    assert.ok(fs.existsSync(path.join(o, "snapshot.json")));
    assert.ok(html.includes('href="cosmic.html"'));
    assert.ok(
      fs
        .readFileSync(path.join(o, "abyss.html"), "utf8")
        .includes('href="cosmic.html"'),
    );
    const cosmic = fs.readFileSync(path.join(o, "cosmic.html"), "utf8");
    assert.ok(cosmic.includes('href="abyss.html"'));
    assert.ok(cosmic.includes('href="ABYSS-LICENSE.txt"'));
    assert.ok(
      cosmic.includes(
        "https://github.com/Neguchads/navi-abyss/blob/main/docs/CAPTURES.md",
      ),
    );
    assert.ok(html.includes('id="core-status"'));
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(o, "snapshot.json"), "utf8"))
        .core_status.run_id,
      123,
    );
    const invalid = JSON.parse(fs.readFileSync(s, "utf8"));
    invalid.core_status.private_log = "forbidden";
    fs.writeFileSync(s, JSON.stringify(invalid));
    assert.throws(() =>
      execFileSync(
        process.execPath,
        ["scripts/build-universe.mjs", s, a, p, o],
        { stdio: "ignore" },
      ),
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

 test("Universe rendering uses literal text nodes and no HTML sinks", () => {
  const source = fs.readFileSync("docs/universe/universe.js", "utf8");
  assert.ok(source.includes("document.createTextNode"));
  assert.doesNotMatch(source, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write)\b/);
  assert.ok(source.includes('encodeURIComponent(slug) + ".svg"'));
});
