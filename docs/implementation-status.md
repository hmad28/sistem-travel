# Status implementasi — 7 September 2026

Dokumen ini membedakan pekerjaan yang teruji dari permintaan yang belum selesai. Bukan pernyataan siap produksi.

## Sudah diimplementasikan

- Editor tambah/ubah paket, deskripsi, harga, durasi, fasilitas, persyaratan, itinerary, foto UploadThing, status publikasi.
- Form tambah/ubah keberangkatan dengan pilihan paket, tanggal, kuota, dan status buka/draf/tutup; perubahan kuota tidak boleh di bawah kursi terpakai, paket terkunci setelah ada pendaftaran.
- Pendaftaran jamaah yang sudah tercatat ke keberangkatan; memesan kursi dan membuat invoice dalam satu transaksi.
- Pembayaran cicilan dengan pemeriksaan sisa tagihan dan kunci idempotensi; kwitansi tersimpan otomatis.
- Daftar pendaftaran dan kwitansi, pencarian dan ekspor data yang tampil.
- Koleksi CMS banner, artikel, halaman informasi, galeri, cerita jamaah, dan FAQ; draf/publikasi; halaman publik membaca konten terbit.
- Editor teks beranda per bagian dengan draf terpisah dari publikasi dan pemeriksaan versi sebelum menyimpan.
- CMS media: gambar banner khusus HP, urutan tampil, tautan YouTube/Shorts untuk video jamaah, pratinjau gambar dan lepas gambar. Penyimpanan koleksi memeriksa versi entri agar edit lama tidak menimpa perubahan baru.
- Pemutar video jamaah memakai tampilan vertikal dan baru memuat YouTube setelah pengunjung menekan Putar. Konten lama tetap terbaca tanpa migrasi.
- Primary biru disamakan pada internal/CMS/logo; latar login hijau diganti biru gelap.

## Bukti pemeriksaan

- Uji browser menambahkan paket draf berlabel UJI INTERNAL, keberangkatan, jamaah uji, registrasi, lalu pembayaran cicilan.
- Pembacaan database memastikan invoice Rp25 juta, pembayaran Rp5 juta, sisa Rp20 juta, status PARTIAL, tepat satu kwitansi. Seluruh fixture operasional ini dibersihkan; audit dipertahankan.
- Uji draf beranda dan FAQ: respons publik 200 dan teks uji tidak muncul di respons publik.
- Uji browser editor jadwal: data lama termuat, kuota 1 ditolak karena di bawah kursi terpakai, muat ulang tetap menunjukkan kuota 45. Daftar menunjukkan 42/45, 28/45 dan 50/90, bukan menjumlahkan reservasi dan konfirmasi dua kali.
- Unit test mencakup validasi tanggal, kursi pecahan, nominal pembayaran, pemisahan draf/publikasi dan whitelist field beranda.

## Belum selesai — jangan dipasarkan sebagai tersedia

- Clone Tazkia seluruh halaman secara presisi. Homepage lama masih fallback bila tidak ada banner CMS; urutan seluruh bagian sumber belum direplikasi.
- Memindahkan semua modul Jam Wisata: room list/manifest, kas/pengeluaran, agen/komisi/referral, stok/distribusi, laporan terpadu dan cetak dokumen resmi.
- Pembatalan/pemindahan registrasi dan pelepasan kursi, refund/reversal, verifikasi dokumen lengkap.
- Editor CMS semua teks di halaman kategori/detail/kontak/footer, SEO per halaman, upload video langsung selain tautan YouTube.
- Form pendaftaran publik serta keputusan konfirmasi kursi oleh admin; belum ada jawaban atas pilihan alur ini.
- QA multi-role, race-condition integration tests, pengujian upload nyata, dan full mobile visual pass terbaru.

## Referensi yang harus diikuti

- `C:/Projects/jamwisata-v2/src/components/admin/AdminSidebar.tsx`
- `C:/Projects/jamwisata-v2/src/components/admin/PackageForm.tsx`
- `C:/Projects/jamwisata-v2/src/components/admin/ManagementForms.tsx`
- `C:/Projects/jamwisata-v2/src/lib/management/modules.ts`
- `C:/Projects/jamwisata-v2/src/lib/management/actions.ts`
- Blueprint pengguna dan https://www.tazkiatravel.com/.

Homepage Tazkia yang diperiksa memakai carousel banner raster penuh (desktop 1440×900 di bawah header 100px), lalu statistik, empat layanan, promo, dua program khusus, rekomendasi, edukasi, sosial, testimoni, ulasan, FAQ, kontak, mitra, footer. Jangan kembali mengganti ini dengan hero teks generik dan menyebutnya clone.
