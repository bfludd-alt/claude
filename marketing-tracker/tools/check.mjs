// Runs the tracker's own data logic (the CORE block in index.html) in Node and
// prints what the page would show: loaded sources, data issues and a KPI summary.
//
//   node tools/check.mjs                       # the files in sample-data/
//   node tools/check.mjs a.csv b.csv ...       # any CSV files
//   node tools/check.mjs --test                # parser, date and KPI self-tests only
//   node tools/check.mjs --live                # fetch every tab in CONFIG from Google Sheets
// Options:
//   --month=2026-10        KPI month summary for that month (default: this month)
//   --today=2026-10-26     pretend today is this date (affects "past day with no actual")
//   --rows                 also print every merged campaign/moment row

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
const core = new Function(`${m[1]}; return { parseCSV, buildDataset, weekStart, dayToISO, parseISODate, parseDMYDate,
  parseNumber, parseSlashDate, resolveConfigSource, applySourceConfig, publishedCsvProblem, kpiStatus, kpiPeriod, kpiPoint, kpiLatestActual, monthBounds, todayDay, fmtDay, fmtDayShort, fmtNum, fmtPct, fmtKpi, ISSUE_TYPES };`)();
const args = process.argv.slice(2);
const flag = name => args.find(a => a.startsWith(`--${name}=`))?.split("=")[1];
const today = flag("today") ? core.parseISODate(flag("today")) : core.todayDay();
const options = { informationalAudiences: CONFIG.informationalAudiences, kpiDefinitions: CONFIG.kpiDefinitions, kpiStatus: CONFIG.kpiStatus, today };

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
  // Engine dates and numbers
  const eq = (name, got, want) => { if (got !== want) { fails++; console.log(`  FAIL ${name}: got ${got}, want ${want}`); } };
  eq("DD-Mmm-YY", core.dayToISO(core.parseDMYDate("14-May-26")), "2026-05-14");
  eq("DD-Mmm-YY end of year", core.dayToISO(core.parseDMYDate("31-Dec-27")), "2027-12-31");
  eq("DD-Mmm-YY invalid", core.parseDMYDate("31-Feb-27"), null);
  eq("number with separators", core.parseNumber('"10,077,762.51"'), 10077762.51);
  eq("blank number", core.parseNumber(""), null);
  eq("bad number", Number.isNaN(core.parseNumber("12a")), true);
  eq("percentage", core.parseNumber('"102.9%"'), 1.029);
  eq("D/M/YYYY", core.dayToISO(core.parseSlashDate("5/11/2026")), "2026-11-05");
  eq("D/M/YYYY invalid", core.parseSlashDate("31/2/2026"), null);
  const r = core.resolveConfigSource({ label: "S Laundry", type: "campaigns", sheetUrl: "https://docs.google.com/spreadsheets/d/ABC_1-x/edit?gid=736725729#gid=736725729" }, "2PACX-xyz");
  eq("resolve url", r.url, "https://docs.google.com/spreadsheets/d/e/2PACX-xyz/pub?gid=736725729&single=true&output=csv");
  eq("resolve editUrl", r.editUrl, "https://docs.google.com/spreadsheets/d/ABC_1-x/edit");
  eq("resolve gid", r.gid, "736725729");
  eq("resolve tab vertical", r.tabVertical, "SLaundry");
  // Status rules
  const def = { direction: "higher_is_better" };
  const st = (actual, mode = "scenarios") => core.kpiStatus({ forecast: 100, bear: 93, bull: 110, actual }, def, mode, 5).status;
  eq("status green at forecast", st(100), "green");
  eq("status amber at bear", st(93), "amber");
  eq("status red below bear", st(92.9), "red");
  eq("status over above bull", st(110.1), "over");
  eq("status green at bull", st(110), "green");
  eq("threshold amber -5%", st(95, "threshold"), "amber");
  eq("threshold red -5.1%", st(94.9, "threshold"), "red");
  eq("threshold over +5.1%", st(105.1, "threshold"), "over");
  eq("no actual", core.kpiStatus({ forecast: 100, bear: 93, bull: 110, actual: null }, def).status, "no_actual");
  const extra = 3 + 3 + 9 + 4 + 8;
  console.log(fails ? `Self-tests: ${fails} FAILED` : `Self-tests: all ${cases.length + extra} passed`);
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

const fails = parserTests();
if (args.includes("--test")) process.exit(fails ? 1 : 0);

const fileArgs = args.filter(a => !a.startsWith("--"));
const resolved = CONFIG.sources.map(c => core.resolveConfigSource(c, CONFIG.publishedId));
const files = fileArgs.length ? fileArgs : readdirSync(join(root, "sample-data")).filter(f => f.endsWith(".csv")).sort().reverse().map(f => join(root, "sample-data", f));
let sources = files.map(f => core.applySourceConfig({ label: basename(f), text: readFileSync(f, "utf8"), origin: "file" }, resolved));
if (args.includes("--live")) {
  sources = await Promise.all(resolved.filter(c => c.url).map(async c => {
    const base = { label: c.label, origin: "url", url: c.url };
    try {
      const res = await fetch(c.url);
      const text = await res.text();
      const problem = core.publishedCsvProblem(res.status, text);
      if (problem) throw new Error(problem);
      return core.applySourceConfig({ ...base, text }, resolved);
    } catch (e) { return { ...base, text: "", loadError: e.cause?.message || e.message }; }
  }));
}
const data = core.buildDataset(sources, options);

console.log(`\nToday: ${core.fmtDay(today)}`);
console.log("\n== Loaded sources ==");
table(data.sources.map(s => ({ source: s.label, type: s.kind, vertical: s.vertical || "", rows: s.rowCount, blank: s.blankRows, errors: s.errors, warnings: s.warnings,
  note: s.loadError || (s.firstDay != null ? `${core.fmtDay(s.firstDay)} – ${core.fmtDay(s.lastDay)}` : "") })),
  ["source", "type", "vertical", "rows", "blank", "errors", "warnings", "note"]);

if (args.includes("--rows")) {
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
}
console.log(`\nPlan rows: ${data.rows.length} (${data.rows.filter(r => r.tier === "Seasonal Moment").length} seasonal moments)`);

const nErr = data.issues.filter(i => i.severity === "error").length;
console.log(`\n== Data issues (${nErr} errors, ${data.issues.length - nErr} warnings) ==`);
if (!data.issues.length) console.log("none");
for (const i of data.issues) {
  console.log(`${i.severity.toUpperCase().padEnd(7)} ${i.source} ${i.sheetRow ? `row ${i.sheetRow}` : "(file)"}${i.id ? ` [${i.id}]` : ""}: ${i.message}`);
}

/* ---------- KPI month summary ---------- */
const kpi = data.kpi;
const monthArg = flag("month");
const [my, mm] = monthArg ? monthArg.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
const [mStart, mEnd] = core.monthBounds(my, mm - 1);
for (const v of kpi.verticals.keys()) {
  const latest = core.kpiLatestActual(kpi, v);
  console.log(`\n== KPIs: ${v}, ${core.fmtDay(mStart).slice(2)} (actuals through ${latest != null ? core.fmtDayShort(latest) + " " + core.fmtDay(latest).slice(-4) : "—"}) ==`);
  const mode = kpi.verticals.get(v).statusMode || CONFIG.kpiStatus.mode;
  table(Object.entries(kpi.defs).map(([key, def]) => {
    const p = core.kpiPeriod(kpi, v, key, mStart, mEnd);
    if (!p) return { kpi: def.label };
    const st = core.kpiStatus({ forecast: p.forecast, bear: p.bear, bull: p.bull, actual: p.actual }, def, mode, CONFIG.kpiStatus.thresholdPct);
    return {
      kpi: def.label, days: `${p.daysWithActual}/${p.days}`,
      "MTD actual": core.fmtKpi(p.actual, def), "MTD forecast": core.fmtKpi(p.forecast, def), attainment: core.fmtPct(p.attainment),
      "vs bear": core.fmtPct(p.vsBear), status: st.status, "projected month end": core.fmtKpi(p.projected, def),
      "month forecast": core.fmtKpi(p.forecastAll, def),
    };
  }), ["kpi", "days", "MTD actual", "MTD forecast", "attainment", "vs bear", "status", "projected month end", "month forecast"]);
  for (const [key, def] of Object.entries(kpi.defs)) {
    const byStatus = { over: [], green: [], amber: [], red: [], no_actual: [] };
    for (let d = mStart; d <= mEnd; d++) {
      const p = core.kpiPoint(kpi, v, key, d);
      const s = core.kpiStatus(p, def, mode, CONFIG.kpiStatus.thresholdPct);
      if (byStatus[s.status]) byStatus[s.status].push({ d, s });
    }
    const list = arr => arr.map(({ d, s }) => `${core.fmtDayShort(d)} ${core.fmtPct(s.deltaPct, true)}`).join(", ") || "none";
    console.log(`${def.label}${def.derived ? " (threshold ±" + CONFIG.kpiStatus.thresholdPct + "%)" : ""}: ${byStatus.green.length} green, ${byStatus.amber.length} amber, ${byStatus.red.length} red, ${byStatus.over.length} above bull, ${byStatus.no_actual.length} no actual yet`);
    console.log(`   red: ${list(byStatus.red)}`);
    if (byStatus.over.length) console.log(`   above bull: ${list(byStatus.over)}`);
  }
}

// Spot-check that multi-line quoted cells survived
const longest = data.rows.reduce((a, r) => (r.brief.length > (a?.brief.length ?? 0) ? r : a), null);
if (longest) console.log(`\nLongest brief (${longest.id}, ${longest.brief.length} chars): ${clip(longest.brief, 120)}`);
process.exit(fails ? 1 : 0);
