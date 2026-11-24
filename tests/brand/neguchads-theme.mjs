import assert from "node:assert/strict";
import { test } from "node:test";
import { themes } from "../../themes/index.js";

const expected = {
  neguchads: {
    title_color: "EAF4FF",
    icon_color: "00B3FF",
    text_color: "C8D7E6",
    bg_color: "0B111B",
    border_color: "34516A",
    ring_color: "63DAFF",
  },
  neguchads_light: {
    title_color: "152B40",
    icon_color: "007EAF",
    text_color: "263B50",
    bg_color: "FFFFFF",
    border_color: "CAD9E5",
    ring_color: "006E9F",
  },
};

function luminance(hex) {
  const rgb = hex.match(/../g).map((part) => {
    const v = parseInt(part, 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

for (const [name, palette] of Object.entries(expected)) {
  test(name + " brand colors and readable text", () => {
    assert.deepEqual(themes[name], palette);
    for (const hex of Object.values(themes[name])) {
      assert.match(hex, /^[0-9A-Fa-f]{6}$/);
    }
    for (const key of ["title_color", "text_color"]) {
      assert.ok(contrast(palette[key], palette.bg_color) >= 4.5);
    }
    assert.ok(contrast(palette.icon_color, palette.bg_color) >= 3);
    assert.ok(contrast(palette.ring_color, palette.bg_color) >= 3);
  });
}

test("existing default theme is unchanged", () => {
  assert.equal(themes.default.title_color, "2f80ed");
  assert.equal(themes.default.bg_color, "fffefe");
  assert.equal(themes.default_repocard.icon_color, "586069");
});
