export type PstSchedulePdfValidationItem = {
  rule: string;
  passed: boolean;
  detail: string;
};

export type PstSchedulePdfWeekRow = {
  week: number;
  dayName: string;
  dateLabel: string;
  pstOfficer: string;
  wfoOfficer: string;
  note: string;
  isHoliday: boolean;
  hasIssue: boolean;
};

export type PstSchedulePdfViewModel = {
  title: string;
  monthYearLabel: string;
  generatedAtLabel: string;
  generatedByLabel: string;
  infoRows: Array<{ label: string; value: string }>;
  validations: PstSchedulePdfValidationItem[];
  weekRows: PstSchedulePdfWeekRow[];
  selectedOfficerNames: string[];
  unselectedOfficerNames: string[];
  fairnessNote: string;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderInfoRows = (rows: PstSchedulePdfViewModel["infoRows"]) =>
  rows
    .map(
      (row) =>
        `<tr><td class="label">${escapeHtml(row.label)}</td><td class="value">${escapeHtml(row.value)}</td></tr>`
    )
    .join("");

const renderValidationRows = (rows: PstSchedulePdfValidationItem[]) =>
  rows
    .map((row) => {
      const statusLabel = row.passed ? "OK" : "PERLU TINDAKAN";
      const statusClass = row.passed ? "status-ok" : "status-issue";
      return `<tr>
  <td>${escapeHtml(row.rule)}</td>
  <td class="${statusClass}">${statusLabel}</td>
  <td>${escapeHtml(row.detail)}</td>
</tr>`;
    })
    .join("");

const renderWeekRows = (rows: PstSchedulePdfWeekRow[]) =>
  rows
    .map((row) => {
      const rowClass = row.isHoliday ? "holiday" : row.hasIssue ? "issue" : "";
      return `<tr class="${rowClass}">
  <td>${row.week}</td>
  <td>${escapeHtml(row.dayName)}</td>
  <td>${escapeHtml(row.dateLabel)}</td>
  <td>${escapeHtml(row.pstOfficer)}</td>
  <td>${escapeHtml(row.wfoOfficer)}</td>
  <td>${escapeHtml(row.note)}</td>
</tr>`;
    })
    .join("");

const renderNameList = (names: string[], emptyText: string) =>
  names.length > 0
    ? `<ol>${names.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ol>`
    : `<p>${escapeHtml(emptyText)}</p>`;

export const buildPstSchedulePdfHtmlTemplate = (view: PstSchedulePdfViewModel) => `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(view.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111827; margin: 20px; }
    h1, h2, h3 { margin: 0; }
    .subtitle { margin: 6px 0 14px 0; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: top; }
    th { background: #e5e7eb; text-align: left; }
    .meta { margin-bottom: 14px; }
    .meta td.label { width: 190px; color: #4b5563; font-weight: 600; }
    .meta td.value { font-weight: 700; }
    .status-ok { color: #065f46; font-weight: 700; }
    .status-issue { color: #991b1b; font-weight: 700; }
    .holiday td { background: #f3f4f6; }
    .issue td { background: #fff1f2; }
    .section { margin-top: 18px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    ol { margin: 6px 0 0 20px; }
    p { margin: 6px 0 0 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(view.title)}</h1>
  <p class="subtitle">Bulan/Tahun: ${escapeHtml(view.monthYearLabel)} | Generate: ${escapeHtml(view.generatedAtLabel)} | Oleh: ${escapeHtml(view.generatedByLabel)}</p>

  <table class="meta">
    <tbody>
      ${renderInfoRows(view.infoRows)}
    </tbody>
  </table>

  <div class="section">
    <h2>Validasi Otomatis</h2>
    <table>
      <thead>
        <tr>
          <th>Rule</th>
          <th>Status</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        ${renderValidationRows(view.validations)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Kalender Jadwal Per Minggu</h2>
    <table>
      <thead>
        <tr>
          <th>Minggu</th>
          <th>Hari</th>
          <th>Tanggal</th>
          <th>Petugas PST</th>
          <th>Petugas WFO</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        ${renderWeekRows(view.weekRows)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Ringkasan Petugas</h2>
    <div class="two-col">
      <div>
        <h3>Petugas Terpilih</h3>
        ${renderNameList(view.selectedOfficerNames, "Tidak ada petugas terpilih")}
      </div>
      <div>
        <h3>Petugas Belum Terpilih</h3>
        ${renderNameList(view.unselectedOfficerNames, "Semua petugas aktif sudah terpilih")}
      </div>
    </div>
    <p><strong>Catatan fairness:</strong> ${escapeHtml(view.fairnessNote)}</p>
  </div>
</body>
</html>
`;
