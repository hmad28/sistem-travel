# Perombakan Manajemen Internal

Acuan: kebutuhan pengguna 7 September 2026 dan implementasi `C:/Projects/jamwisata-v2/src/lib/management`. Daftar kebutuhan bukan klaim fitur yang sudah tersedia. Pertahankan CMS terpisah, bahasa Indonesia, kontrol minimal 44px, warna biru, serta pemeriksaan organisasi dan izin pada server.

## Fondasi yang diterapkan pada tahap pertama

- Pendaftaran empat langkah: paket/jamaah, harga, pembayar, pemeriksaan akhir.
- Harga khusus, diskon per jamaah, biaya tambahan, pilihan Quad/Triple/Double.
- Target DP default Rp5 juta; nominal tagihan pertama terpisah dari harga paket.
- Pembayar dapat disalin dari jamaah; tenggat pelunasan H-30.
- Invoice lanjutan dari rincian pendaftaran, dibatasi harga yang belum ditagihkan, termasuk invoice belum dibayar.
- Snapshot harga, pembayar, kamar, DP, dan tenggat pada invoice baru.
- Piutang dihitung dari harga pendaftaran dikurangi pembayaran, bukan hanya invoice terbit.
- Penguncian transaksi serta identitas permintaan untuk mencegah pendaftaran/invoice ganda.
- Aturan domain komisi baru memenuhi syarat ketika pembayaran bersih melunasi harga; belum terhubung ke modul agen/kas.

Migrasi `0007_open_devos.sql` menambahkan kolom, tidak menghapus transaksi lama. Telah diterapkan dengan `pnpm db:migrate`; jangan reset database Neon bersama. Pendaftaran lama tetap mempertahankan invoice lama.

## Pekerjaan berikutnya (belum selesai)

1. **Jamaah/dokumen:** edit, arsip/aktifkan, detail riwayat; kewarganegaraan/paspor; KTP, KK, alternatif Akta/Buku Nikah/Ijazah; upload privat R2 melalui abstraksi S3 yang tersedia, preview gambar/PDF dan progress. Jangan membuat dokumen identitas publik. Konfigurasi R2 belum dikonfirmasi. Penghapusan perlu menjaga integritas catatan keuangan dan audit.
2. **Booking rombongan:** satu pembayar untuk beberapa jamaah, alokasi harga/diskon individual, edit aman, pembatalan dan refund parsial/penuh. Form tahap pertama masih satu jamaah per pendaftaran. Perubahan jadwal harus memperbarui tenggat operasional tanpa mengubah snapshot dokumen lama.
3. **Kas dan pembayaran:** master rekening, ledger atomik pembayaran/refund/transfer/komisi/saldo awal; pembatalan pembayaran dengan hitung ulang; pengecualian transaksi testing; saldo aktual terpisah dari piutang. Belum ada ledger kas operasional baru pada tahap pertama.
4. **Agen:** tambah/edit/arsip, referral dan lead/UTM, tarif komisi Rp500 ribu/Rp1 juta per jamaah, pencairan setelah lunas; refund setelah pencairan perlu saldo penyesuaian, bukan menghapus histori.
5. **Perlengkapan:** master 10 barang, tambah/edit/arsip/aktifkan, mutasi stok atomik, minimum stok, histori saldo dan larangan saldo negatif sudah diterapkan pada tahap kedua. Distribusi masih mencatat nama penerima pada keterangan; relasi/checklist penyerahan per pendaftaran dan laporan lintas modul belum selesai.
6. **Manifest/kamar:** kapasitas Quad/Triple/Double, pemisahan gender, kamar Makkah/Madinah terpisah, penempatan individual/batch dan ekspor.
7. **Dokumen transaksi:** penomoran berurutan per organisasi, opsi nomor manual, template PNG/canvas asli, preview dan export multipage PDF/PNG, persetujuan visual client. Nomor saat ini masih suffix acak; belum memenuhi target penomoran berurutan.
8. **Ringkasan:** rekening/kas, paket aktif dan pendaftaran, peringatan H-30, dokumen/stok/komisi, pendaftaran terbaru, ulang tahun 0–14 hari dan template WhatsApp yang bisa diubah. Saat ini baru perhitungan piutang yang diperbaiki; jangan tampilkan angka dummy sebagai saldo.
9. **Laporan:** filter lintas modul, kolom pilihan, Excel/print/PDF, piutang, laba realisasi, komisi dan stok yang bersumber dari ledger.
10. **Pengaturan:** identitas, DP/tenggat, penandatangan, rekening invoice, penomoran, import CSV tervalidasi. Pertahankan model izin yang ada; antarmuka admin tunggal tidak berarti menghapus isolasi tenant.
11. **HPP MUHASIB:** port kalkulator dan master Jamwisata, IDR/USD/SAR dan kurs manual, LA/hotel/kamar/FOC, draft/final/duplikasi/arsip, master tambah/edit/hapus, ekspor dan konfirmasi penerapan harga ke CMS.
12. **Analitik CMS:** pertahankan pemisahan dari internal; lengkapi UTM dan konteks WhatsApp publik sesuai kebutuhan baru.

## Verifikasi tahap pertama

Unit test domain: diskon, H-30/leap year, DP vs lunas, refund dan kelayakan komisi, batas invoice. Fixture privat melalui `scripts/verify-booking-flow.ts --create`, jalankan form nyata di browser, lalu `--cleanup`: harga Rp30 juta dikurangi diskon Rp1 juta; invoice DP Rp5 juta lunas; invoice lanjutan Rp24 juta; tenggat 16 Desember 2026 untuk keberangkatan 15 Januari 2027; satu kwitansi otomatis. Data fixture telah dihapus, audit dipertahankan.

Verifikasi ulang tahap pertama pada 8 September 2026 berhasil: lint, typecheck, 40 tes, dan build. Kendala disk penuh sebelumnya sudah teratasi; pengguna memilih tetap bekerja lokal, tanpa VPS. Jangan menyatakan seluruh daftar siap produksi.

## Tahap kedua: perlengkapan

Route `/admin/manajemen/stok` dan `/admin/manajemen/stok/[id]`. Resource izin `inventory` terpisah dan pemeriksaan organisasi pada server. Migrasi `0008_little_the_fury.sql` hanya menambah tabel, indeks, batasan, dan master resource. Tidak mereset data lama. Daftar 10 perlengkapan ditambahkan secara idempoten dengan stok nol; bukan persediaan fiktif.

Riwayat bersifat append-only: stok awal dicatat sebagai masuk, koreksi memakai hasil hitung fisik, dan jumlah sebelum/sesudah disimpan. Barang hanya dapat diarsipkan saat stok nol; riwayat tetap tersedia. Baris stok dikunci saat mutasi, permintaan ulang tidak menggandakan saldo, dan hasil hitung fisik dari formulir kedaluwarsa ditolak.

`pnpm exec tsx scripts/verify-inventory.ts` memeriksa isolasi organisasi, dua pengeluaran serentak, idempotensi, penolakan hasil hitung kedaluwarsa, rekonsiliasi histori dan proteksi barang arsip. Fixture dibersihkan otomatis, audit dipertahankan. Unit test mencakup jumlah nol, pecahan, stok tidak cukup, tanggal dan hasil hitung fisik.

Verifikasi tahap kedua: lint, typecheck, 44 tes, dan build lolos. Browser desktop 1440px dan HP 390px diperiksa: tidak ada overflow halaman dan kontrol utama minimal 44px. Form server menolak penyesuaian tanpa perubahan jumlah. Sepuluh barang awal telah ditambahkan ke organisasi demo dengan stok nol. Belum dipush/deploy. `db:reset` sengaja tidak dijalankan pada Neon bersama; migrasi penambahan tabel telah berhasil diterapkan tanpa menghapus data lama.
