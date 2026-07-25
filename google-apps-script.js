// Google Apps Script — Deploy as Web App
// 1. Go to https://script.google.com
// 2. Paste this entire script
// 3. Click "Deploy" → "New deployment" → Type: "Web app"
// 4. Set "Execute as" = "Me", "Who has access" = "Anyone"
// 5. Copy the deployment URL and replace in app/page.tsx

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name,
    data.email,
    data.grade,
    data.targetProgram,
    data.question,
  ]);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this once to set up the sheet headers
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow(["Timestamp", "Name", "Email", "Grade", "Target Program", "Question"]);
}
