const DATA_ENTRY_SHEET_NAME = "Sheet1";
const TIME_STAMP_COLUMN_NAME = "timestamp";
const NUMBER_ID_COLUMN_INDEX = 0;

var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
  DATA_ENTRY_SHEET_NAME
);

function doGet(e) {
  var numberIds = getColumnValues(NUMBER_ID_COLUMN_INDEX);
  return ContentService.createTextOutput(JSON.stringify(numberIds)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getColumnValues(columnIndex) {
  var range = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1);
  var values = range.getValues();

  return values.map(function (row) {
    return row[0];
  });
}

const doPost = (request = {}) => {
  const { postData: { contents, type } = {} } = request;
  var data = parseFormData(contents);
  appendToGoogleSheet(data);
  return ContentService.createTextOutput(contents).setMimeType(
    ContentService.MimeType.JSON
  );
};

function parseFormData(postData) {
  var data = [];
  var parameters = postData.split("&");
  for (var i = 0; i < parameters.length; i++) {
    var keyValue = parameters[i].split("=");
    data[keyValue[0]] = decodeURIComponent(keyValue[1]);
  }
  return data;
}

function appendToGoogleSheet(data) {
  if (TIME_STAMP_COLUMN_NAME !== "") {
    const currentDate = new Date();
    const options = { timeZone: "America/Sao_Paulo" };
    data[TIME_STAMP_COLUMN_NAME] = currentDate.toLocaleString("pt-BR", options);
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = headers.map((headerFld) => data[headerFld]);
  sheet.appendRow(rowData);
}
