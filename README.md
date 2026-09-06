<p align="center">
  <img src="public/brand/hammad-tour-mark.svg" alt="Hammad Tour" width="112" />
</p>

# Hammad Tour OS

Website publik, CMS, dan sistem operasional multi-tenant untuk travel Umrah dan Haji Indonesia. Antarmukanya menggunakan bahasa tugas yang sederhana, tombol besar, alur bertahap, format Rupiah, tanggal Indonesia, dan kebiasaan kerja WhatsApp/Excel agar nyaman dipakai tim yang baru digitalisasi.

Fondasi proyek berasal dari ForgeStart (MIT) dan sudah disesuaikan dengan Travel Umroh OS technical blueprint. Identitas produk publik adalah **Hammad Tour**, dengan atribusi **Powered by Hammad Studio**.

## Yang sudah tersedia

- Website publik dengan paket dan keberangkatan dari database.
- Dashboard tugas harian berbasis data organisasi aktif.
- Data jamaah dan pendaftaran, paket, keberangkatan, dokumen, invoice, pembayaran, serta kwitansi.
- Form tambah jamaah yang ringkas, validasi nomor Indonesia, ID otomatis, dan audit log.
- Auth.js v5, organisasi multi-tenant, role/permission, undangan, dan log keamanan.
- UploadThing untuk gambar CMS dan dokumen jamaah privat.
- Neon HTTP untuk query baca serverless dan pooled PostgreSQL untuk transaksi.
- Drizzle migrations dan demo seed Hammad Tour (3 paket, 120 jamaah, dokumen dan invoice).
- Vitest, React Testing Library, dan Playwright.

## Stack

Next.js 16, React 19, TypeScript strict, PostgreSQL/Neon, Drizzle ORM, Auth.js v5, Tailwind CSS 4, shadcn-style UI, next-intl, TanStack Query/Table, React Hook Form, Recharts, UploadThing, Resend, Vitest, dan Playwright. Package manager yang didukung adalah pnpm 10.

## Menjalankan lokal

Persyaratan: Node.js 22+, pnpm melalui Corepack, dan PostgreSQL. Neon direkomendasikan; Docker PostgreSQL dapat dipakai untuk lingkungan lokal terpisah.

```bash
corepack enable
pnpm install
pnpm setup
pnpm db:migrate
pnpm db:seed:demo
pnpm dev
```

`pnpm setup` membuat `.env.local`, `AUTH_SECRET`, serta password super admin acak. Simpan password yang dicetak di terminal. Jalankan `pnpm setup --force` hanya bila memang ingin membuat ulang konfigurasi lokal.

Jika memakai Docker Desktop:

```bash
pnpm dev:docker
```

## Variabel lingkungan

Nilai wajib:

```env
AUTH_SECRET=<minimal 32 karakter>
AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...
SUPER_ADMIN_EMAIL=admin@hammadtour.id
SUPER_ADMIN_PASSWORD=<password aman>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Untuk Neon, isi `DATABASE_URL` dengan URL direct/serverless dan `DATABASE_URL_POOLED` dengan URL pooled. Integrasi produksi tambahan:

```env
UPLOADTHING_TOKEN=...
EMAIL_PROVIDER=resend
EMAIL_FROM=Hammad Tour <noreply@domain-anda.id>
RESEND_API_KEY=...
```

Lihat [.env.example](.env.example) untuk seluruh opsi. Kredensial lokal disimpan di `.env.local` yang diabaikan Git. Rahasia produksi harus disimpan sebagai environment variables di Vercel, bukan dikomit.

## Database

```bash
pnpm db:generate     # buat migration setelah schema berubah
pnpm db:migrate      # terapkan migration tanpa menghapus data
pnpm db:seed         # seed akun, RBAC, setting, organisasi
pnpm db:seed:demo    # tambah data demo Hammad Tour secara idempoten
pnpm db:verify:demo  # cek jumlah data inti pada database aktif
pnpm db:reset        # hapus schema lokal, migrate, lalu seed ulang
pnpm db:studio
```

`pnpm db:reset` bersifat destruktif dan hanya untuk database pengembangan. Schema berada di `db/schema/`; Drizzle adalah satu-satunya lapisan database.

## Verifikasi

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Atau jalankan semuanya dengan `pnpm verify`. Untuk perubahan database, jalankan juga `pnpm db:reset` terhadap PostgreSQL pengembangan.

## Deploy ke Vercel

1. Buat proyek Neon dan pasang semua environment variables di Vercel.
2. Jalankan `pnpm db:migrate` dan `pnpm db:seed` dari lingkungan aman.
3. Gunakan build command `pnpm build` dan deploy.
4. Tambahkan `UPLOADTHING_TOKEN` untuk upload serta kredensial Resend untuk email nyata.

Aplikasi tidak membutuhkan server Socket.IO persisten; route aplikasi berjalan sesuai model serverless Vercel.

## Struktur utama

```text
app/                  halaman, route handler, dan server action
components/           komponen aplikasi dan primitive UI
db/schema/            schema PostgreSQL per tabel
drizzle/              migration SQL yang dikomit
i18n/                 routing dan konfigurasi locale
messages/             pesan antarmuka Indonesia dan Inggris
lib/auth/             session, permission, dan konteks tenant
lib/travel/           query dan format domain travel
lib/storage/          upload dan provider penyimpanan
tests/                unit/component dan Playwright e2e
```

Aturan arsitektur dan kontribusi lengkap ada di [AGENTS.md](AGENTS.md).
