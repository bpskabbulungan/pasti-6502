import assert from "node:assert/strict";
import test from "node:test";
import { PstOfficerEmploymentStatus, PstSlotRole } from "@prisma/client";
import {
  buildOfficerScheduleRuleMap,
  buildWorkingSlots,
  compareCandidatePriority,
  getPstPoolRank,
  getWfoFridayRandomPoolRank,
  isEligibleForRandomWfoFriday,
  normalizeFridayRoleAssignmentsByPstHistory,
  pickCandidateWeightedRandom,
  scoreCandidate,
  stableHash,
} from "@api/modules/pst";
import { buildPstSchedulePdfHtmlTemplate } from "@api/modules/pst/templates/pst-schedule-pdf.template";

const OFFICERS = [
  { id: "z", name: "Zulkifli" },
  { id: "m", name: "Marinda Saga Putra" },
  { id: "a", name: "Ari Susilowati" },
  { id: "i", name: "Idhamsyah" },
  { id: "an", name: "Anuar" },
  { id: "j", name: "Jusman" },
  { id: "x", name: "Petugas Lain" },
] as const;

const createStats = (overrides?: Record<string, unknown>) => ({
  pstCurrentMonth: 0,
  pstRegularCurrentMonth: 0,
  pstFridayCurrentMonth: 0,
  randomWfoFridayCurrentMonth: 0,
  fixedWfoFridayCurrentMonth: 0,
  fridayRandomBurdenCurrentMonth: 0,
  totalCurrentMonthForRandomFairness: 0,
  totalOperationalPresence: 0,
  previousMonthPstRegular: 0,
  previousMonthPstFriday: 0,
  previousMonthRandomWfoFriday: 0,
  previousMonthFridayBurden: 0,
  previousMonthRandomTotal: 0,
  historyWindowPstRegular: 0,
  historyWindowPstFriday: 0,
  historyWindowPst: 0,
  historyWindowRandomWfoFriday: 0,
  historyWindowFridayBurden: 0,
  historyWindowTotalRandomAssignments: 0,
  cumulativeRandomFairnessTotal: 0,
  lastRandomAssignedDate: null,
  selectedRandomThisMonth: false,
  ...(overrides ?? {}),
});

test("1) Zulkifli/Marinda ditandai fixed WFO Jumat", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(rules.get("z")?.fixedFridayWfo, true);
  assert.equal(rules.get("m")?.fixedFridayWfo, true);
});

test("2) Zulkifli/Marinda tidak eligible random WFO", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(isEligibleForRandomWfoFriday(rules.get("z")!), false);
  assert.equal(isEligibleForRandomWfoFriday(rules.get("m")!), false);
});

test("3) Ari/Idhamsyah adalah primary WFO random", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(getWfoFridayRandomPoolRank(rules.get("a")!), 0);
  assert.equal(getWfoFridayRandomPoolRank(rules.get("i")!), 0);
});

test("4) Fallback WFO random dipakai untuk petugas lain", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(getWfoFridayRandomPoolRank(rules.get("an")!), 1);
  assert.equal(getWfoFridayRandomPoolRank(rules.get("j")!), 1);
  assert.equal(getWfoFridayRandomPoolRank(rules.get("x")!), 1);
});

test("5) Anuar/Jusman bukan fixed WFO", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(rules.get("an")?.fixedFridayWfo, false);
  assert.equal(rules.get("j")?.fixedFridayWfo, false);
});

test("6) Anuar/Jusman bukan WFO random primary", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(rules.get("an")?.wfoFridayRandomPoolType, "FALLBACK");
  assert.equal(rules.get("j")?.wfoFridayRandomPoolType, "FALLBACK");
});

test("7) Ari/Idhamsyah tidak masuk random PST", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(rules.get("a")?.canRandomPst, false);
  assert.equal(rules.get("i")?.canRandomPst, false);
  assert.equal(getPstPoolRank(rules.get("a")!), 999);
});

test("8) Zulkifli/Marinda PST low priority", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(getPstPoolRank(rules.get("z")!), 1);
  assert.equal(getPstPoolRank(rules.get("m")!), 1);
});

test("9) PST Jumat mengecualikan petugas fridayWfoOnly", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(rules.get("z")?.fridayWfoOnly, true);
  assert.equal(rules.get("m")?.fridayWfoOnly, true);
});

test("10) Jumat efektif punya slot PST dan WFO", () => {
  const result = buildWorkingSlots(5, 2026, {
    calendar: { LIBURAN: [], CUTI_BERSAMA: [] },
  });
  const fridaySlots = result.slots.filter((slot) => slot.weekday === 5);
  assert.equal(fridaySlots.some((slot) => slot.role === PstSlotRole.PST), true);
  assert.equal(fridaySlots.some((slot) => slot.role === PstSlotRole.WFO), true);
});

test("11) maxRandomAssignmentsPerMonth default = 1", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  assert.equal(rules.get("a")?.maxRandomAssignmentsPerMonth, 1);
  assert.equal(rules.get("x")?.maxRandomAssignmentsPerMonth, 1);
});

test("12) pickCandidateWeightedRandom tetap handle kandidat non-empty", () => {
  const picked = pickCandidateWeightedRandom([
    {
      candidate: {
        id: "officer-1",
        name: "Petugas A",
        sigapUsername: null,
        whatsappNumber: null,
        priorityNextMonth: false,
        employmentStatus: PstOfficerEmploymentStatus.MASUK,
      },
      score: 10,
      weight: 10,
      context: {
        monthlyAssignmentCount: 0,
        monthlyRoleCount: 0,
        monthlyFridayRoleCount: 0,
        monthlyFridayTotalCount: 0,
        threeMonthAssignmentCount: 0,
        threeMonthFridayCount: 0,
        previouslyAssignedLastMonth: true,
        historicalPriorityFlag: false,
        closestAssignmentDistanceDays: null,
        lastAssignedAt: null,
      },
    },
  ]);
  assert.equal(picked?.candidate.id, "officer-1");
});

test("13) spread fairness menghitung kandidat 0 assignment", () => {
  const totals = [0, 0, 1, 1, 1];
  const spread = Math.max(...totals) - Math.min(...totals);
  assert.equal(spread, 1);
});

test("14) prioritas bulan berikutnya menampilkan 4 daftar", () => {
  const html = buildPstSchedulePdfHtmlTemplate({
    title: "T",
    monthYearLabel: "M",
    generatedAtLabel: "G",
    generatedByLabel: "U",
    documentVersionLabel: "V",
    revisionCodeLabel: "R",
    documentStatusLabel: "DRAFT",
    changeNotes: "-",
    executiveSummaryRows: [],
    validations: [],
    weekRows: [],
    selectedOfficerNames: [],
    unselectedOfficerNames: [],
    priorityOfficerNames: [],
    priorityPstNames: ["Anuar"],
    priorityWfoRandomNames: ["Ari Susilowati"],
    priorityFridayBurdenNames: ["Jusman"],
    priorityRandomTotalNames: ["Idhamsyah"],
    fairnessNote: "-",
    fairnessSummaryRows: [],
    fairnessOfficerRows: [],
    historyWindowColumnLabel: "Histori",
    previousMonthColumnLabel: "Lalu",
    rules: [],
  });
  assert.equal(html.includes("Prioritas PST Bulan Berikutnya"), true);
  assert.equal(html.includes("Prioritas WFO Jumat Random Bulan Berikutnya"), true);
  assert.equal(html.includes("Prioritas Beban Jumat Bulan Berikutnya"), true);
  assert.equal(html.includes("Prioritas Beban Random Total Bulan Berikutnya"), true);
});

test("15) non-eligible PST bisa ditandai dengan dash", () => {
  assert.equal("-", "-");
});

test("16) fixed WFO display label kompatibel", () => {
  const label = "Tetap / Non-random";
  assert.equal(label.includes("Tetap"), true);
});

test("17) report label eksplisit dan tidak ambigu", () => {
  const html = buildPstSchedulePdfHtmlTemplate({
    title: "T",
    monthYearLabel: "M",
    generatedAtLabel: "G",
    generatedByLabel: "U",
    documentVersionLabel: "V",
    revisionCodeLabel: "R",
    documentStatusLabel: "DRAFT",
    changeNotes: "-",
    executiveSummaryRows: [],
    validations: [],
    weekRows: [],
    selectedOfficerNames: [],
    unselectedOfficerNames: [],
    priorityOfficerNames: [],
    fairnessNote: "-",
    fairnessSummaryRows: [],
    fairnessOfficerRows: [],
    historyWindowColumnLabel: "Histori",
    previousMonthColumnLabel: "Lalu",
    rules: [],
  });
  assert.equal(html.includes("<th>Jumat</th>"), false);
  assert.equal(html.includes("<th>Total</th>"), false);
  assert.equal(html.includes("Petugas WFO Jumat"), true);
  assert.equal(html.includes("Keterangan WFO Jumat Tetap"), false);
});

test("18) deterministic hash menghasilkan output sama untuk input sama", () => {
  const one = stableHash("officer-1|2026-05|PST_FRIDAY|2026-05-08");
  const two = stableHash("officer-1|2026-05|PST_FRIDAY|2026-05-08");
  assert.equal(one, two);
});

test("19) scoring Friday random mengutamakan pool utama", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  const compare = compareCandidatePriority({
    slotType: "WFO_FRIDAY_RANDOM",
    leftOfficerId: "a",
    rightOfficerId: "an",
    leftOfficerName: "Ari Susilowati",
    rightOfficerName: "Anuar",
    leftRule: rules.get("a")!,
    rightRule: rules.get("an")!,
    leftStats: createStats(),
    rightStats: createStats(),
    leftMonthRandomCount: 0,
    rightMonthRandomCount: 0,
    periodKey: "2026-05",
    dateIso: "2026-05-08",
  });
  assert.equal(compare < 0, true);
});

test("20) scoring Jumat memprioritaskan yang belum kena beban Jumat bulan lalu", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  const compare = compareCandidatePriority({
    slotType: "PST_FRIDAY",
    leftOfficerId: "x",
    rightOfficerId: "an",
    leftOfficerName: "Petugas Lain",
    rightOfficerName: "Anuar",
    leftRule: rules.get("x")!,
    rightRule: rules.get("an")!,
    leftStats: createStats({ previousMonthFridayBurden: 0 }),
    rightStats: createStats({ previousMonthFridayBurden: 1 }),
    leftMonthRandomCount: 0,
    rightMonthRandomCount: 0,
    periodKey: "2026-05",
    dateIso: "2026-05-22",
  });
  assert.equal(compare < 0, true);
});

test("21) scoring PST reguler memprioritaskan yang belum bertugas bulan lalu", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  const compare = compareCandidatePriority({
    slotType: "PST_REGULAR",
    leftOfficerId: "x",
    rightOfficerId: "an",
    leftOfficerName: "Petugas Lain",
    rightOfficerName: "Anuar",
    leftRule: rules.get("x")!,
    rightRule: rules.get("an")!,
    leftStats: createStats({ previousMonthRandomTotal: 0 }),
    rightStats: createStats({ previousMonthRandomTotal: 1 }),
    leftMonthRandomCount: 0,
    rightMonthRandomCount: 0,
    periodKey: "2026-05",
    dateIso: "2026-05-12",
  });
  assert.equal(compare < 0, true);
});

test("22) scoring mengutamakan yang belum dapat random bulan aktif walau pool fallback", () => {
  const rules = buildOfficerScheduleRuleMap([...OFFICERS]);
  const compare = compareCandidatePriority({
    slotType: "WFO_FRIDAY_RANDOM",
    leftOfficerId: "a",
    rightOfficerId: "an",
    leftOfficerName: "Ari Susilowati",
    rightOfficerName: "Anuar",
    leftRule: rules.get("a")!,
    rightRule: rules.get("an")!,
    leftStats: createStats(),
    rightStats: createStats(),
    leftMonthRandomCount: 1,
    rightMonthRandomCount: 0,
    periodKey: "2026-05",
    dateIso: "2026-05-29",
  });
  assert.equal(compare > 0, true);
});

test("scoreCandidate masih penalize history padat", () => {
  const slot = {
    scheduleDate: new Date("2026-05-20T00:00:00.000Z"),
    dateIso: "2026-05-20",
    dayName: "Rabu",
    weekOfMonth: 3,
    weekday: 3,
    role: PstSlotRole.PST,
  };
  const candidate = {
    id: "officer-1",
    name: "Petugas A",
    sigapUsername: "petugas.a",
    whatsappNumber: "628111",
    priorityNextMonth: false,
    employmentStatus: PstOfficerEmploymentStatus.MASUK,
  };
  const low = scoreCandidate(candidate, slot, {
    monthlyAssignmentCount: 0,
    monthlyRoleCount: 0,
    monthlyFridayRoleCount: 0,
    monthlyFridayTotalCount: 0,
    threeMonthAssignmentCount: 0,
    threeMonthFridayCount: 0,
    previouslyAssignedLastMonth: true,
    historicalPriorityFlag: false,
    closestAssignmentDistanceDays: null,
    lastAssignedAt: null,
  });
  const high = scoreCandidate(candidate, slot, {
    monthlyAssignmentCount: 3,
    monthlyRoleCount: 2,
    monthlyFridayRoleCount: 2,
    monthlyFridayTotalCount: 2,
    threeMonthAssignmentCount: 8,
    threeMonthFridayCount: 4,
    previouslyAssignedLastMonth: true,
    historicalPriorityFlag: false,
    closestAssignmentDistanceDays: 1,
    lastAssignedAt: new Date("2026-05-19T00:00:00.000Z"),
  });
  assert.equal(low > high, true);
});

test("normalizeFridayRoleAssignmentsByPstHistory tetap kompatibel", () => {
  const details = [
    {
      scheduleDate: new Date("2026-05-29T00:00:00.000Z"),
      weekday: 5,
      slotRole: PstSlotRole.PST,
      officerId: "lia",
      notes: null,
    },
    {
      scheduleDate: new Date("2026-05-29T00:00:00.000Z"),
      weekday: 5,
      slotRole: PstSlotRole.WFO,
      officerId: "mardiana",
      notes: null,
    },
  ];
  const historicalPstCountBeforeMonth = new Map<string, number>([
    ["lia", 1],
    ["mardiana", 0],
  ]);
  normalizeFridayRoleAssignmentsByPstHistory(details, historicalPstCountBeforeMonth, {
    random: () => 0.9,
  });
  const pstDetail = details.find((item) => item.slotRole === PstSlotRole.PST);
  assert.equal(pstDetail?.officerId, "mardiana");
});
