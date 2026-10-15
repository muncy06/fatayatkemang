/**
 * CrudHandler.gs - Modul Operasi Database Artikel & Kontak
 */

var CrudHandler = {
  getAllBerita: function() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Artikel");
    if (!sheet) return this.jsonResponse([]);
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      result.push(obj);
    }
    
    return this.jsonResponse(result);
  },

  getAllGaleri: function() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Galeri");
    if (!sheet) return this.jsonResponse([]);
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      result.push(obj);
    }
    
    return this.jsonResponse(result);
  },

  tambahArtikel: function(e) {
    var token = e.parameter.token;
    if (!AuthHandler.validateToken(token)) {
      return this.jsonResponse({ status: "error", message: "Sesi tidak valid atau kadaluarsa." });
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Artikel");
    
    var id = "ART_" + Date.now();
    var tanggal = new Date();
    var judul = e.parameter.judul;
    var kategori = e.parameter.kategori;
    var penulis = e.parameter.penulis;
    var isi = e.parameter.isi;
    var cuplikan = isi.substring(0, 150) + "...";
    
    // Unggah gambar jika ada
    var urlGambar = DriveUpload.uploadFileToDrive(e);
    
    sheet.appendRow([id, tanggal, judul, kategori, isi, cuplikan, urlGambar, penulis, "Publish"]);
    
    return this.jsonResponse({ status: "success", message: "Artikel berhasil ditambahkan." });
  },

  editArtikel: function(e) {
    var token = e.parameter.token;
    if (!AuthHandler.validateToken(token)) {
      return this.jsonResponse({ status: "error", message: "Sesi tidak valid." });
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Artikel");
    var data = sheet.getDataRange().getValues();
    var idTarget = String(e.parameter.id);
    
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === idTarget) {
        var row = i + 1;
        sheet.getRange(row, 3).setValue(e.parameter.judul);     // Judul
        sheet.getRange(row, 4).setValue(e.parameter.kategori);  // Kategori
        sheet.getRange(row, 5).setValue(e.parameter.isi);       // Isi Konten
        sheet.getRange(row, 6).setValue(e.parameter.isi.substring(0, 150) + "..."); // Cuplikan
        sheet.getRange(row, 8).setValue(e.parameter.penulis);   // Penulis
        
        // Jika ada upload gambar baru
        var urlBaru = DriveUpload.uploadFileToDrive(e);
        if (urlBaru) {
          sheet.getRange(row, 7).setValue(urlBaru); // URL Gambar
        }
        
        return this.jsonResponse({ status: "success", message: "Artikel berhasil diperbarui." });
      }
    }
    
    return this.jsonResponse({ status: "error", message: "Artikel tidak ditemukan." });
  },

  simpanPesanKontak: function(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Pesan_Kontak");
    if (!sheet) {
      sheet = ss.insertSheet("Pesan_Kontak");
      sheet.appendRow(["Timestamp", "Nama", "No_WA", "Pesan"]);
    }
    
    sheet.appendRow([new Date(), e.parameter.nama, e.parameter.no_wa, e.parameter.pesan]);
    return this.jsonResponse({ status: "success", message: "Pesan berhasil dikirim." });
  },

  jsonResponse: function(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
                         .setMimeType(ContentService.MimeType.JSON);
  }
};