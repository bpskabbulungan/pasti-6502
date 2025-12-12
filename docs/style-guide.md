# Style & Copy Guide

## Language
- UI copy: Bahasa Indonesia, consistent terminology (Antrean, Layanan, Pengunjung, Petugas, SKD).
- Technical/admin terms: English allowed in code, but surface strings stay Bahasa.
- Error/success messages: keep short, actionable, and polite. Avoid mixing languages in one sentence.

## Tone
- Friendly, clear, non-formal bureaucratic tone.
- Use active voice; prefer verbs: “Perbarui data”, “Simpan perubahan”.
- Avoid jargon; use the same term across UI, API, and DB (Antrean/Queue, not “Ticket”).

## Components
- Buttons: sentence case, concise labels (e.g., “Perbarui data”, “Muat lagi”). Primary actions first.
- Forms: always show label + helper or placeholder; include aria-label for icon-only controls.
- Status chips: use consistent colors (Online = blue, Offline = green, Error = red/accent).
- Spacing: base 4px grid; section padding 16–24px; card radius uses `--radius`.

## Accessibility
- Icon-only buttons must have `aria-label` and focus-visible ring (uses `--focus-ring`).
- Don’t convey meaning by color alone; add text or icon.
- Live-updated text blocks should set `aria-live="polite"` when appropriate.

## Data Presentation
- Dates in `id-ID`, 24h time; codes use uppercase prefixes (P/K/R/L) with padded numbers.
- Show units on metrics (menit, orang).
- Loading: skeletons or spinners; empty states with guidance.

## Writing Patterns
- Success: “Berhasil <aksi>.” / “Data diperbarui.”
- Error: “Gagal <aksi>. Coba lagi.”; if validation, mention field: “Nomor HP tidak valid.”
- Actions: use verbs, avoid “OK/Yes/No”; prefer “Simpan”, “Batalkan”, “Lanjutkan”.
