/**
 * Holiday Hornets sign-up backend.
 * Paste this whole file into Extensions > Apps Script in your Google Sheet,
 * run setup() once, then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */
const OUTINGS = [
  ["pumpkin", "Pumpkin patch"],
  ["cornmaze", "Corn maze"],
  ["fright", "Fright Nights at Playland"],
  ["ghosttrain", "Stanley Park Halloween train"],
  ["applecider", "Cider tasting in the valley"],
  ["salmon", "Watch the salmon run"],
  ["ghosttour", "Gastown ghost walk"],
  ["fallcolours", "Fall colours walk"],
  ["fortlangley", "Fort Langley fall day"],
  ["xmasmarket", "Vancouver Christmas Market"],
  ["grouseskate", "Skating on Grouse Mountain"],
  ["robsonskate", "Skating at Robson Square"],
  ["canyon", "Canyon Lights"],
  ["vandusen", "VanDusen Festival of Lights"],
  ["brightnights", "Bright Nights train"],
  ["lafarge", "Lights at Lafarge"],
  ["carolships", "Carol Ships Parade of Lights"],
  ["shipyards", "Shipyards Christmas Market"],
  ["burnabyvillage", "Heritage Christmas"],
  ["treefarm", "Cut your own Christmas tree"],
  ["festtrees", "Festival of Trees"],
  ["hightea", "Holiday high tea"],
  ["cookie", "Hornets cookie swap"],
  ["sweatercrawl", "Ugly sweater pub crawl"],
  ["nutcracker", "The Nutcracker"],
  ["whistler", "Whistler village day trip"],
  ["polarbear", "Polar Bear Swim"],
  ["eagles", "Bald eagle watching"],
  ["hotchoc", "Hot Chocolate Festival"],
  ["snowshoe", "Snowshoe night on Seymour"],
  ["tubing", "Snow tubing"],
  ["dineout", "Dine Out Vancouver"],
  ["harrison", "Harrison Hot Springs"],
  ["lunar", "Lunar New Year Parade"]
];

function setup() {
  const ss = SpreadsheetApp.getActive();
  const s = ss.getSheetByName("Signups") || ss.insertSheet("Signups");
  if (s.getLastRow() === 0) s.appendRow(["Timestamp", "Name", "Outing", "Outing ID", "Browser ID"]);
  s.setFrozenRows(1);
  const d = ss.getSheetByName("Dates") || ss.insertSheet("Dates");
  if (d.getLastRow() === 0) {
    d.appendRow(["Outing ID", "Outing", "Date (type a date to set it)", "Hide from page? (type yes)"]);
    OUTINGS.forEach(o => d.appendRow([o[0], o[1], "", ""]));
  }
  d.setFrozenRows(1);
  d.getRange("C2:C").setNumberFormat("yyyy-mm-dd");
  d.autoResizeColumns(1, 4);
  const blank = ss.getSheetByName("Sheet1");
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
}

function doGet(e) {
  const cid = (e && e.parameter && e.parameter.cid) || "";
  const ss = SpreadsheetApp.getActive();
  const tz = ss.getSpreadsheetTimeZone();
  const s = ss.getSheetByName("Signups");
  const d = ss.getSheetByName("Dates");
  const rows = s && s.getLastRow() > 1 ? s.getRange(2, 1, s.getLastRow() - 1, 5).getValues() : [];
  const signups = rows
    .filter(r => r[1] && r[3])
    .map(r => ({ name: String(r[1]), outing: String(r[3]), me: !!cid && String(r[4]) === cid }));
  const dates = {};
  const hidden = [];
  if (d && d.getLastRow() > 1) {
    d.getRange(2, 1, d.getLastRow() - 1, 4).getValues().forEach(r => {
      const id = String(r[0]);
      if (!id) return;
      const v = r[2];
      if (v instanceof Date) dates[id] = Utilities.formatDate(v, tz, "yyyy-MM-dd");
      else if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) dates[id] = String(v);
      if (/^y/i.test(String(r[3]))) hidden.push(id);
    });
  }
  return json({ signups, dates, hidden });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const b = JSON.parse(e.postData.contents);
    const s = SpreadsheetApp.getActive().getSheetByName("Signups");
    let name = String(b.name || "").trim().slice(0, 30);
    if (/^[=+\-@]/.test(name)) name = "'" + name;
    const cid = String(b.cid || "").slice(0, 64);
    const outing = String(b.outing || "").slice(0, 40);
    if (!cid) return json({ ok: false });
    const known = OUTINGS.find(o => o[0] === outing);
    const last = s.getLastRow();
    const rows = last > 1 ? s.getRange(2, 1, last - 1, 5).getValues() : [];
    if (b.action === "add") {
      if (!name || !known) return json({ ok: false });
      const dup = rows.some(r => String(r[4]) === cid && String(r[3]) === outing);
      if (!dup) s.appendRow([new Date(), name, known[1], outing, cid]);
    } else if (b.action === "remove") {
      for (let i = rows.length - 1; i >= 0; i--) {
        if (String(rows[i][4]) === cid && String(rows[i][3]) === outing) s.deleteRow(i + 2);
      }
    } else if (b.action === "rename" && name) {
      rows.forEach((r, i) => { if (String(r[4]) === cid) s.getRange(i + 2, 2).setValue(name); });
    }
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
