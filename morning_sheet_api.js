// 🔹 Get or create monthly sheet (Morning Spreadsheet)
function getMorningSheet() {
  var ss = SpreadsheetApp.openById("YOUR_SPREADSHEET_ID"); // 🔴 Replace with your spreadsheet ID

  var now = new Date();
  var sheetName = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM");

  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["UserID","Name","Task","Date"]);
  }

  return sheet;
}


// 🔹 Main API
function doGet(e) {

  var now = new Date();
  var hour = now.getHours();

  // ❌ Block after 3 PM
  if (hour < 8 || hour >= 15) {
    return ContentService.createTextOutput("Morning time ended");
  }

  // 🔹 Pending request
  if (e.parameter.action == "getPending") {
    return getPendingUsers();
  }

  var sheet = getMorningSheet();

  var user_id = String(e.parameter.user_id || "");
  var name = e.parameter.user_name || "";
  var task = e.parameter.task || "";

  if (task && String(task).trim() !== "") {

    var lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      var lastDate = new Date(sheet.getRange(lastRow, 4).getValue());
      var today = new Date();

      // 🔹 New day separator
      if (lastDate.toDateString() !== today.toDateString()) {
        sheet.appendRow(["---------------------------------------------------------------------------------------------", "", "", ""]);
        sheet.appendRow(["--------------------------------", "NEW DAY", today.toDateString(), "--------------------------------"]);
      }
    }

    // 🔹 Store entry
    sheet.appendRow([user_id, name, task, new Date()]);
  }

  return ContentService.createTextOutput("success");
}


// 🔹 Get pending users (ONLY TODAY - MORNING SHEET)
function getPendingUsers() {
  var sheet = getMorningSheet();
  var data = sheet.getDataRange().getValues();

  var doneUsers = [];

  var today = new Date();
  today.setHours(0,0,0,0);

  for (var i = 1; i < data.length; i++) {

    // skip separators
    if (
      data[i][0] === "--------------------------------" ||
      data[i][0] === "---------------------------------------------------------------------------------------------"
    ) continue;

    var uid = String(data[i][0]);
    var rowDate = new Date(data[i][3]);

    rowDate.setHours(0,0,0,0);

    // only today's data
    if (rowDate.getTime() === today.getTime()) {
      if (doneUsers.indexOf(uid) === -1) {
        doneUsers.push(uid);
      }
    }
  }

  // 🔹 Team members (🔴 Replace with your actual user list)
  var allUsers = [
    {id: "YOUR_USER_ID_1", name: "User Name 1"},
    {id: "YOUR_USER_ID_2", name: "User Name 2"}
  ];

  var pending = [];

  for (var i = 0; i < allUsers.length; i++) {
    var uid = String(allUsers[i].id);

    if (doneUsers.indexOf(uid) === -1) {
      pending.push(allUsers[i].name);
    }
  }

  return ContentService.createTextOutput(JSON.stringify(pending))
    .setMimeType(ContentService.MimeType.JSON);
}
