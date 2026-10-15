/**
 * DriveUpload.gs - Modul Unggah Gambar ke Google Drive
 */

var DriveUpload = {
  uploadFileToDrive: function(e) {
    try {
      var blob = e.parameters.gambar ? null : null;
      // Mengambil file dari request post multipart
      var fileBlob = e.files ? e.files.gambar : null;
      
      if (!fileBlob) {
        return ""; // Jika tidak ada file yang diunggah
      }
      
      // Nama Folder di Google Drive tempat menyimpan thumbnail
      var folderName = "Thumbnail Artikel Fatayat";
      var folders = DriveApp.getFoldersByName(folderName);
      var folder;
      
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      var file = folder.createFile(fileBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // Mengambil URL direct / konten publik (lh3.googleusercontent format)
      var fileId = file.getId();
      var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
      
      return directUrl;
    } catch (err) {
      console.error("Gagal upload gambar: " + err.toString());
      return "";
    }
  }
};