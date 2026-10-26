# Marketing Tracker

One page that shows all marketing activity by month and by week, across three tiers:
**Seasonal Moments → Brand Campaigns → Tactical Campaigns**. Next to the plan, it shows daily **orders, GMV and AOV** against forecast, so a bad day sits right beside what was running. It doubles as the current-state marketing plan.

- **Source of truth:** one Google spreadsheet, with one tab per source:
  - **Seasonal Moments:** shared, owned centrally.
  - **One tab per vertical:** S Market, Restaurants, Snoomart, Grocery, S Laundry, Services, New Ventures. Each holds that vertical's brand and tactical campaigns.
  - **KPI Forecast:** the forecasting engine's daily forecast and actuals, as-is.
- **Visual layer:** `index.html`. It's a single file with no install, no build step and no server.
- **Read-only:** all editing happens in Google Sheets. The tracker links you to the right row.

```
marketing-tracker/
  index.html                       the tracker (the CONFIG block at the top is the only part you edit)
  tracker_template.xlsx            template for a vertical's sheet
  seasonal_moments_template.xlsx   template for the shared moments sheet
  sample-data/                     example files: moments, S Market, the engine export, a long-format KPI file
  tools/                           for maintainers (see the end of this file)
```

---

## 1. Open the tracker

1. Double-click `index.html`. It opens in your browser (Chrome, Edge, Safari or Firefox).
2. It loads every tab straight from Google Sheets. "Loaded sources" lists each tab with its row count and issues.
3. After editing a sheet, click **Reload data** (section 7).

**If Google Sheets can't be reached** (offline, or a network that blocks `docs.google.com`), the page says so and offers a drop zone instead.
- Download the tabs as CSV (**File → Download → Comma-separated values**, one tab at a time) and drop them on the page.
- Google names each download `<spreadsheet> - <tab>.csv`. The tracker matches that tab name to the config, so edit links still work.
- Dropping files works any time: a file replaces the tab it matches, and a new engine export replaces the previous one even if its name differs.
- Dropped files stay on your computer. Nothing is uploaded.

> Offline demo: set `mode: "local"` in CONFIG and drop the files from `sample-data/` onto the page.

---

## 2. Set up a tab (one time)

All tabs live in one spreadsheet. Its whole document is published to the web (section 6).

### A vertical's tab

1. Import `tracker_template.xlsx` into a scratch spreadsheet (**File → Import → Upload → Replace spreadsheet**). Then copy its **Initiatives** tab into the main spreadsheet: right-click the tab → **Copy to** → the main spreadsheet.
2. Rename the copied tab after the vertical (e.g. `Snoomart`).
3. If the dropdowns point at the scratch file's **Lists** tab, copy **Lists** across too and re-point them under **Data → Data validation**.
3. Check that the **Initiatives** tab has dropdowns in `tier`, `vertical`, `campaign_type`, `status`, `priority` and `date_confidence`, and that the **Lists** tab exists.
4. Recommended: **Data → Protect sheets and ranges** to protect the **Lists** tab and the header row.

### The shared Seasonal Moments tab (central team only)

Do the same with `seasonal_moments_template.xlsx`.
- `tier` and `vertical` are pre-filled (Seasonal Moment / Cross-vertical), and their dropdowns allow only that value.
- Google Sheets doesn't keep locked cells from an imported file. To stop edits, protect columns C and E with **Data → Protect sheets and ranges**.
- Rows with nothing but those two pre-filled values are ignored. Loaded sources counts them as "blank rows skipped".

Existing tabs don't need re-importing. Any column a sheet doesn't have is read as blank. Only `id`, `name`, `tier`, `start_date` and `end_date` are required.

---

## 3. Update your sheet

One row = one initiative. Don't rename columns. Their order doesn't matter, because columns are matched by header name.

| Column | What to enter |
|---|---|
| `id` | Unique across **all** sheets, never reused. **Moments:** `SM-001`… **Campaigns:** `[CODE]-BC-001` for brand, `[CODE]-TC-001` for tactical, e.g. `SMK-TC-014` |
| `name` | Short, readable name. This is what appears on the bar |
| `tier` | Brand Campaign / Tactical Campaign. Seasonal Moment is only for the shared sheet |
| `parent_id` | The `id` of the parent, which may live in another sheet. **Brand:** optional, link to a seasonal moment. **Tactical:** a brand campaign or a seasonal moment. **Moments:** leave empty |
| `vertical` | Dropdown. Moments are always `Cross-vertical`. On a vertical's tab, a blank vertical means that tab's vertical; a different vertical is flagged as a warning |
| `relevant_verticals` | **Moments only.** Verticals the moment matters to, separated by semicolons (`Restaurants;Grocery`), or `All`. Blank means All. `Brand` and `City` are accepted as audiences (they don't match a campaign vertical); see `informationalAudiences` in the config |
| `sub_vertical` | Optional free text |
| `campaign_type` | **Campaigns:** Hero, Promo, Tactical, Occasion, Recurrent, USP, Segmented, Engagement, Adoption, Habit Builder (required). **Moments:** MarCom's moment type, any text (e.g. National occasion, International day) |
| `priority` | **Campaigns:** P0–P3. **Moments:** MarCom tier T1–T3. Optional |
| `date_confidence` | Confirmed / Fixed date / Tentative / Tentative (lunar) / School-specific / Planning window. Anything but Confirmed or Fixed date shows as **date tentative** |
| `start_date`, `end_date` | `YYYY-MM-DD`. A one-day activity has the same start and end. `D/M/YYYY` (day first, e.g. `5/11/2026` = 5 Nov) is accepted but flagged as a warning |
| `status` | Idea / Planning / Live / Complete / Paused |
| `owner` | Person or team |
| `channels` | Separated by semicolons: `WhatsApp;Paid Ads;CRM` |
| `objective`, `brief`, `target_audience`, `goal`, `kpis`, `key_message`, `top_highlights` | Free text. Commas and line breaks are fine. Semicolons in `top_highlights` become bullet points |
| `budget_qar` | A number, e.g. `12500`. Optional |
| `notes` | Anything else |

**Vertical codes:**

| Vertical | Code |
|---|---|
| S Market | SMK |
| Restaurants | RST |
| Snoomart | SNM |
| Grocery | GRC |
| SLaundry | SLD |
| Services | SRV |
| New Ventures | NVT |
| Cross-vertical | CVT |

**Good habits**
- **Never delete or renumber a row other sheets link to.** Set it to `Complete` or `Paused` instead. If moment ids are ever renumbered, every vertical's `parent_id`s must be updated too.
- **Check the next free number before adding an id.** Duplicates are errors, even across sheets.
- **Keep dates as `yyyy-mm-dd`.** If a pasted date shows as `11/27/2026`, use **Format → Number → Custom date and time** and set it back to `yyyy-mm-dd`.

---

## 4. Seasonal moments: tiers and filtering

- **The moment tier filter** (**Moments** in the filter bar) shows T1, T2 and moments with no tier by default. Tick T3 to include it.
- **Filtering by vertical** shows only:
  - moments whose `relevant_verticals` include a selected vertical or say `All`
  - plus any moment that a visible campaign links to as its parent or grandparent, even when it's T3 or not marked relevant
- **Show all moments** ignores the vertical filter for moments.
- **Styling:**
  - T1 moments have a stronger band behind the campaigns and stack in the top rows of the moments lane.
  - Moments whose date isn't Confirmed or Fixed date have a **dashed outline**, and the side panel says **Date tentative**.

---

## 5. KPI forecast

### The forecasting engine export (read as-is)

The **KPI Forecast** tab (`type: "kpi_engine"`) is read in the engine's native layout. **Don't reformat it**:

| Position | Header | How it's used |
|---|---|---|
| Row 1 | Title, e.g. `LAYER 1 — Orders & GMV \| 180-Day Tracking` | Names the layer. Otherwise skipped |
| Row 2 | Headers (contain line breaks; `Err%` repeats) | Must start with `Date` (checked). Columns are read **by position** |
| Col 1 | Date | `DD-Mmm-YY`, e.g. `14-May-26`. `D/M/YYYY` is accepted with a warning |
| Col 2 | Day | **Ignored.** The weekday comes from the date |
| Col 3–6 | Ord Bear −7% / Forecast / Bull +10% / Actual | Orders. A blank actual means no actual yet |
| Col 7–9 | Ord Err% ×3 | **Ignored.** Recalculated |
| Col 10–13 | GMV Bear −7% / Forecast / Bull +10% / Actual | GMV in QAR |
| Col 14–16 | GMV Err% ×3 | **Ignored** |

- **Number formats:** values like `"101,623"`, `"10,077,762.51"` and percentages such as `"102.9%"` are fine.
- **Blank rows** below the data (pre-formatted empty rows) are skipped, on every tab.
- **Date range:** any range works. Nothing depends on the "180 days" in the file name.
- **Recognising a dropped file:** by its title row or header, not its name.

**New actuals:** paste the engine's new export into the KPI Forecast tab, then click **Reload data**. A downloaded export dropped on the page also works, and replaces the previous one.

**Layers and verticals**
- **Layer 1** (or a title without a layer) is the company total, stored as vertical `Total`.
- **Other layers:** a future Layer 2 tab in the same layout (e.g. Grocery) gets its own entry, with its vertical:
  ```js
  { label: "KPI Grocery", type: "kpi_engine", sheetUrl: "https://docs.google.com/spreadsheets/d/…/edit?gid=…", vertical: "Grocery" }
  ```
  Without `vertical`, a Layer 2+ tab shows as "Unassigned" with a warning.

### Long format (for teams that send their own forecasts)

```
date,vertical,kpi,forecast,forecast_bear,forecast_bull,actual
2026-10-18,Grocery,orders,15200,,,15480
2026-10-18,Grocery,gmv_qar,1480000,,,1502300
```

- **Type:** use `type: "kpi"` for a long-format tab.
- **Dates:** `YYYY-MM-DD` (or `DD-Mmm-YY`; `D/M/YYYY` with a warning).
- **KPI names:** must match `kpiDefinitions`. AOV is always calculated, so don't send it.
- **Bear and bull** are optional. Without them, status uses the threshold rule (below).
- **Actuals** in a long-format file **override** the engine's actual for the same date, vertical and KPI. That's how you send corrected or more recent actuals.
- **Forecast, bear and bull** only fill days that have no forecast yet.
- An example is in `sample-data/kpi_long_example.csv`.

### KPI definitions

In the CONFIG block (`kpiDefinitions`). Add more KPIs here later:

| KPI | Unit | How it's combined |
|---|---|---|
| `orders` | count | summed |
| `gmv_qar` | QAR | summed |
| `aov_qar` | QAR | `gmv_qar ÷ orders`, recalculated for every day, week and month, never summed or averaged |

### Status colours

| Colour | Scenario rule (default) | Threshold rule (t = `kpiStatus.thresholdPct`, default 5%) |
|---|---|---|
| Green | Actual at or above forecast | At or above forecast |
| Amber | Below forecast, at or above bear | Up to t below forecast |
| Red | Below bear | More than t below forecast |
| Blue outline | Above bull | More than t above forecast |
| Grey italic | No actual yet: the forecast is shown, never counted as zero | Same |

- **When the threshold rule applies:** for sources or KPIs without bear/bull, and always for AOV. AOV has no meaningful bear/bull, because the engine applies the same % to GMV and orders.
- **Forcing the threshold rule:** set `statusMode: "threshold"` on a source, or `kpiStatus.mode`.
- **Month-to-date:** sums the days that have an actual. MTD attainment = MTD actual ÷ MTD forecast for those days; it is also shown against MTD bear.
- **Projected month end** = MTD actual + forecast for the remaining days × MTD attainment.

---

## 6. Connect the tracker to the spreadsheet (CONFIG)

### Publish the spreadsheet (one time)

**File → Share → Publish to web → Link → Entire document → Comma-separated values (.csv) → Publish.** Copy the link. It looks like:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vTBY…H4k/pub?output=csv
```

The `2PACX-…` part is the **publishedId**.

Things to know about publishing:
- **Anyone with the published link can read every tab.** Check this is acceptable for plan and KPI data, and that your Workspace admin allows publishing.
- **Google can take about 5 minutes** to reflect edits in the published CSV.
- **Publish the entire document**, not a single tab. Otherwise the other tabs' links don't work.

### The CONFIG block

At the top of `index.html`. Each tab needs only its **label**, **type** and **sheetUrl** (the tab's normal link from the address bar, with that tab open):

```js
const CONFIG = {
  mode: "urls",
  publishedId: "2PACX-1vTBY2uU0M5EwJeEiWFK2y06GTMz881OKAonyKdnk3oT0qR7JbU07h4BoKEuLzHIMpn4KkrTH4e3eH4k",
  sources: [
    { label: "Seasonal Moments", type: "moments",    sheetUrl: "https://docs.google.com/spreadsheets/d/1OaZ…JYlrYmJI/edit?gid=680008376#gid=680008376" },
    { label: "S Market",         type: "campaigns",  sheetUrl: "https://docs.google.com/spreadsheets/d/1OaZ…JYlrYmJI/edit?gid=1579014905#gid=1579014905" },
    …
    { label: "KPI Forecast",     type: "kpi_engine", sheetUrl: "https://docs.google.com/spreadsheets/d/1OaZ…JYlrYmJI/edit?gid=1008622602#gid=1008622602" },
  ],
  …
};
```

| Field | Meaning |
|---|---|
| `label` | The tab's name. For a campaign tab it's also the vertical (`S Laundry` = `SLaundry`; spaces and case don't matter) |
| `type` | `moments` (Seasonal Moments), `campaigns` (a vertical's tab), `kpi_engine` (the engine's KPI tab), or `kpi` (a long-format KPI tab) |
| `sheetUrl` | `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit?gid=<GID>#gid=<GID>` |

**What the tracker works out from those:**

| Derived | How |
|---|---|
| Published CSV link | `https://docs.google.com/spreadsheets/d/e/<publishedId>/pub?gid=<GID>&single=true&output=csv` |
| Edit link | `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit#gid=<GID>&range=A<row>` |
| Campaign tab vertical | From the label |
| KPI vertical | `Total` for Layer 1 |

**Optional overrides:** `vertical` (KPI tabs beyond Layer 1) and `statusMode` (`"threshold"`). Rarely needed: `url`, `editUrl`, `gid`, or a `file` pattern for dropped files.

**`mode`:**
- `"urls"` (the default): load every tab from Google Sheets on open.
- `"local"`: start with the drop zone instead.

Either way, dropping CSV files on the page works.

**Opening the page from disk:** this usually works, because Google normally lets any page read published CSVs. If your browser refuses (the tracker then says it couldn't reach Google Sheets, while the published link opens fine on its own), host `index.html` on an internal site, or run `python3 -m http.server` in this folder and open http://localhost:8000.

**Check the live connection from a terminal:** `node tools/check.mjs --live` fetches all the tabs and prints the same Loaded sources summary and data issues.

## 7. Edit in the sheet, then click Reload data

The tracker never changes your data. To fix or update something:

1. Click the initiative, a day, or an issue. Its **Edit in sheet ↗** button opens the right sheet, on the right tab, at the right row.
   - **Initiative panels** open that row.
   - **The day panel** opens that date's row in the KPI sheet. The engine file has a title row, so its data starts at row 3.
   - **Every item in Data issues** opens its row.
   - **Open sheets** in the header lists every configured sheet.
2. Make the change in Google Sheets.
3. Come back and click **Reload data**. Your view, month or week, filters and open panel stay put.

**How Reload data gets the new data**
- **From Google Sheets** (the default): it fetches every tab again. Allow about 5 minutes for Google to republish.
- **Local files:** download the new CSV and drop it on the page, which replaces the old one. In **Chrome and Edge**, files you picked with **Add or replace files** or dropped on the page are remembered, so **Reload data** re-reads them from disk in one click (the browser may ask permission once). Other browsers say which files to choose again.

  Re-reading remembered files couldn't be tested here, because the headless test browser can't use the real file picker. Check it once in Chrome or Edge.

**Edit links come from each tab's `sheetUrl`** (section 6). Dropped files get them too, when their name contains the tab's label.

**When the button is greyed out:** the source isn't in the config, or a dropped file's name doesn't contain a tab label. Hover the button for the reminder.

If someone sorts or inserts rows after an export, row links point to the old positions until the next reload.

---

## 8. Add a tab or a vertical

**One of the eight verticals above:**
1. Add its tab to the spreadsheet (section 2).
2. Open the tab and copy the address-bar link.
3. Add `{ label: "<tab name>", type: "campaigns", sheetUrl: "<link>" }` to `sources`.

The published document picks up the new tab automatically.

**A KPI layer for a vertical:** add `{ label: "KPI <vertical>", type: "kpi_engine", sheetUrl: "<link>", vertical: "<vertical>" }`.

**A brand-new vertical:** a maintainer also needs to:
1. In `index.html`, add it to `ALLOWED.vertical`, `VERTICAL_CODES`, and a colour (`--v-xxx` in `:root` plus `VERTICAL_VAR`).
2. In `tools/build_templates.py`, add it to `VERTICALS` and run `python3 tools/build_templates.py`.
3. Add the name to the **Lists** tab's `vertical` column.

---

## 9. Use the tracker

**Header**
- "Actuals through Sun 25 Oct": the latest day with an actual for the KPI series in view.
- **Reload data**, **Add or replace files**, **Open sheets**, **Clear data**, and **Print** with an A4/A3 choice.

**Month** (the default view)
- **Daily KPIs** sit under the date axis, on the same day columns as the bars.
  - Each cell shows the actual, or the forecast in grey italics when there's no actual, coloured by status. Hover for forecast, bear, bull, actual, delta and delta %.
  - The **Month to date** column on the right shows attainment and the projected month end. Hover it for the detail.
  - The **KPIs** chips choose which rows show.
  - **Tint days** shades each day of the calendar by orders status.
- **Swimlanes:** seasonal moments, then brand and tactical campaigns grouped by vertical. Click a vertical's name to collapse it.
- **Colour = vertical. Style = status:**
  - dashed = Idea
  - light = Planning
  - solid = Live
  - faded = Complete
  - hatched = Paused
  - ◀/▶ = continues past the month
- **Weeks** run **Sunday to Saturday**, with lines on Sundays and Fri/Sat lightly shaded. The red line is today.

**Week**
- **KPI table** for Sunday to Saturday: forecast, actual (coloured), delta and delta % per day.
  - The **Week** column's Forecast row shows the full week.
  - Its delta compares the actuals so far with the forecast for the same days, shown as e.g. "(5/7 d)".
- **Below the table**, three columns:
  - **Launching:** starts this week.
  - **Live:** started earlier and runs past Saturday.
  - **Ending:** started earlier and ends this week.

**Data:** every row, with its source file and row number.

**Filters** apply everywhere.
- **Vertical** lets you pick several. When exactly one is selected and it has a KPI source, the KPIs switch to that vertical. Otherwise they show the **Company total**, labelled as such.
- **Tier, Type, Status, Owner and Moments** are covered in section 4.

**Side panels**
- **Click a day** (a day number, a KPI cell, or a column in the week's KPI table) for:
  - that day's KPIs
  - the seasonal moments on that day
  - every campaign live that day, grouped by vertical

  Click a campaign to open it, and use "← Back" to return to the day.
- **Click a bar, card or row** for every field, the source file and row, its issues, and its parent and children (from any sheet).

Esc closes either panel.

---

## 10. Data issues and dismissing them

The **Data issues** list names the file and the sheet row (the header is row 1; engine data starts at row 3). Clicking an issue opens its row or day. Rows with problems are still shown wherever possible.

| Issue | Level |
|---|---|
| Duplicate id (also across files) | Error |
| parent_id doesn't match any id | Error |
| Missing / invalid date, end before start | Error |
| Value not in the list (tier, vertical, status, campaign type on campaigns, priority, date_confidence) | Error |
| Seasonal moment in a vertical file / campaign in the moments file | Error |
| Missing required column (id, name, tier, start_date, end_date) | Error |
| Tactical campaign with no parent | Warning |
| Dates outside the parent's dates | Warning |
| id doesn't follow the pattern / parent is the wrong tier / budget not a number | Warning |
| Unknown value in relevant_verticals | Warning |
| **KPI:** unreadable date or number, duplicate date | Error |
| **KPI:** gap in the dates, past day with no actual, forecast outside bear–bull, unknown vertical or KPI, Layer 2+ file without a vertical | Warning |

### Dismissing

- **Dismiss** hides an issue from the main list and counts. You can add a note, e.g. "Intentional: standalone occasion".
- **All N like this** dismisses every issue of that type showing now. New ones of that type will still appear.
- **Dismissed issues** move to a collapsible **Dismissed** section, with their notes and a **Restore** button.
  - Errors can be dismissed too, but keep an ⚠ icon there and a hollow marker on their bar.
- **How a dismissal is matched:** it's tied to the issue type, the row's id (or the date, for KPI issues), and the values that caused it.
  - Change the data and the issue comes back on its own.
  - Dismissals that no longer match anything are kept in case the data changes back. Use **Remove the N that no longer match** to clear them.
- **Where they're saved:** in this browser only. If browser storage is blocked, they last until the page closes.

**Sharing one set with the team:**
1. Click **Export dismissals** to download a JSON file.
2. Others click **Import dismissals**, or drop the `.json` on the page. Imported dismissals merge with their own.

---

## 11. Print for leadership

1. Choose the month or week, and set any filters. Collapsed verticals and the KPI chip choices carry through to the printout.
2. Choose **A4 landscape** or **A3 landscape** next to **Print**, then click **Print**. Choose *Save as PDF* to drop it into a deck.
3. The printout shows:
   - a title, the active filters, the sources and the print date
   - the legend, the KPI rows and the timeline

**Fit and size**
- A month fits on one landscape page with typical volumes.
- On A4 the daily KPI numbers print small. A3 has room for full size.

If the colours come out blank, tick **Background graphics** in the print dialog's *More settings*.

---

## For maintainers

- **Everything is in `index.html`.**
  - The `CONFIG` block is at the top.
  - The data logic sits between `CORE:BEGIN` and `CORE:END`: the CSV parser, merge, validation, KPI parsing, status, MTD and issue fingerprints. It doesn't touch the page, so it can be tested on its own.
  - There are no external libraries.
- **`node tools/check.mjs`** runs that same logic in Node, using the page's CONFIG.
  - It prints loaded sources, data issues and a KPI month summary.
  - Options: `--live` (fetch every tab in CONFIG from Google Sheets), `--month=2026-10`, `--today=2026-10-26`, `--rows` (print every plan row) and `--test` (parser, date, KPI status and config self-tests).
  - `tools/fixtures/` holds deliberately broken files that trigger every validation rule, including the KPI checks.
- **`python3 tools/build_templates.py`** regenerates both `.xlsx` templates. It needs `openpyxl`. Its allowed values must match `ALLOWED` in `index.html`.
