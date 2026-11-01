/**
 * ================================================================
 * BACKEND: TAG VIDEO PEMBELAJARAN - Google Apps Script
 * ================================================================
 * Sistem: Auto-sync link video dari HTML frontend ke Google Sheets
 * Prefix: vtag_ (terpisah dari Administrasi BK56)
 * Sheet Name: VideoLinks
 * ================================================================
 */

// ===== KONFIGURASI =====
const SHEET_NAME = 'VideoLinks';
const HEADERS = ['ID', 'Timestamp', 'Tag', 'JudulVideo', 'URL', 'Keterangan'];

/**
 * Handle GET request - Ambil semua data link video
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createResponse({
        success: true,
        data: [],
        count: 0,
        message: 'Belum ada data link video'
      });
    }
    
    const headers = data[0];
    const rows = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      rows.push(row);
    }
    
    return createResponse({
      success: true,
      data: rows,
      count: rows.length,
      message: 'Data berhasil diambil'
    });
    
  } catch (error) {
    return createResponse({
      success: false,
      message: 'Error: ' + error.message
    });
  }
}

/**
 * Handle POST request - Tambah/Hapus link video
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheet = getOrCreateSheet();
    
    // ===== ACTION: ADD =====
    if (action === 'add') {
      const id = 'VT' + new Date().getTime();
      const timestamp = new Date().toISOString();
      const tag = payload.tag || '-';
      const judul = payload.judul || 'Video';
      const url = payload.url || '';
      const keterangan = payload.keterangan || '';
      
      if (!url) {
        return createResponse({
          success: false,
          message: 'URL wajib diisi'
        });
      }
      
      sheet.appendRow([id, timestamp, tag, judul, url, keterangan]);
      
      return createResponse({
        success: true,
        id: id,
        message: 'Link video berhasil ditambahkan'
      });
    }
    
    // ===== ACTION: DELETE BY ID =====
    if (action === 'delete') {
      const id = payload.id;
      if (!id) {
        return createResponse({
          success: false,
          message: 'ID wajib diisi'
        });
      }
      
      const data = sheet.getDataRange().getValues();
      let deleted = false;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      
      return createResponse({
        success: deleted,
        message: deleted ? 'Link berhasil dihapus' : 'ID tidak ditemukan'
      });
    }
    
    // ===== ACTION: DELETE BY URL =====
    if (action === 'deleteByUrl') {
      const url = payload.url;
      if (!url) {
        return createResponse({
          success: false,
          message: 'URL wajib diisi'
        });
      }
      
      const data = sheet.getDataRange().getValues();
      let deleted = false;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][4] === url) {
          sheet.deleteRow(i + 1);
          deleted = true;
          break;
        }
      }
      
      return createResponse({
        success: deleted,
        message: deleted ? 'Link berhasil dihapus' : 'URL tidak ditemukan'
      });
    }
    
    // ===== ACTION: CLEAR ALL =====
    if (action === 'clear') {
      sheet.clear();
      sheet.appendRow(HEADERS);
      formatHeader(sheet);
      
      return createResponse({
        success: true,
        message: 'Semua data berhasil dihapus'
      });
    }
    
    // ===== ACTION: BULK ADD =====
    if (action === 'bulkAdd') {
      const links = payload.links || [];
      if (!Array.isArray(links) || links.length === 0) {
        return createResponse({
          success: false,
          message: 'Array links wajib diisi'
        });
      }
      
      let added = 0;
      const existingUrls = getExistingUrls(sheet);
      
      links.forEach(link => {
        if (!existingUrls.has(link.url)) {
          const id = 'VT' + new Date().getTime() + Math.random().toString(36).substr(2, 5);
          const timestamp = new Date().toISOString();
          sheet.appendRow([
            id,
            timestamp,
            link.tag || '-',
            link.judul || 'Video',
            link.url,
            link.keterangan || ''
          ]);
          existingUrls.add(link.url);
          added++;
        }
      });
      
      return createResponse({
        success: true,
        added: added,
        message: added + ' link berhasil ditambahkan'
      });
    }
    
    return createResponse({
      success: false,
      message: 'Action tidak dikenali: ' + action
    });
    
  } catch (error) {
    return createResponse({
      success: false,
      message: 'Error: ' + error.message
    });
  }
}

/**
 * Helper: Buat atau ambil sheet VideoLinks
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    formatHeader(sheet);
    sheet.setFrozenRows(1);
    
    // Set lebar kolom
    sheet.setColumnWidth(1, 150); // ID
    sheet.setColumnWidth(2, 180); // Timestamp
    sheet.setColumnWidth(3, 120); // Tag
    sheet.setColumnWidth(4, 200); // JudulVideo
    sheet.setColumnWidth(5, 300); // URL
    sheet.setColumnWidth(6, 200); // Keterangan
  }
  
  return sheet;
}

/**
 * Helper: Format header sheet
 */
function formatHeader(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#a855f7');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setBorder(true, true, true, true, true, true);
}

/**
 * Helper: Ambil semua URL yang sudah ada (untuk cek duplikat)
 */
function getExistingUrls(sheet) {
  const data = sheet.getDataRange().getValues();
  const urls = new Set();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][4]) {
      urls.add(data[i][4]);
    }
  }
  
  return urls;
}

/**
 * Helper: Buat response JSON
 */
function createResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ===== FUNGSI TEST (untuk debugging) =====
 */
function testGet() {
  const result = doGet({});
  Logger.log(result.getContent());
}

function testAdd() {
  const payload = {
    action: 'add',
    tag: 'mengenal-diri',
    judul: 'Video Mengenal Diri',
    url: 'https://www.youtube.com/watch?v=example',
    keterangan: 'Video pengenalan diri untuk siswa'
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(payload)
    }
  };
  
  const result = doPost(e);
  Logger.log(result.getContent());
}

function testDelete() {
  const payload = {
    action: 'deleteByUrl',
    url: 'https://www.youtube.com/watch?v=example'
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(payload)
    }
  };
  
  const result = doPost(e);
  Logger.log(result.getContent());
}

function testBulkAdd() {
  const payload = {
    action: 'bulkAdd',
    links: [
      {
        tag: 'teknik-belajar',
        judul: 'Teknik Belajar Efektif',
        url: 'https://www.youtube.com/watch?v=example1',
        keterangan: 'Video teknik belajar'
      },
      {
        tag: 'mengelola-emosi',
        judul: 'Mengelola Emosi',
        url: 'https://www.youtube.com/watch?v=example2',
        keterangan: 'Video manajemen emosi'
      }
    ]
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(payload)
    }
  };
  
  const result = doPost(e);
  Logger.log(result.getContent());
}

/**
 * ===== FUNGSI UTILITAS =====
 */

/**
 * Export semua data ke CSV (untuk backup)
 */
function exportToCSV() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  let csv = '';
  data.forEach(row => {
    csv += row.map(cell => {
      const str = String(cell || '');
      return '"' + str.replace(/"/g, '""') + '"';
    }).join(',') + '\n';
  });
  
  const blob = Utilities.newBlob(csv, 'text/csv', 'video-links-backup-' + new Date().toISOString().slice(0, 10) + '.csv');
  DriveApp.createFile(blob);
  
  Logger.log('✅ CSV berhasil di-export ke Google Drive');
}

/**
 * Hitung statistik link per tag
 */
function getStatsByTag() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  const stats = {};
  
  for (let i = 1; i < data.length; i++) {
    const tag = data[i][2];
    if (!stats[tag]) {
      stats[tag] = 0;
    }
    stats[tag]++;
  }
  
  Logger.log('📊 Statistik per tag:');
  for (const tag in stats) {
    Logger.log('  ' + tag + ': ' + stats[tag] + ' link');
  }
  
  return stats;
}

/**
 * Cleanup: Hapus duplikat URL
 */
function removeDuplicates() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  const seenUrls = new Set();
  const rowsToDelete = [];
  
  for (let i = data.length - 1; i >= 1; i--) {
    const url = data[i][4];
    if (seenUrls.has(url)) {
      rowsToDelete.push(i + 1);
    } else {
      seenUrls.add(url);
    }
  }
  
  rowsToDelete.forEach(rowNum => {
    sheet.deleteRow(rowNum);
  });
  
  Logger.log('✅ ' + rowsToDelete.length + ' duplikat berhasil dihapus');
}