import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { themes } from "../../themes/index.js";

const root = new URL("../../", import.meta.url);
const read = (name) => readFileSync(new URL(name, root), "utf8");

test("package identity, lockfile, support and deployment point to NAVI", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(pkg.name, "navi-github-homepage");
  assert.equal(pkg.name, lock.name);
  assert.equal(pkg.name, lock.packages[""].name);
  assert.equal(pkg.homepage, "https://github.com/Neguchads/github-homepage");
  assert.equal(pkg.bugs.url, pkg.homepage + "/issues");
  assert.equal(pkg.repository.url, pkg.homepage + ".git");
  assert.ok(pkg.private);
  assert.equal(pkg.license, "MIT");
  assert.equal(
    JSON.parse(read("vercel.json")).redirects[0].destination,
    pkg.homepage,
  );
  assert.match(read("LICENSE"), /Copyright \(c\) 2020/);
});

test("theme catalog matches actual registrations", () => {
  const ids = [...read("themes/README.md").matchAll(/^- `([^`]+)`$/gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(ids, Object.keys(themes));
});

test("retired identity appears only in credits and license notices", () => {
  const legacy = new RegExp(
    [
      "ishan" + "dutta2007",
      "beautiful-github-" + "homepage",
      "hazru." + "anurag",
      "anurag" + "hazra",
    ].join("|"),
    "i",
  );
  const files = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const hits = [];
  for (const file of files) {
    if (
      ["LICENSE", "CREDITS.md"].includes(file) ||
      !/\.(?:md|js|mjs|ts|json|html|svg|yml|yaml|toml|sh|py|snap)$/i.test(file)
    )
      continue;
    let text = read(file);
    if (file === "README.md") text = text.split("## Credits and license")[0];
    if (legacy.test(text)) hits.push(file);
  }
  assert.deepEqual(hits, [], "Legacy operational or display identity remains");
});
