# Panduan Template Pesan SKD (Survei Kebutuhan Data)

## Ringkasan Perbaikan

Masalah yang telah diperbaiki:
- ✅ Template sekarang benar-benar tersimpan dan digunakan
- ✅ Backend otomatis fetch dan interpolate template dari database
- ✅ Frontend selalu fetch template terbaru saat preview dimulai
- ✅ Variabel otomatis diganti dengan data visitor dan tanggal kunjungan

## Variabel yang Tersedia

Template mendukung 3 variabel dinamis yang otomatis diganti:

| Variabel | Keterangan | Contoh |
|----------|-----------|--------|
| `{nama}` | Nama pengunjung | Ahmad Putra |
| `{link}` | Link survei SKD | s.bps.go.id/skd2025_bpsbusel |
| `{tanggal}` | Tanggal kunjungan (dengan hari) | Selasa, 8 April 2026 |

## Contoh Template Profesional

### ✨ Template 1: Formal & Ringkas (Rekomendasi)
```
Halo {nama}, terima kasih telah mengunjungi PST BPS Kabupaten Bulungan. 

Mohon isi Survei Kebutuhan Data (SKD) melalui: {link}

Waktu isi: sebelum {tanggal}

Terima kasih atas partisipasi Anda.
```

**Kelebihan**: Formal, jelas, ringkas, mudah dipahami

---

### 📋 Template 2: Detail & Informatif
```
{nama}, kami ucapkan terima kasih atas kunjungan Anda ke PST BPS Kabupaten Bulungan pada {tanggal}.

Untuk melengkapi layanan, kami meminta kesediaan Anda mengisi Survei Kebutuhan Data (SKD) BPS melalui tautan berikut: {link}

Waktu pengisian: Diusahakan sebelum 7 hari ke depan.

Pertanyaan? Hubungi kami di loket informasi.
```

**Kelebihan**: Detail, profesional, memberikan konteks lengkap

---

### 🎯 Template 3: Persuasif & Cepat
```
Halo {nama} 👋

Bantu kami dengan isi SKD: {link}

Waktu: Sebelum {tanggal}

Terima kasih! 🙏
```

**Kelebihan**: Singkat, persuasif, mudah dibaca di WhatsApp

---

### 🏢 Template 4: Resmi & Komprehensif
```
Assalamu'alaikum {nama},

Sehubungan dengan kunjungan Anda ke Pelayanan Terpadu (PST) BPS Kabupaten Bulungan pada {tanggal}, kami dengan hormat mengharapkan kesediaan Anda untuk:

Mengisi Survei Kebutuhan Data (SKD) melalui: {link}

Waktu paling lambat: {tanggal} + 7 hari

Data Anda sangat membantu pembangunan layanan yang lebih baik.

Wassalamu'alaikum warahmatullahi wabarakatuh.
```

**Kelebihan**: Sangat formal, komprehensif, cocok untuk institusi

---

## Best Practices untuk Template Anda

1. ✅ **Selalu sertakan 2-3 informasi penting**:
   - Nama pengunjung
   - Link survei
   - Deadline atau batas waktu

2. ✅ **Gunakan bahasa formal tapi ramah**:
   - Hindari slang atau singkatan (kecuali umum)
   - Gunakan "kami" daripada "saya"
   - Ucapkan terima kasih

3. ✅ **Optimalkan untuk WhatsApp**:
   - Hindari terlalu panjang (preferensi: < 160 karakter)
   - Gunakan line break untuk readability
   - Jangan gunakan emoji berlebihan (maksimal 1-2)

4. ❌ **Hindari**:
   - Variabel yang tidak ada (hanya gunakan {nama}, {link}, {tanggal})
   - Link hardcoded (gunakan {link} agar otomatis)
   - Tanggal hardcoded (gunakan {tanggal} agar dinamis)

## Mitigasi untuk Perubahan Link SKD

### Masalah
Link survei SKD (`{link}`) bisa berubah sewaktu-waktu. Jika hardcoded, semua template harus di-edit ulang.

### Solusi yang Sudah Diimplementasi ✅

#### 1. **Variabel Dinamis `{link}`**
Gunakan placeholder `{link}` di template. Backend otomatis ganti dengan link dari:
```
NEXT_PUBLIC_SKD_LINK environment variable
```

**File konfigurasi**: `.env.local` atau `.env.production`
```env
NEXT_PUBLIC_SKD_LINK=s.bps.go.id/skd2025_bpsbusel
```

Jika variable tidak ada, fallback otomatis ke: `s.bps.go.id/skd2025_bpsbusel`

#### 2. **Cara Update Link Tanpa Edit Template**

**Skenario**: Link survey berubah menjadi `s.bps.go.id/skd2026_bpsbusel`

**Langkah**:
1. Update file `.env.production` atau sistem environment
2. Deploy ulang aplikasi (atau muat ulang config)
3. Semua template otomatis menggunakan link baru!
4. **Tidak perlu edit setiap template**

**Code yang menghandle ini:**
```typescript
// Backend: src/api/modules/queues/queue.actions.ts
const interpolateSkdTemplate = (template: string, visitorName: string, createdAt: Date) => {
  const skdLink = process.env.NEXT_PUBLIC_SKD_LINK ?? "s.bps.go.id/skd2025_bpsbusel";
  return template.replace(/{link}/g, skdLink);
};
```

#### 3. **Alternatif: Simpan Link di Database** (Jika perlu lebih fleksibel)

Jika ingin update link tanpa deploy:

1. Tambah tabel `SkdConfig`:
```sql
CREATE TABLE SkdConfig (
  id TEXT PRIMARY KEY,
  skdLink TEXT NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Update `interpolateSkdTemplate` untuk fetch dari DB:
```typescript
const interpolateSkdTemplate = async (template: string, visitorName: string, createdAt: Date) => {
  const config = await prisma.skdConfig.findUnique({ where: { id: "default" } });
  const skdLink = config?.skdLink ?? process.env.NEXT_PUBLIC_SKD_LINK ?? "default-link";
  return template.replace(/{link}/g, skdLink);
};
```

3. Buat admin panel untuk update link tanpa deploy

#### 4. **QR Code Alternative**

Selain URL text, bisa juga generate QR code:
- Misalkan: `{qrcode}` placeholder untuk QR code
- Backend generate QR code dan kirim sebagai image/attachment

---

## Testing Template

### Manual Test
1. Buka halaman Buku Tamu
2. Klik "Kirim Pengingat" untuk satu entry
3. Dialog preview berisi template baru dengan data yang sudah di-interpolate
4. Kirim reminder dan verifikasi di WhatsApp

### Test Template dengan Berbagai Nama
- Nama panjang: "Muhammad Rizky Al-Fattah Syaiful"
- Nama nama: "Ahmad"
- Nama spesial: "Siti Nur'aini"

### Verifikasi Link
- Pastikan `{link}` diganti dengan link dari env variable
- Cek URL sudah correct di WhatsApp link yang di-generate

---

## FAQ

**Q: Mengapa template saya tidak berubah saat saya edit?**  
A: Setelah save, tunggu hingga dialog ditutup. Buka preview untuk entry baru - backend akan fetch template terbaru dari database.

**Q: Bisakah saya punya template berbeda untuk setiap purpose (layanan)?**  
A: Build selanjutnya bisa menambah fitur ini. Sekarang hanya ada 1 master template.

**Q: Apa terjadi jika saya tidak set environment variable NEXT_PUBLIC_SKD_LINK?**  
A: Sistem fallback ke `s.bps.go.id/skd2025_bpsbusel` secara otomatis.

**Q: Bisakah saya preview template tanpa mengirim?**  
A: Ya, dialog preview menampilkan template yang sudah di-interpolate. Anda bisa klik "Tutup" tanpa mengirim.

---

## Contact & Support

Jika ada pertanyaan tentang template SKD atau mitigasi link:
- Buka issue di repo
- Hubungi tim development
