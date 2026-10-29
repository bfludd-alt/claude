# Set up the Snoonu Marketing Tracker web app

The tracker runs as an **Apps Script web app inside the Marketing Tracker spreadsheet**. It reads the tabs directly, so nothing has to be published to the web. People can open it only if they're in Snoonu's Google Workspace, and they see data only if the spreadsheet is shared with them.

You need edit access to the Marketing Tracker spreadsheet. Setup takes about 10 minutes. You only do it once.

---

## 1. Open the script editor from the sheet

1. Open the **Marketing Tracker** spreadsheet.
2. In the menu, click **Extensions → Apps Script**. A new browser tab opens with the script editor.
3. **Check whether the spreadsheet already has a script.**
   - If the project is called **Untitled project** and `Code.gs` holds only an empty `function myFunction() {}`, it's new. Rename it **Snoonu Marketing Tracker** and carry on.
   - If there's other code, more files, or anything under **Libraries** in the left sidebar, **stop**. Someone else's script lives here, and replacing `Code.gs` would delete it. Ask whoever maintains the tracker to set it up alongside that script instead.

## 2. Create two files and paste the code

The editor shows a file list on the left. It already has one file, **Code.gs**.

**File 1: `Code.gs`**
1. Click **Code.gs** in the file list.
2. Select everything in the editor (Ctrl+A, or Cmd+A on a Mac) and delete it. In a new project that's just the empty `myFunction`.
3. Open [`apps-script/Code.gs`](Code.gs) from this repository, copy all of it, and paste it in.

**File 2: `index`**
1. Next to **Files**, click **+** → **HTML**.
2. Name it exactly `index` (Apps Script adds `.html` itself) and press Enter.
3. Delete the few lines Apps Script puts in the new file.
4. Open [`index.html`](../index.html) from this repository (the main tracker file, in the `marketing-tracker` folder), copy **all** of it, and paste it in. It's long, about 3,100 lines.

Click **Save** (the disk icon, or Ctrl/Cmd+S).

> **Tab names must match.** The tracker looks for tabs named `Seasonal Moments`, `S Market`, `Restaurants`, `Snoomart`, `Grocery`, `S Laundry`, `Services`, `New Ventures`, `Royal Club`, `Snoonu Plus` and `KPI Forecast`. Case and spaces don't matter.
>
> If you rename a tab, change its `label` in the `CONFIG` block near the top of the `index` file to match.

## 3. Deploy it as a web app

1. Click the blue **Deploy** button (top right) → **New deployment**.
2. Next to **Select type**, click the gear icon ⚙ → **Web app**.
3. Fill in:
   - **Description:** `Marketing Tracker`
   - **Execute as:** **User accessing the web app**
   - **Who has access:** **Anyone within Snoonu**
4. Click **Deploy**.

## 4. Allow access the first time

Google asks you to authorise the script:

1. Click **Authorize access**.
2. Choose your Snoonu Google account.
3. Google shows what the app wants to do, along the lines of *"See, edit, create and delete only the specific Google Sheets spreadsheets that this application has been installed in"*. The script is limited to this one spreadsheet. Click **Allow**.
4. In some accounts Google first shows **"Google hasn't verified this app"**. That's normal for an app your own organisation made. Click **Advanced → Go to Snoonu Marketing Tracker (unsafe)**, then **Allow**.

The deployment then shows a **Web app URL** ending in `/exec`. Click **Copy**. This is the link you share with the team.

> Because the app runs **as the person opening it**, every colleague sees the same permission screen once, the first time they open the link. They click **Allow** too.
>
> If the spreadsheet isn't shared with someone, the tracker tells them they don't have access.

## 5. Check that it works

1. Open the **Web app URL** in a new tab.
2. Wait a few seconds while it reads the spreadsheet.
3. Expand **Loaded sources** at the top. You should see **11 rows**, one per tab, each marked "Google Sheet tab" with its row count:
   - **Seasonal Moments:** the number of moments
   - **Each vertical:** its number of campaigns (0 is fine for an empty tab)
   - **KPI Forecast:** the number of days, and "actuals through …" with the latest actual date
4. A row saying **"Tab not found"** means that tab's name doesn't match a label in CONFIG. The message lists the tab names it did find.
5. Click any campaign, then **Edit in sheet ↗**. The spreadsheet should open in a new tab, on the right tab and row.

## 6. Publish an update later (same link)

When there's a new version of `index.html` or `Code.gs`:

1. **Extensions → Apps Script**, open the file, select all, paste the new version, and **Save**.
2. Click **Deploy → Manage deployments**.
3. Select the **Marketing Tracker** deployment and click the **pencil ✎ (Edit)** icon.
4. Under **Version**, choose **New version**, then click **Deploy**.

The Web app URL stays the same, so everyone's link keeps working.

> **Don't use "New deployment" for updates.** It creates a second, different URL.
>
> To try changes before everyone sees them, use **Deploy → Test deployments**. This gives you a private link that always runs the latest saved code.

---

## If the page is blank

A completely blank page means the web app is serving an empty or out-of-date **index** file. A script problem would still show the "Marketing Tracker" header, and would now show a red error message too.

1. **Run the health check.** Open the web app URL with `?check=1` added to the end, e.g. `https://script.google.com/macros/s/…/exec?check=1`. It shows plain text:
   - the spreadsheet's tabs, with their row counts
   - a line about the **index** file. It should say about 185,000 characters, "looks complete". A **PROBLEM** there tells you what's wrong.

   If `?check=1` is also blank, or says "Script function not found", the deployment is running old code. Go to step 3.
2. **Check the index file in the editor.** It should start with `<!doctype html>`, end with `</html>`, and be about 3,100 lines long. If it's the short starter file Apps Script created, or ends early, select all, paste `index.html` again, and **Save**. No dot should remain next to the file name.
3. **Push the saved code to the link.** A deployment keeps the code as it was when you deployed it. Saving afterwards doesn't change what the link shows until you publish a new version: **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy.**

   To test without versioning, **Deploy → Test deployments** gives a link that always runs the latest saved code.
4. **Still blank? Try a private (incognito) window** signed in to only your Snoonu account. Apps Script web apps often show a blank page when the browser is signed in to several Google accounts at once, or when it blocks third-party cookies for `script.google.com` / `googleusercontent.com`.

## "You do not have access to library …"

The project lists a library, under **Libraries** in the editor's left sidebar, that your account can't open. The tracker's own code doesn't use any libraries.
- **New project with only `Code.gs` and `index`:** hover over the library → **⋮ → Remove**. Then publish a new version (step 6).
- **The project has other code that uses the library:** don't remove it. That code belongs to someone else. Ask the library's owner to share it with you, or set the tracker up as a separate project.

---

## Stop publishing the spreadsheet to the web

The web app reads the tabs directly, so the old "Publish to web" link isn't needed:

1. In the spreadsheet: **File → Share → Publish to web**.
2. Expand **Published content & settings** at the bottom of the dialog.
3. Click **Stop publishing**, and confirm.

The old `…/pub?output=csv` links stop working. The web app and normal sharing are not affected.

---

## Good to know

- **Reload data** re-reads all tabs in one go and keeps your current view, month or week, and filters.
- **Dismissed issues** are saved in your browser when it allows it. Inside the web app it sometimes doesn't, and then the issues panel says so. Use **Export dismissals** to keep them or share them, and **Import dismissals** (paste the text or choose the file) to load them.
- **Dropping CSV files** onto the page still works in the web app, for example to try a draft before pasting it into the sheet.
- **Edit in sheet** links open in a new tab.
