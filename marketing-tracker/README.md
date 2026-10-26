# Marketing Tracker

One page that shows all marketing activity by month and by week, across three tiers:
**Seasonal Moments → Brand Campaigns → Tactical Campaigns**. Next to the plan, it shows daily **orders, GMV and AOV** against forecast, so a bad day sits right beside what was running. It doubles as the current-state marketing plan.

- **Source of truth:** Google Sheets.
  - One sheet per vertical holds its brand and tactical campaigns.
  - One shared **Seasonal Moments** sheet is owned centrally.
  - The **daily KPI forecast** is exported as-is from the forecasting engine.
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
2. Drag the files onto the page, or click **Add or replace files** and pick several at once:
   - the Seasonal Moments CSV
   - every vertical's CSV
   - the KPI forecast export
3. That's it. The browser remembers the files until you click **Clear data**.

**Updating files**
- **A file with the same name** replaces the old one.
- **A new engine export** replaces the previous one for the same vertical, even if its file name differs (e.g. `… (1).csv`).
- **Reload data** re-reads everything and keeps your current view, month or week, and filters. See section 7.

Your files stay on your computer. Nothing is uploaded.

> Try it now: drop the files from `sample-data/` onto the page.

---

## 2. Set up a sheet (one time)

### A vertical's sheet

1. In Google Drive: **New → Google Sheets**, then name it e.g. `Marketing Plan – S Market`.
2. **File → Import → Upload**, choose `tracker_template.xlsx`, then pick **Replace spreadsheet**.
3. Check that the **Initiatives** tab has dropdowns in `tier`, `vertical`, `campaign_type`, `status`, `priority` and `date_confidence`, and that the **Lists** tab exists.
4. Recommended: **Data → Protect sheets and ranges** to protect the **Lists** tab and the header row.

### The shared Seasonal Moments sheet (central team only)

Do the same with `seasonal_moments_template.xlsx`.
- `tier` and `vertical` are pre-filled (Seasonal Moment / Cross-vertical), and their dropdowns allow only that value.
- Google Sheets doesn't keep locked cells from an imported file. To stop edits, protect columns C and E with **Data → Protect sheets and ranges**.
- Rows with nothing but those two pre-filled values are ignored. Loaded sources counts them as "blank rows skipped".

Existing sheets don't need re-importing. Any column a sheet doesn't have is read as blank. Only `id`, `name`, `tier`, `start_date` and `end_date` are required.

---

## 3. Update your sheet

One row = one initiative. Don't rename columns. Their order doesn't matter, because columns are matched by header name.

| Column | What to enter |
|---|---|
| `id` | Unique across **all** sheets, never reused. **Moments:** `SM-001`… **Campaigns:** `[CODE]-BC-001` for brand, `[CODE]-TC-001` for tactical, e.g. `SMK-TC-014` |
| `name` | Short, readable name. This is what appears on the bar |
| `tier` | Brand Campaign / Tactical Campaign. Seasonal Moment is only for the shared sheet |
| `parent_id` | The `id` of the parent, which may live in another sheet. **Brand:** optional, link to a seasonal moment. **Tactical:** a brand campaign or a seasonal moment. **Moments:** leave empty |
| `vertical` | Dropdown. Moments are always `Cross-vertical` |
| `relevant_verticals` | **Moments only.** Verticals the moment matters to, separated by semicolons (`Restaurants;Grocery`), or `All`. Blank means All. `Brand` and `City` are accepted as audiences (they don't match a campaign vertical); see `informationalAudiences` in the config |
| `sub_vertical` | Optional free text |
| `campaign_type` | **Campaigns:** Hero, Promo, Tactical, Occasion, Recurrent, USP, Segmented, Engagement, Adoption, Habit Builder (required). **Moments:** MarCom's moment type, any text (e.g. National occasion, International day) |
| `priority` | **Campaigns:** P0–P3. **Moments:** MarCom tier T1–T3. Optional |
| `date_confidence` | Confirmed / Fixed date / Tentative / Tentative (lunar) / School-specific / Planning window. Anything but Confirmed or Fixed date shows as **date tentative** |
| `start_date`, `end_date` | `YYYY-MM-DD`. A one-day activity has the same start and end |
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

Export the engine's sheet as CSV and drop it on the page, or publish it (section 6). **Don't reformat it.** The tracker reads the native layout:

| Position | Header | How it's used |
|---|---|---|
| Row 1 | Title, e.g. `LAYER 1 — Orders & GMV \| 180-Day Tracking` | Identifies the file and its layer. Otherwise skipped |
| Row 2 | Headers (contain line breaks; `Err%` repeats) | Skipped. Columns are read **by position** |
| Col 1 | Date | `DD-Mmm-YY`, e.g. `14-May-26` |
| Col 2 | Day | **Ignored.** The weekday comes from the date |
| Col 3–6 | Ord Bear −7% / Forecast / Bull +10% / Actual | Orders. A blank actual means no actual yet |
| Col 7–9 | Ord Err% ×3 | **Ignored.** Recalculated |
| Col 10–13 | GMV Bear −7% / Forecast / Bull +10% / Actual | GMV in QAR |
| Col 14–16 | GMV Err% ×3 | **Ignored** |

- **Number formats:** values like `"101,623"` and `"10,077,762.51"` are fine.
- **Date range:** any range works. Nothing depends on the "180 days" in the file name.
- **Recognising the file:** by its title row or header, not its name.

**Dropping in a new export:** whenever actuals are updated, export again and drop the new file on the page, or click **Reload data** if it's published. It replaces the previous export for the same vertical.

**Layers and verticals**
- **Layer 1** is the company total and is stored as vertical `Total`.
- **Other layers:** a future Layer 2 file in the same layout (e.g. Grocery) needs a config entry naming its vertical:
  ```js
  { label: "KPI – Grocery", type: "kpi", vertical: "Grocery", file: "*L2*Grocery*.csv" }
  ```
  Without one, the file shows as "Unassigned" with a warning.

### Long format (for teams that send their own forecasts)

```
date,vertical,kpi,forecast,forecast_bear,forecast_bull,actual
2026-10-18,Grocery,orders,15200,,,15480
2026-10-18,Grocery,gmv_qar,1480000,,,1502300
```

- **Dates:** `YYYY-MM-DD` (or `DD-Mmm-YY`).
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

## 6. Get the sheets into the tracker

There are two ways. Pick one for the whole team.

### Option A: Download CSVs (the default, nothing to configure)

1. Open the sheet on the right tab (**Initiatives**, or the engine's tab). Only the active tab downloads.
2. **File → Download → Comma-separated values (.csv)**.
3. Drop the file on the tracker.

### Option B: Publish to web (live, no downloading)

1. In each sheet: **File → Share → Publish to web**. Under **Link**, choose the tab and **Comma-separated values (.csv)**, click **Publish**, and copy the URL.
2. In `index.html`, set `mode: "urls"` in CONFIG and add each URL to `sources`.

Things to know about publishing:
- **Anyone with a published link can read that tab.** Check this is acceptable, and that your Workspace admin allows publishing.
- Google can take about 5 minutes to reflect edits in the published CSV.
- If a source shows "Could not load", open its URL in the browser. It should download or show raw CSV, not a sign-in page.
- Some browsers block a page opened as a file from fetching data. If so, host `index.html` on an internal site, or run `python3 -m http.server` in this folder and open http://localhost:8000.

  URL mode was tested against a local web server, not a live published Google Sheet. Do one test run before relying on it.

### The CONFIG block

Every field except `label` is optional:

```js
sources: [
  { label: "Seasonal Moments", type: "moments", file: "seasonal_moments*.csv",
    url: "https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv",
    editUrl: "https://docs.google.com/spreadsheets/d/1AbC…/edit", gid: 0 },
  { label: "S Market", type: "campaigns", file: "s_market*.csv",
    editUrl: "https://docs.google.com/spreadsheets/d/1XyZ…/edit", gid: 0 },
  { label: "KPI forecast – Total App", type: "kpi", vertical: "Total", file: "*L1*Total*.csv",
    editUrl: "https://docs.google.com/spreadsheets/d/1Kp…/edit", gid: 123456789 },
],
```

| Field | Meaning |
|---|---|
| `type` | `moments`, `campaigns` or `kpi`. Leave it out to let the contents decide |
| `url` | Published CSV link (URL mode) |
| `file` | Local mode: the file-name pattern that identifies this sheet's export. `*` matches anything. This is how a dropped file finds its `editUrl` and, for KPIs, its `vertical` |
| `editUrl`, `gid` | Turn on the **Edit in sheet** buttons and the **Open sheets** menu |
| `vertical`, `statusMode` | KPI sources only (section 5) |

---

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
- **URL mode:** it fetches every published sheet again (allow about 5 minutes for Google to republish).
- **Local files:** download the new CSV and drop it on the page, which replaces the old one. In **Chrome and Edge**, files you picked with **Add or replace files** or dropped on the page are remembered, so **Reload data** re-reads them from disk in one click (the browser may ask permission once). Other browsers say which files to choose again.

  Re-reading remembered files couldn't be tested here, because the headless test browser can't use the real file picker. Check it once in Chrome or Edge.

**Finding `editUrl` and `gid`:** open the sheet and click the right tab. The address bar shows
`https://docs.google.com/spreadsheets/d/<sheet id>/edit#gid=<number>`.
- **`editUrl`:** everything up to and including `/edit`. Anything after `/edit` is ignored anyway.
- **`gid`:** the number after `#gid=`. The first tab is usually `0`.

**When the button is greyed out:** that source has no `editUrl` in the config. Hover the button for the reminder.

If someone sorts or inserts rows after an export, row links point to the old positions until the next reload.

---

## 8. Add a new vertical

**One of the eight verticals above:**
1. Create its sheet from `tracker_template.xlsx`.
2. Add a `sources` entry in the config (`label`, `type: "campaigns"`, `file` and/or `url`, `editUrl`, `gid`).
3. Share or publish its CSV.

**If it gets its own KPI layer:** add a `type: "kpi"` entry with its `vertical`.

**A brand-new vertical:** a maintainer needs to:
1. In `index.html`, add it to `ALLOWED.vertical`, `VERTICAL_CODES`, and a colour (`--v-xxx` in `:root` plus `VERTICAL_VAR`).
2. In `tools/build_templates.py`, add it to `VERTICALS` and run `python3 tools/build_templates.py`.
3. In every existing sheet, add the name to the **Lists** tab's `vertical` column.

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
  - Options: `--month=2026-10`, `--today=2026-10-26`, `--rows` (print every plan row) and `--test` (parser, date and KPI status self-tests).
  - `tools/fixtures/` holds deliberately broken files that trigger every validation rule, including the KPI checks.
- **`python3 tools/build_templates.py`** regenerates both `.xlsx` templates. It needs `openpyxl`. Its allowed values must match `ALLOWED` in `index.html`.
