# PASTI 6502

Sistem antrean digital Pelayanan Statistik Terpadu (PST) BPS Kabupaten Bulungan.

## Project Overview

PASTI mengelola alur layanan pengunjung dari scan QR hingga antrean selesai, dengan dashboard petugas, tampilan antrean publik, buku tamu digital, dan analitik layanan.

Fitur utama:
- Buku tamu dan antrean berbasis QR
- Dashboard petugas untuk proses antrean
- Manajemen layanan dan pengguna
- Tampilan antrean publik (TV/monitor)
- Statistik dan ekspor analitik
- Notifikasi antrean dan reminder (opsional WhatsApp/Fonnte)

## Tech Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Prisma + MySQL
- NextAuth
- Bun

## Frontend Architecture (Refactored)

Refactor frontend saat ini menggunakan pendekatan domain-first:
- `src/app` hanya untuk route, server boundary, dan composition page
- `src/features` untuk logic UI per domain
- `src/components/ui` untuk UI primitive reusable
- `src/components/shared` untuk komponen lintas fitur (layout, feedback, dialogs)
- `src/services/api` untuk API client typed
- `src/shared` untuk types/schemas/constants lintas backend-frontend

### Folder Structure

```text
src
|-- app
|   |-- (public)
|   |-- (protected)
|   `-- api
|-- api
|-- components
|   |-- auth
|   |-- shared
|   |   |-- dialogs
|   |   |-- feedback
|   |   `-- layout
|   |-- theme
|   `-- ui
|-- constants
|-- features
|   |-- dashboard
|   |   |-- components
|   |   |   |-- layout
|   |   |   |-- rows
|   |   |   `-- skeletons
|   |   |-- constants
|   |   `-- screens
|   |-- guest
|   |-- notifications
|   |-- queue-display
|   `-- visitor-form
|-- hooks
|-- lib
|-- services
|-- shared
|-- styles
`-- tests
```

## Module Guide

- `features/dashboard`: layar internal petugas/admin (queue, users, services, analytics, QR, schedule, guestbook)
- `features/guest`: halaman buku tamu dan status antrean pengunjung
- `features/visitor-form`: alur form antrean dari QR
- `features/queue-display`: public queue display real-time
- `features/notifications`: dropdown notifikasi dashboard

## Setup

### 1) Prerequisites

- Bun 1.2.14 (wajib)
- MySQL 8+
- Git
- Docker + Docker Compose (opsional)

### 2) Installation

```bash
git clone <repo-url>
cd pasti-6502
bun install
```

Gunakan Bun saja untuk semua perintah dependency dan script (`bun install`, `bun run`, `bunx`).

### 3) Environment Variables

Buat `.env` di root project.

Variabel inti:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_STATIC_UUID`

Variabel opsional:
- `NEXT_PUBLIC_QR_BASE_URL`
- `NEXT_PUBLIC_WA_API_URL`
- `WA_ADMIN_KEY`
- `FONNTE_TOKEN`
- `SCHEDULE_CRON_SECRET`
- `ANALYTICS_EXPORT_MAX_ROWS`
- `SIGAP_BASE_URL`
- `SIGAP_LOGIN_PATH`
- `SIGAP_CONTACTS_PATH`
- `SIGAP_USERNAME`
- `SIGAP_PASSWORD`

Contoh minimal:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/pasti_db"
NEXTAUTH_SECRET="ganti_dengan_string_acak"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_STATIC_UUID="uuid_statis_qr"
```

### 4) Database

```bash
bunx prisma migrate dev
bunx prisma generate
bun run db:seed
```

### 5) Run

```bash
bun run dev
```

Akses `http://localhost:3000`.

## Scripts

- `bun run dev` - jalankan dev server
- `bun run build` - build production
- `bun run start` - start server production
- `bun run lint` - lint codebase
- `bun run typecheck` - validasi TypeScript
- `bun run test` - jalankan unit tests
- `bun run db:seed` - seed data development
- `bun run db:studio` - Prisma Studio

## Coding Conventions

- Gunakan naming `kebab-case` untuk file/folder frontend
- Simpan logic domain di `features/<domain>`
- Gunakan `components/ui` hanya untuk primitive UI
- Gunakan `components/shared` untuk reusable pattern lintas fitur
- Simpan API call di `services/api` (jangan fetch mentah tersebar di UI)
- Semua perubahan harus lolos:
  - `bun run typecheck`
  - `bun run lint`
  - `bun run test`

## Notes

- Seed hanya untuk development
- Integrasi WhatsApp/Fonnte bersifat opsional
- Footer aplikasi otomatis menampilkan rentang tahun dinamis (`2025-current year`)

## Credit

Pengembangan melanjutkan inovasi dari proyek antrean PST sebelumnya:  
https://github.com/Jstfire/bbbb-antrean
