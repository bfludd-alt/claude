// Runs the tracker's own data logic (the CORE block in index.html) in Node and
// prints what the page would show: loaded sources, merged rows, data issues.
//
//   node tools/check.mjs                       # the files in sample-data/
//   node tools/check.mjs a.csv b.csv ...       # any CSV files
//   node tools/check.mjs --test                # CSV parser self-tests only

import { readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const m = /\/\* CORE:BEGIN[\s\S]*?\*\/([\s\S]*?)\/\* CORE:END \*\//.exec(html);
if (!m) throw new Error("CORE block not found in index.html");
const cfg = /<script>\s*(\/\*[\s\S]*?CONFIG[\s\S]*?)<\/script>/.exec(html);
if (!cfg) throw new Error("CONFIG block not found in index.html");
const CONFIG = new Function(`${cfg[1]}; return CONFIG;`)();
const core = new Function(`${m[1]}; return { parseCSV, buildDataset, weekStart, dayToISO, parseISODate };`)();
const options = { informationalAudiences: CONFIG.informationalAudiences };

/* ---------- Parser self-tests ---------- */
function parserTests() {
  const cases = [
    ["plain", "a,b,c\n1,2,3\n", [["a", "b", "c"], ["1", "2", "3"]]],
    ["comma in quotes", 'a,b\n"x, y",z\n', [["a", "b"], ["x, y", "z"]]],
    ["line break in quotes", 'a,b\n"line 1\nline 2",z\n', [["a", "b"], ["line 1\nline 2", "z"]]],
    ["escaped quotes", 'a\n"She said ""hi"""\n', [["a"], ['She said "hi"']]],
    ["empty quoted", 'a,b,c\n"",x,""\n', [["a", "b", "c"], ["", "x", ""]]],
    ["CRLF + BOM", "﻿a,b\r\n1,2\r\n", [["a", "b"], ["1", "2"]]],
    ["CRLF inside quotes", 'a\r\n"p\r\nq"\r\n', [["a"], ["p\nq"]]],
    ["no trailing newline", "a,b\n1,", [["a", "b"], ["1", ""]]],
    ["trailing empty cells", "a,b,c\n1,,\n", [["a", "b", "c"], ["1", "", ""]]],
  ];
  let fails = 0;
  for (const [name, input, want] of cases) {
    const got = core.parseCSV(input).records;
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (!ok) { fails++; console.log(`  FAIL ${name}\n    want ${JSON.stringify(want)}\n    got  ${JSON.stringify(got)}`); }
  }
  const unterminated = core.parseCSV('a\n"oops\n').unterminated;
  if (!unterminated) { fails++; console.log("  FAIL unterminated quote not detected"); }
  // Weeks start on Sunday: 2026-11-04 (Wed) -> 2026-11-01 (Sun)
  if (core.dayToISO(core.weekStart(core.parseISODate("2026-11-04"))) !== "2026-11-01") { fails++; console.log("  FAIL weekStart"); }
  if (core.dayToISO(core.weekStart(core.parseISODate("2026-11-01"))) !== "2026-11-01") { fails++; console.log("  FAIL weekStart on Sunday"); }
  if (core.parseISODate("2026-02-30") !== null) { fails++; console.log("  FAIL invalid date accepted"); }
  console.log(fails ? `Parser/date tests: ${fails} FAILED` : `Parser/date tests: all ${cases.length + 4} passed`);
  return fails;
}

/* ---------- Table printing ---------- */
function table(rows, cols) {
  const w = cols.map(c => Math.max(c.length, ...rows.map(r => String(r[c] ?? "").length)));
  const line = r => cols.map((c, i) => String(r[c] ?? "").padEnd(w[i])).join("  ");
  console.log(line(Object.fromEntries(cols.map(c => [c, c]))));
  console.log(w.map(n => "-".repeat(n)).join("  "));
  rows.forEach(r => console.log(line(r)));
}
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

const args = process.argv.slice(2);
const fails = parserTests();
if (args.includes("--test")) process.exit(fails ? 1 : 0);

const files = args.length ? args : readdirSync(join(root, "sample-data")).filter(f => f.endsWith(".csv")).sort().reverse().map(f => join(root, "sample-data", f));
const sources = files.map(f => ({ label: basename(f), text: readFileSync(f, "utf8"), origin: "file" }));
const data = core.buildDataset(sources, options);

console.log("\n== Loaded sources ==");
table(data.sources.map(s => ({ source: s.label, type: s.kind, rows: s.rowCount, blank: s.blankRows, errors: s.errors, warnings: s.warnings, note: s.loadError || "" })),
  ["source", "type", "rows", "blank", "errors", "warnings", "note"]);

console.log(`\n== Merged data (${data.rows.length} rows) ==`);
table(data.rows.map(r => {
  const p = r._parent ? data.byKey.get(r._parent) : null;
  return {
    source: `${r._source}:${r._sheetRow}`, id: r.id, name: clip(r.name, 34), tier: r.tier, vertical: r.vertical,
    type: r.campaign_type, start: r.start_date, end: r.end_date, status: r.status,
    parent: p ? `${p.id} (${clip(p.name, 20)})` : r.parent_id ? `${r.parent_id} (NOT FOUND)` : "",
    children: r._children.length || "", issues: r._issues.length || "",
  };
}), ["source", "id", "name", "tier", "vertical", "type", "start", "end", "status", "parent", "children", "issues"]);

const nErr = data.issues.filter(i => i.severity === "error").length;
console.log(`\n== Data issues (${nErr} errors, ${data.issues.length - nErr} warnings) ==`);
if (!data.issues.length) console.log("none");
for (const i of data.issues) {
  console.log(`${i.severity.toUpperCase().padEnd(7)} ${i.source} ${i.sheetRow ? `row ${i.sheetRow}` : "(file)"}${i.id ? ` [${i.id}]` : ""}: ${i.message}`);
}

// Spot-check that multi-line quoted cells survived
const longest = data.rows.reduce((a, r) => (r.brief.length > (a?.brief.length ?? 0) ? r : a), null);
if (longest) console.log(`\nLongest brief (${longest.id}, ${longest.brief.length} chars): ${clip(longest.brief, 120)}`);
process.exit(fails ? 1 : 0);
