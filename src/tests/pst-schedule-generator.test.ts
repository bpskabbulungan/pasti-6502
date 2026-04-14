import assert from "node:assert/strict";
import test from "node:test";
import { PstOfficerEmploymentStatus, PstSlotRole } from "@prisma/client";
import { buildWorkingSlots, pickCandidateWeightedRandom, scoreCandidate } from "@api/modules/pst";

test("buildWorkingSlots skips holiday and cuti bersama weekdays", () => {
  const result = buildWorkingSlots(5, 2026, {
    calendar: {
      LIBURAN: ["01-05-2026", "14-05-2026"],
      CUTI_BERSAMA: ["15-05-2026"],
    },
  });

  const slotDates = new Set(result.slots.map((slot) => slot.dateIso));

  assert.equal(slotDates.has("2026-05-01"), false);
  assert.equal(slotDates.has("2026-05-14"), false);
  assert.equal(slotDates.has("2026-05-15"), false);

  const fridaySlots = result.slots.filter((slot) => slot.weekday === 5);
  assert.equal(fridaySlots.every((slot) => slot.role === PstSlotRole.PST || slot.role === PstSlotRole.WFO), true);
  assert.equal(result.holidays.length >= 3, true);
});

test("scoreCandidate penalizes dense assignment history", () => {
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

  const lowLoadScore = scoreCandidate(candidate, slot, {
    monthlyAssignmentCount: 0,
    fridayRoleCount: 0,
    totalHistoryCount: 0,
    lastAssignedAt: null,
  });

  const highLoadScore = scoreCandidate(candidate, slot, {
    monthlyAssignmentCount: 3,
    fridayRoleCount: 2,
    totalHistoryCount: 8,
    lastAssignedAt: new Date("2026-05-19T00:00:00.000Z"),
  });

  assert.equal(lowLoadScore > highLoadScore, true);
});

test("pickCandidateWeightedRandom handles empty and non-empty candidates", () => {
  assert.equal(pickCandidateWeightedRandom([]), null);

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
    },
  ]);

  assert.equal(Boolean(picked), true);
  assert.equal(picked?.candidate.id, "officer-1");
});
