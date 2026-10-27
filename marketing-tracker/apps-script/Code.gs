/**
 * @OnlyCurrentDoc
 *
 * Snoonu Marketing Tracker: Apps Script web app bound to the Marketing Tracker
 * spreadsheet. It serves the tracker page (the "index" HTML file in this project)
 * and reads the tabs server-side, so nothing has to be published to the web.
 *
 * @OnlyCurrentDoc limits the script to this one spreadsheet. The permission
 * prompt then asks only for access to "the spreadsheet this app is installed in",
 * not to all of your Google Sheets.
 *
 * Deploy as a web app with:
 *   Execute as:      User accessing the web app
 *   Who has access:  Anyone within Snoonu
 * People then see data only if the spreadsheet is shared with them.
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Snoonu Marketing Tracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Finds a tab by name: exact match first, then ignoring case, spaces and
// punctuation ("S Laundry" also finds "SLaundry").
function findSheet_(ss, name) {
  var exact = ss.getSheetByName(name);
  if (exact) return exact;
  var norm = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); };
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (norm(sheets[i].getName()) === norm(name)) return sheets[i];
  }
  return null;
}

/**
 * One tab's cells as shown in the sheet (display values), as a 2D array of
 * strings. Dates and percentages arrive exactly as formatted in the sheet.
 * Returns null if there is no tab with that name.
 */
function getTab(tabName) {
  var sheet = findSheet_(SpreadsheetApp.getActiveSpreadsheet(), tabName);
  return sheet ? sheet.getDataRange().getDisplayValues() : null;
}

/**
 * Several tabs in one call. For each requested name:
 *   { name, found: true, sheetName, gid, values }   or   { name, found: false }
 */
function getTabs(tabNames) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return tabNames.map(function (name) {
    var sheet = findSheet_(ss, name);
    if (!sheet) return { name: name, found: false };
    return {
      name: name,
      found: true,
      sheetName: sheet.getName(),
      gid: sheet.getSheetId(),
      values: sheet.getDataRange().getDisplayValues(),
    };
  });
}

/** The spreadsheet's link and every tab's name and gid, for "Edit in sheet" links. */
function getSheetInfo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    url: ss.getUrl(),
    name: ss.getName(),
    tabs: ss.getSheets().map(function (sheet) {
      return { name: sheet.getName(), gid: sheet.getSheetId() };
    }),
  };
}

/** What the page calls on load and on "Reload data": sheet info and tabs in one round trip. */
function loadTracker(tabNames) {
  return { info: getSheetInfo(), tabs: getTabs(tabNames) };
}
