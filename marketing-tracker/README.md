# Marketing Tracker

One page that shows all marketing activity by month and by week, across three tiers:
**Seasonal Moments → Brand Campaigns → Tactical Campaigns**. It doubles as the current-state marketing plan.

- **Source of truth:** Google Sheets. There is one sheet per vertical (brand and tactical campaigns only), plus one shared **Seasonal Moments** sheet owned centrally.
- **Visual layer:** `index.html`. It's a single file with no install, no build step and no server.

```
marketing-tracker/
  index.html                       the tracker
  tracker_template.xlsx            template for a vertical's sheet
  seasonal_moments_template.xlsx   template for the shared moments sheet
  sample-data/                     example CSVs (Seasonal Moments + S Market)
  tools/                           for maintainers (see the end of this file)
```

---

## 1. Open the tracker

1. Double-click `index.html`. It opens in your browser (Chrome, Edge, Safari or Firefox).
2. Drag the CSV files onto the page, or click **Choose CSV files** and pick several at once. Load the Seasonal Moments CSV plus every vertical's CSV.
3. That's it. The browser remembers the files until you click **Clear data**, so a reload doesn't lose them.

To update one vertical, drop its new CSV on the page. A file with the **same name** replaces the old one. A file with a new name is added alongside.

Your files stay on your computer. Nothing is uploaded.

> Try it now: drop the two files from `sample-data/` onto the page.

---

## 2. Set up a sheet (one time)

### A vertical's sheet

1. In Google Drive: **New → Google Sheets**, then name it e.g. `Marketing Plan – S Market`.
2. **File → Import → Upload**, choose `tracker_template.xlsx`, then pick **Replace spreadsheet**.
3. Check that the **Initiatives** tab has dropdowns in `tier`, `vertical`, `campaign_type` and `status`, and that the **Lists** tab exists.
4. Recommended: **Data → Protect sheets and ranges** to protect the **Lists** tab and the header row, so nobody renames a column by accident.

### The shared Seasonal Moments sheet (central team only)

Do the same with `seasonal_moments_template.xlsx`.
- `tier` and `vertical` are pre-filled (Seasonal Moment / Cross-vertical), and their dropdowns allow only that one value.
- Google Sheets doesn't keep locked cells from an imported file. So to stop edits, protect columns C and E with **Data → Protect sheets and ranges**.
- The pre-filled rows with nothing else in them are ignored by the tracker. The Loaded sources table counts them as "blank rows skipped".

---

## 3. Update your sheet

One row = one initiative. Keep every column, even when it's empty. Don't rename, reorder or delete columns.

| Column | What to enter |
|---|---|
| `id` | Unique across **all** sheets, never reused. **Moments:** `SM-001`, `SM-002`… **Campaigns:** `[CODE]-BC-001` for brand, `[CODE]-TC-001` for tactical, e.g. `SMK-BC-001`, `SMK-TC-014` |
| `name` | Short, readable name. This is what appears on the bar |
| `tier` | Dropdown: Brand Campaign / Tactical Campaign. Seasonal Moment is only for the shared sheet |
| `parent_id` | The `id` of the parent, which may live in another sheet. **Brand:** optional, link to a seasonal moment. **Tactical:** link to a brand campaign or a seasonal moment. **Moments:** leave empty |
| `vertical` | Dropdown |
| `campaign_type` | Dropdown: Hero, Promo, Tactical, Occasion, Recurrent, USP, Segmented, Engagement, Adoption, Habit Builder. Required for campaigns, optional for moments |
| `start_date`, `end_date` | `YYYY-MM-DD`, e.g. `2026-11-27`. A one-day activity has the same start and end date |
| `status` | Dropdown: Idea / Planning / Live / Complete / Paused |
| `owner` | Person or team |
| `channels` | Separate with semicolons: `WhatsApp;Paid Ads;CRM` |
| `brief`, `target_audience`, `goal`, `kpis`, `key_message`, `top_highlights` | Free text. Commas and line breaks are fine. In `top_highlights`, semicolons become bullet points in the side panel |
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
- **Never delete or renumber a row other sheets link to.** Set its status to `Complete` or `Paused` instead. Deleting it breaks the children's `parent_id`.
- **Check the next free number before adding an id.** Duplicates are flagged as errors, even across sheets.
- **Keep the date format.** The date columns are formatted `yyyy-mm-dd` so the export is right. If a pasted date comes out as `11/27/2026`, use **Format → Number → Custom date and time** and set it back to `yyyy-mm-dd`.

---

## 4. Get your sheet into the tracker

There are two ways. Pick one for the whole team.

### Option A: Download CSVs (the default, nothing to configure)

1. Open your sheet and click the **Initiatives** tab. Only the active tab is downloaded.
2. **File → Download → Comma-separated values (.csv)**.
3. Share the file with whoever presents the plan, or drop it on the tracker yourself.

Google names the file `<sheet name> - Initiatives.csv`. That name is the "source" shown in the tracker. Keep it the same each time so a new download replaces the old one.

### Option B: Publish to web (live, no downloading)

1. In each sheet: **File → Share → Publish to web**.
2. Under **Link**, choose the **Initiatives** tab and **Comma-separated values (.csv)**. Click **Publish** and copy the URL.
3. Open `index.html` in a text editor. In the `CONFIG` block at the top, set `mode: "urls"` and add one line per sheet:

   ```js
   const CONFIG = {
     mode: "urls",
     sources: [
       { label: "Seasonal Moments", url: "https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv", kind: "moments" },
       { label: "S Market",         url: "https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv" },
     ],
   };
   ```

4. Save it. From now on the tracker fetches the sheets every time it opens. **Reload sheets** fetches them again without reloading the page.

`kind` is optional: the tracker works out which file holds the moments from its rows.

Things to know about publishing:
- **Anyone with a published link can read that tab.** Check this is acceptable for plan data, and that your Google Workspace admin allows publishing.
- Google can take about 5 minutes to reflect edits in the published CSV.
- If a source shows "Could not load", open its URL in the browser. It should download or show raw CSV text, not a Google sign-in page.
- Some browsers block fetching from a page opened as a file. If that happens, host `index.html` on an internal web server or intranet page, or run `python3 -m http.server` in this folder and open http://localhost:8000.

  These URL steps weren't tested against a live published sheet during the build. Please do one test run before relying on them.
- Dropping CSV files on the page still works in URL mode. It's handy for checking a draft before you publish.

---

## 5. Add a new vertical

**If it's one of the eight verticals listed above:** create its sheet from `tracker_template.xlsx` (section 2) and use its code in the ids. Then either share its CSV (Option A) or add its URL to `CONFIG.sources` (Option B). Nothing else changes.

**If it's a brand-new vertical (not in the list):** a maintainer needs to:
1. In `index.html`, add the name to `ALLOWED.vertical` and its code to `VERTICAL_CODES`. Pick a colour: add a `--v-xxx` variable in `:root` and map it in `VERTICAL_VAR`.
2. In `tools/build_templates.py`, add it to `VERTICALS` and run `python3 tools/build_templates.py` to regenerate both templates.
3. In every existing sheet, add the new name to the **Lists** tab's `vertical` column. Extend the dropdown range under **Data → Data validation** if needed.

---

## 6. Use the tracker

**Month** (the default view)
- One month at a time. Use ‹ › or the month picker, and **Today** to come back.
- Seasonal moments sit on top. Brand and tactical campaigns are below, grouped by vertical. Click a vertical's name to collapse it.
- **Colour = vertical** (see the legend).
- **Style = status:**
  - dashed outline = Idea
  - light fill = Planning
  - solid = Live
  - faded = Complete
  - hatched = Paused
- A bar with a square edge and ◀/▶ continues into the previous or next month.
- Grey shaded bands behind the campaigns show each seasonal moment's dates. Hover a moment to highlight its band.
- The red line is today. Week lines fall on Sundays, and Fri/Sat are lightly shaded.

**Week**
- Weeks run **Sunday to Saturday** and are labelled "Week of Sun 1 Nov".
- There are three columns:
  - **Launching:** starts this week.
  - **Live:** started earlier and runs past Saturday.
  - **Ending:** started earlier and ends this week.
- Each initiative appears in exactly one column. A one-day activity is under Launching, marked "one day".

**Data:** a plain table of every row, with its source file and row number.

**Filters** apply to all three views.
- Vertical lets you pick several.
- Seasonal moments always stay visible when you filter by vertical, campaign type or owner. They still respond to the tier and status filters.

**Side panel:** click any bar, card or row. It shows:
- every field
- the source file and row
- the row's data issues
- the parent and the children, including children from other verticals' sheets

Click a parent or child to move to it, and press Esc to close.

### Data issues

The **Data issues** list names the file and the sheet row (the header is row 1). Rows with problems are still shown wherever possible. Rows with missing or invalid dates can't be placed on the timeline, so they're listed under it.

| Message | Level | How to fix |
|---|---|---|
| Duplicate id | Error | Give one of the rows a new id. Check the other file named in the message |
| parent_id doesn't match any id | Error | Fix the typo, or load the file that holds the parent |
| Missing / invalid date, end before start | Error | Use `YYYY-MM-DD` and a real calendar date |
| Value is not allowed (tier, vertical, type, status) | Error | Use the dropdown |
| Seasonal moment in a vertical file / campaign in the moments file | Error | Move the row to the right sheet |
| Header is missing columns | Error | Re-import the template, or restore the column name |
| Tactical campaign has no parent | Warning | Link it to a brand campaign or moment |
| Dates fall outside the parent | Warning | Adjust the dates, or confirm it's intentional |
| id doesn't follow the pattern | Warning | Use `SM-001` or `[CODE]-BC/TC-001` |
| Parent is the wrong tier | Warning | Brand → moment. Tactical → brand or moment |
| budget_qar is not a number | Warning | Numbers only |

---

## 7. Print for leadership

1. Choose the month (or week), and set any filters. Collapsing verticals also carries through to the printout.
2. Choose **A4 landscape** or **A3 landscape** next to **Print**, then click **Print**. Choose *Save as PDF* to drop it into a deck.
3. The printout shows:
   - a title, the active filters, the sources and the print date
   - the legend and the timeline
4. A month fits on one landscape A4 page with typical volumes. Use A3 when several verticals are loaded.

If the colours come out blank, tick **Background graphics** in the print dialog's *More settings*.

---

## For maintainers

- **Everything is in `index.html`.**
  - The `CONFIG` block is at the top.
  - The data logic (CSV parser, merge, validation) is in the block marked `CORE:BEGIN … CORE:END`. It doesn't touch the page, so it can be tested on its own.
  - There are no external libraries.
- **`node tools/check.mjs`** runs that same logic on `sample-data/` and prints the loaded sources, merged rows and data issues.
  - `node tools/check.mjs a.csv b.csv` checks any files.
  - `--test` runs the parser and date tests.
  - `tools/fixtures/` holds deliberately broken files that trigger every validation rule.
- **`python3 tools/build_templates.py`** regenerates both `.xlsx` templates. It needs `openpyxl`. Its allowed values must match `ALLOWED` in `index.html`.
