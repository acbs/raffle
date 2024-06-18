const DATA_ENTRY_SHEET_NAME = "Sheet1";
const TIME_STAMP_COLUMN_NAME = "timestamp";
const PHONE_COLUMN_NAME = "phone";
const NUMBER_ID_COLUMN_INDEX = 0;

var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
  DATA_ENTRY_SHEET_NAME
);

function doGet(e) {
  if (e.parameter.phone) {
    return handleFilteredGet(e);
  } else {
    return handleGetAll();
  }
}

function handleGetAll() {
  try {
    var numberIds = getColumnValues(NUMBER_ID_COLUMN_INDEX);
    return ContentService.createTextOutput(
      JSON.stringify(numberIds)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleFilteredGet(e) {
  try {
    const filterValue = e.parameter.phone;
    var filteredIds = getFilteredIdsByPhone(PHONE_COLUMN_NAME, filterValue);
    return ContentService.createTextOutput(
      JSON.stringify(filteredIds)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getColumnValues(columnIndex) {
  var range = sheet.getRange(2, columnIndex + 1, sheet.getLastRow() - 1, 1);
  var values = range.getValues();
  return values.map(function (row) {
    return row[0];
  });
}

function getFilteredIdsByPhone(filterColumn, filterValue) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var phoneColumnIndex = headers.indexOf(filterColumn);
  if (phoneColumnIndex === -1) {
    throw new Error("Column not found: " + filterColumn);
  }
  var range = sheet.getRange(
    2,
    1,
    sheet.getLastRow() - 1,
    sheet.getLastColumn()
  );
  var values = range.getValues();
  var cleanFilterValue = removeMask(filterValue);
  var filteredRows = values.filter((row) =>
    removeMask(row[phoneColumnIndex]).includes(cleanFilterValue)
  );
  var filteredIds = filteredRows.map((row) => row[NUMBER_ID_COLUMN_INDEX]);
  filteredIds.sort((a, b) => a - b);
  return filteredIds;
}

function removeMask(phone) {
  return String(phone).replace(/\D/g, "");
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
