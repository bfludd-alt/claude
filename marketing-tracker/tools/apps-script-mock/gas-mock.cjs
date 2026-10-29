// Local stand-in for the Apps Script runtime, for testing the "appsScript" mode.
// Runs the real apps-script/Code.gs against a fake bound spreadsheet whose tabs
// are 2D arrays of display values (here: the sample CSVs, which are display values).
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function parseCSV(text) {   // same rules as the tracker's parser
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  text = text.replace(/\r\n?/g, "\n");
  const records = []; let rec = [], field = "", q = false, started = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"' && !started) { q = true; started = true; }
    else if (c === ",") { rec.push(field); field = ""; started = false; }
    else if (c === "\n") { rec.push(field); records.push(rec); rec = []; field = ""; started = false; }
    else { field += c; started = true; }
  }
  if (started || rec.length) { rec.push(field); records.push(rec); }
  // getDataRange() is rectangular: pad every row to the widest
  const w = Math.max(...records.map(r => r.length));
  return records.map(r => r.concat(Array(w - r.length).fill("")));
}

// tabs: [{ name, gid, csvPath }]
function makeRuntime(tabs, { indexContent = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8"), url = "https://docs.google.com/spreadsheets/d/1OaZGZvHlUkY_aj_yv5Isew1L2acdSrsE15JZylrYmJI/edit", name = "Marketing Tracker" } = {}) {
  const data = tabs.map(t => ({ ...t, values: parseCSV(fs.readFileSync(t.csvPath, "utf8")) }));
  const sheet = t => ({ getName: () => t.name, getSheetId: () => t.gid, getDataRange: () => ({ getDisplayValues: () => t.values.map(r => r.slice()) }),
    getLastRow: () => t.values.reduce((last, r, i) => (r.some(c => c !== "") ? i + 1 : last), 0) });
  const ss = {
    getSheetByName: n => { const t = data.find(x => x.name === n); return t ? sheet(t) : null; },
    getSheets: () => data.map(sheet), getUrl: () => url, getName: () => name,
  };
  const html = { title: null };
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    HtmlService: { createHtmlOutputFromFile: file => { html.file = file; const out = { setTitle: t => { html.title = t; return out; }, addMetaTag: (k, v) => { html[k] = v; return out; }, getContent: () => indexContent }; return out; } },
    ContentService: { MimeType: { TEXT: "text/plain" }, createTextOutput: text => ({ text, setMimeType() { return this; } }) },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../../apps-script/Code.gs"), "utf8"), ctx);
  // Round-trip through JSON like google.script.run does
  const call = (fn, args) => JSON.parse(JSON.stringify(ctx[fn](...args)));
  return { call, ctx, html };
}

// Browser side: google.script.run that forwards to window.__gas(fn, args)
const clientShim = `
  window.google = { script: { run: (function make(ok, fail) {
    return new Proxy({}, { get(_, prop) {
      if (prop === "withSuccessHandler") return fn => make(fn, fail);
      if (prop === "withFailureHandler") return fn => make(ok, fn);
      return (...args) => { window.__gas(prop, args).then(r => r && r.__error ? fail && fail(new Error(r.__error)) : ok && ok(r)); };
    } });
  })() } };`;

module.exports = { makeRuntime, clientShim };
