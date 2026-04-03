# Pengaturan Fitur Pengingat SKD

Fitur pengingat SKD dalam aplikasi ini mendukung dua metode pengiriman pesan:

1. **WhatsApp Direct** - Membuka link WhatsApp dengan pesan yang sudah disiapkan
2. **WhatsApp Bot** - Mengirim pesan melalui API WhatsApp Bot

## Perbandingan Metode Pengiriman

| Fitur | WhatsApp Direct | WhatsApp Bot |
|-------|----------------|--------------|
| Kebutuhan setup | Rendah | Tinggi |
| Biaya | Gratis | Berbayar (API) |
| Otomatisasi | Manual send | Otomatis |
| Konfirmasi | Visual | API |
| Butuh smartphone | Ya | Ya |
| Butuh internet | Ya | Ya |
| Delay | Rendah | Rendah |
| Tracking | Tidak | Ya |
| Provider didukung | Semua | Semua |

## Konfigurasi

Untuk mengaktifkan semua fitur pengiriman pesan, atur variabel lingkungan berikut di file `.env`:

### WhatsApp Bot

```
NEXT_PUBLIC_WA_API_URL=https://pasti.databenuanta.id/wa-api
WA_ADMIN_KEY=buselkab-bps-admin
```

- `NEXT_PUBLIC_WA_API_URL`: URL API WhatsApp Bot
- `WA_ADMIN_KEY`: Kunci administrator untuk mengakses API (hanya disimpan di server)

### Jadwal Petugas PST (Fonnte)

```
FONNTE_TOKEN=isi_token_fonnte
FONNTE_API_URL=https://api.fonnte.com/send
SCHEDULE_CRON_SECRET=secret_khusus_cron
```

- `FONNTE_TOKEN`: token API Fonnte untuk pengiriman pesan otomatis jadwal petugas.
- `FONNTE_API_URL`: endpoint API Fonnte (opsional, default `https://api.fonnte.com/send`).
- `SCHEDULE_CRON_SECRET`: secret untuk memanggil endpoint cron `POST /api/schedule/reminders/run` menggunakan header `x-cron-secret`.

Catatan:
- Petugas jadwal PST diambil dari daftar pengguna dengan role `PETUGAS` (bukan dari data terpisah).
- Pastikan nomor WhatsApp setiap akun petugas diisi di menu `Kelola Pengguna`, agar reminder Fonnte dapat terkirim.

## Penggunaan Tiap Metode

### 1. WhatsApp Direct

WhatsApp Direct menggunakan protokol `https://wa.me/` yang membuka WhatsApp secara langsung dengan pesan yang sudah disiapkan. Pengguna masih perlu menekan tombol "Kirim" secara manual.

**Kelebihan WhatsApp Direct:**

- Tidak memerlukan setup server
- Gratis
- Mudah untuk petugas

**Kekurangan WhatsApp Direct:**

- Petugas harus melakukan klik send secara manual
- Tidak ada konfirmasi pengiriman otomatis
- Tidak ada tracking pesan

### 2. WhatsApp Bot

Untuk menggunakan WhatsApp Bot secara penuh, Anda perlu mengatur Cloud API:

1. Daftar di [WhatsApp Business Platform](https://business.whatsapp.com/)
2. Buat aplikasi baru di Meta Developer Dashboard
3. Konfigurasikan nomor bisnis WhatsApp
4. Dapatkan token akses dan ID telepon

**Kelebihan WhatsApp Bot:**

- Otomatis terkirim tanpa intervensi manual
- Ada konfirmasi pengiriman
- Dapat melacak status pesan
- Dilengkapi fallback jika nomor tidak terdaftar di WhatsApp

**Kekurangan WhatsApp Bot:**

- Memerlukan setup tambahan
- Mungkin ada biaya untuk penggunaan API

## Troubleshooting

Jika muncul pesan "Anda perlu mengatur variable di env", pastikan Anda telah mengatur variabel lingkungan yang diperlukan di file `.env` sesuai dengan petunjuk di atas.

Untuk WhatsApp Bot, pastikan layanan API WhatsApp Bot telah berjalan di alamat yang ditentukan dalam variabel `NEXT_PUBLIC_WA_API_URL` dan kunci `WA_ADMIN_KEY` aman di server.
