# 📹 BACKEND: Tag Video Pembelajaran

## 📋 Deskripsi
Backend untuk sistem **Tag Video Pembelajaran** menggunakan Google Apps Script + Google Sheets sebagai database.

---

## 🚀 Cara Setup (Step-by-Step)

### **Langkah 1: Buat Google Sheets Baru**

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik **"+ Blank"** untuk membuat spreadsheet baru
3. Beri nama: **"Video Links Database - BK SMPN 56"**
4. Sheet pertama akan otomatis bernama **"Sheet1"** (biarkan saja)

---

### **Langkah 2: Buka Apps Script Editor**

1. Di menu atas, klik **Extensions** → **Apps Script**
2. Tab baru akan terbuka dengan editor Apps Script
3. Hapus semua kode default yang ada

---

### **Langkah 3: Paste Kode Backend**

1. Copy **SEMUA** kode dari file `apps-script-code.js`
2. Paste ke editor Apps Script
3. Tekan **Ctrl + S** untuk menyimpan

---

### **Langkah 4: Deploy sebagai Web App**

1. Klik tombol **Deploy** (pojok kanan atas)
2. Pilih **New deployment**
3. Klik icon ⚙️ (gear) di sebelah "Select type"
4. Pilih **Web app**
5. Isi konfigurasi:
   - **Description**: `Tag Video Backend v1.0`
   - **Execute as**: `Me (email-anda@gmail.com)` ← **PENTING!**
   - **Who has access**: `Anyone` ← **PENTING!**
6. Klik **Deploy**
7. Klik **Authorize access** (jika diminta)
8. Pilih akun Google Anda
9. Klik **Advanced** → **Go to [project name] (unsafe)**
10. Klik **Allow**

---

### **Langkah 5: Copy URL Deployment**

1. Setelah deploy berhasil, akan muncul URL seperti: