# Pelayanan Statistik Terpadu Terintegrasi (PASTI)

Pasti adalah sistem antrean digital untuk Pelayanan Statistik Terpadu BPS Kabupaten Bulungan. Pengunjung bisa datang langsung ke PST BPS Kabupaten Bulungan kemudian melalukan scan pada kode QR mengisi buku tamu dan kemudian mendapatkan nomor antrian, petugas PST memantau dari dashboard, dan antrean ditampilkan di layar publik. Proyek ini mengembangkan inovasi dari proyek [Sistem Antrean PST](https://github.com/Jstfire/bbbb-antrean) (Muhammad Mahbubbillah - BPS Kabupaten Buton Selatan).

## Ringkasan Fitur

- Antrean online via QR dan antrean walk-in/buku tamu, nomor ulang setiap hari.
- Dashboard petugas: pantau antrean, mulai/selesai/batalkan, atur layanan dan pengguna.
- Layar antrean publik untuk TV/monitor; QR bisa diunduh dari dashboard.
- Notifikasi antrean baru dan pengingat SKD via WA Bot (opsional).
- Statistik antrean harian, sebaran layanan, kinerja petugas, ekspor CSV/JSON.
- Dibangun dengan Next.js, React, Tailwind, Prisma, PostgreSQL, NextAuth, Bun.

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Catatan Penting](#catatan-penting)
- [Quickstart](#quickstart)
- [Instalasi (Detail)](#instalasi-detail)
- [Kredit](#kredit)

## Prasyarat

- Bun 1.1.x atau Node.js 18+ (disarankan Bun sesuai Dockerfile)
- PostgreSQL 15+ (bisa lokal atau via docker compose)
- Git, Docker, dan docker compose (jika ingin jalan dengan kontainer)

## Catatan Penting

- Buat `.env` sendiri; contoh hanya panduan, bukan untuk produksi.
- Perintah seed (`bun run db:seed` atau via docker compose) hanya untuk development; tidak aktif di `NODE_ENV=production`.
- Wajib gunakan nilai unik untuk `NEXTAUTH_SECRET` dan `NEXT_PUBLIC_STATIC_UUID`.
- WA Bot opsional; jika `NEXT_PUBLIC_WA_API_URL` atau `WA_ADMIN_KEY` kosong, pengingat SKD tidak dijalankan.
- Jika memakai docker compose, port default 3001 (host) -> 3000 (container); ubah `NEXTAUTH_URL` jika mapping berbeda.

## Quickstart

1. Clone repo lalu masuk: `git clone <url> && cd pasti-6502`
2. Salin `.env.example` ke `.env`, isi koneksi database dan secret.
3. Instal dependensi: `bun install`
4. Migrasi + generate Prisma: `bunx prisma migrate dev --name init && bunx prisma generate`
5. Isi data contoh (akun, layanan, QR): `bun run db:seed`
6. Jalankan dev server: `bun run dev` lalu buka `http://localhost:3000`

## Instalasi (Detail)

### 1) Konfigurasi Lingkungan

Isi `.env` dengan nilai aman. Contoh minimal:

```env
DATABASE_URL="postgresql://USER:PASSWORD@pasti_db:5432/pasti_db"
NEXTAUTH_SECRET="ganti_dengan_string_acak"
NEXTAUTH_URL="http://localhost:3000"        # jika docker compose (3001:3000), gunakan http://localhost:3001
NEXT_PUBLIC_STATIC_UUID="uuid_statis_qr"
NEXT_PUBLIC_WA_API_URL="https://example.com/wa-api"  # opsional
WA_ADMIN_KEY="server_only_admin_key"                 # opsional, jangan diawali NEXT_PUBLIC
# Opsi seed dev
# SEED_ADMIN_USERNAME="admin"
# SEED_ADMIN_PASSWORD="password_dev"
# SEED_OPERATOR_USERNAME="petugas"
# SEED_OPERATOR_PASSWORD="password_dev"
```

`NEXT_PUBLIC_STATIC_UUID` dipakai untuk QR statis; perintah seed membuat `public/qrcodes/pst-qrcode.png` yang mengarah ke `/visitor-form/<UUID>`.

### 2) Mode Lokal (Bun)

- Pastikan PostgreSQL aktif dan `DATABASE_URL` sudah benar.
- Jalankan:

```bash
bun install
bunx prisma migrate dev
bunx prisma generate
bun run db:seed   # boleh dilewati di produksi
bun run dev       # akses http://localhost:3000
```

### 3) Mode Docker Compose

- Pastikan `.env` sudah diisi.
- Build dan jalankan:

```bash
docker compose up -d --build
```

- App: host `3001` -> container `3000` (ubah `NEXTAUTH_URL` jika port beda).
- DB: service `pasti_db` (lihat user/pass default di `docker-compose.yml`).
- Deploy migrasi (wajib) dan seed dev (opsional):

```bash
docker compose exec pasti bunx prisma migrate deploy
docker compose exec pasti bun run db:seed    # hanya di dev
```

- Untuk mengaktifkan WA Bot, buka komentar service `wa-bot` dan set `ADMIN_KEY` sesuai.

## Kredit

Pengembangan dari proyek antrean BPS Kabupaten Buru Selatan: [bbbb-antrean](https://github.com/Jstfire/bbbb-antrean) (Muhammad Mahbubbillah). Terima kasih kepada kontributor awal dan tim PST BPS Bulungan.
