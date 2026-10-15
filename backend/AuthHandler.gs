/**
 * AuthHandler.gs - Modul Verifikasi Login & Sesi Admin
 */

var AuthHandler = {
  verifyLogin: function(username, password) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Admin");
    
    if (!sheet) {
      return this.jsonResponse({ status: "error", message: "Sheet Admin tidak ditemukan di Spreadsheet." });
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Cari indeks kolom
    var idxUser = headers.indexOf("username");
    var idxPass = headers.indexOf("password_hash");
    var idxNama = headers.indexOf("nama_lengkap");
    var idxToken = headers.indexOf("token_sesi");
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idxUser]) === String(username)) {
        // Validasi password sederhana (bisa ditingkatkan dengan enkripsi hash jika diperlukan)
        if (String(data[i][idxPass]) === String(password)) {
          var tokenBaru = "TOKEN_" + Utilities.getUuid();
          sheet.getRange(i + 1, idxToken + 1).setValue(tokenBaru);
          
          return this.jsonResponse({
            status: "success",
            data: {
              username: username,
              nama_lengkap: data[i][idxNama],
              token_sesi: tokenBaru
            }
          });
        }
      }
    }
    
    return this.jsonResponse({ status: "error", message: "Username atau password salah." });
  },

  validateToken: function(token) {
    if (!token) return false;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Admin");
    if (!sheet) return false;
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idxToken = headers.indexOf("token_sesi");
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idxToken]) === String(token)) {
        return true;
      }
    }
    return false;
  },

  jsonResponse: function(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
                         .setMimeType(ContentService.MimeType.JSON);
  }
};