export type PstSchedulePdfValidationItem = {
  rule: string;
  status: "OK" | "WARNING" | "ERROR";
  detail: string;
};

export type PstSchedulePdfWeekRow = {
  week: number;
  dateIso: string;
  dayName: string;
  dateLabel: string;
  pstOfficer: string;
  wfoRandomOfficer: string;
  wfoFixedOfficer: string;
  note: string;
  isHoliday: boolean;
  hasIssue: boolean;
};

export type PstSchedulePdfFairnessOfficerRow = {
  name: string;
  poolPstLabel: string;
  statusWfoFriday: string;
  pstCurrentMonth: string;
  pstFridayCurrentMonth: string;
  randomWfoFridayCurrentMonth: string;
  fixedWfoFridayCurrentMonth: string;
  fridayRandomBurdenCurrentMonth: string;
  totalOperationalPresence: string;
  previousMonthFridayBurden: string;
  totalCurrentMonthForRandomFairness: string;
  previousMonthRandomTotal: string;
  historyWindowFridayBurden: string;
  historyWindowTotalRandomAssignments: string;
  cumulativeRandomFairnessTotal: string;
  fairnessStatus: string;
  nextPriorityRole: string;
  priorityReason: string;
  lastRandomAssignedDate: string;
};

export type PstSchedulePdfViewModel = {
  title: string;
  monthYearLabel: string;
  generatedAtLabel: string;
  generatedByLabel: string;
  documentVersionLabel: string;
  revisionCodeLabel: string;
  documentStatusLabel: string;
  changeNotes: string;
  executiveSummaryRows: Array<{ label: string; value: string }>;
  validations: PstSchedulePdfValidationItem[];
  weekRows: PstSchedulePdfWeekRow[];
  selectedOfficerNames: string[];
  unselectedOfficerNames: string[];
  priorityOfficerNames: string[];
  priorityPstNames?: string[];
  priorityWfoRandomNames?: string[];
  priorityFridayBurdenNames?: string[];
  priorityRandomTotalNames?: string[];
  poolSummaryRows?: Array<{ pool: string; meaning: string; officers: string }>;
  fairnessNote: string;
  fairnessSummaryRows: Array<{ label: string; value: string }>;
  fairnessOfficerRows: PstSchedulePdfFairnessOfficerRow[];
  historyWindowColumnLabel: string;
  previousMonthColumnLabel: string;
  rules: string[];
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderSummaryRows = (rows: PstSchedulePdfViewModel["executiveSummaryRows"]) =>
  rows
    .map(
      (row) =>
        `<tr><td class="label">${escapeHtml(row.label)}</td><td class="value">${escapeHtml(row.value)}</td></tr>`
    )
    .join("");

const renderWeekRows = (rows: PstSchedulePdfWeekRow[]) =>
  rows
    .map((row) => {
      const rowClass = row.isHoliday ? "holiday" : row.hasIssue ? "issue" : "";
      return `<tr class="${rowClass}">
  <td>${escapeHtml(row.dayName)}</td>
  <td>${escapeHtml(row.dateLabel)}</td>
  <td>${escapeHtml(row.pstOfficer)}</td>
  <td>${escapeHtml(row.wfoRandomOfficer)}</td>
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
    p { margin: 6px 0 0 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    table.schedule { table-layout: fixed; }
    th, td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: top; }
    th { background: #e5e7eb; text-align: left; }
    .section { margin-top: 18px; }
    .meta td.label { width: 220px; color: #4b5563; font-weight: 600; }
    .meta td.value { font-weight: 700; }
    .status-ok { color: #065f46; font-weight: 700; }
    .status-warning { color: #92400e; font-weight: 700; }
    .status-error { color: #991b1b; font-weight: 700; }
    .holiday td { background: #f3f4f6; }
    .issue td { background: #fff7ed; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    ol { margin: 6px 0 0 20px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(view.title)}</h1>
  <p>Generate: ${escapeHtml(view.generatedAtLabel)}</p>

  <div class="section">
    <h2>Ringkasan</h2>
    <table class="meta">
      <tbody>
        ${renderSummaryRows(view.executiveSummaryRows)}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Tabel Jadwal</h2>
    <table class="schedule">
      <colgroup>
        <col style="width:12%" />
        <col style="width:14%" />
        <col style="width:24%" />
        <col style="width:20%" />
        <col style="width:30%" />
      </colgroup>
      <thead>
        <tr>
          <th>Hari</th>
          <th>Tanggal</th>
          <th>Petugas PST</th>
          <th>Petugas WFO Jumat</th>
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
    <h3>Prioritas PST Bulan Berikutnya</h3>
    ${renderNameList(view.priorityPstNames ?? [], "Tidak ada prioritas PST")}
    <h3>Prioritas WFO Jumat Random Bulan Berikutnya</h3>
    ${renderNameList(view.priorityWfoRandomNames ?? [], "Tidak ada prioritas WFO Jumat random")}
    <h3>Prioritas Beban Jumat Bulan Berikutnya</h3>
    ${renderNameList(view.priorityFridayBurdenNames ?? [], "Tidak ada prioritas beban Jumat")}
    <h3>Prioritas Beban Random Total Bulan Berikutnya</h3>
    ${renderNameList(view.priorityRandomTotalNames ?? view.priorityOfficerNames, "Tidak ada prioritas beban random")}
  </div>
</body>
</html>
`;
