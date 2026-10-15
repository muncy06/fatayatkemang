/**
 * Code.gs - Router Utama REST API Google Apps Script
 * PAC Fatayat NU Kecamatan Kemang
 */

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'berita') {
    return CrudHandler.getAllBerita();
  } else if (action === 'galeri') {
    return CrudHandler.getAllGaleri();
  } else {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Aksi GET tidak valid." }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var action = e.parameter.action;
  
  try {
    if (action === 'login') {
      return AuthHandler.verifyLogin(e.parameter.username, e.parameter.password);
    } 
    else if (action === 'tambahArtikel') {
      return CrudHandler.tambahArtikel(e);
    } 
    else if (action === 'editArtikel') {
      return CrudHandler.editArtikel(e);
    } 
    else if (action === 'hapusArtikel') {
      return CrudHandler.hapusArtikel(e.parameter.id, e.parameter.token);
    } 
    else {
      // Default: Jika dari form kontak publik
      return CrudHandler.simpanPesanKontak(e);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}