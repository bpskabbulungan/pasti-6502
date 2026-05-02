import { generateAndStorePstSchedulePdf, getMonthlyScheduleById } from "../../src/api/modules/pst";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

(async () => {
  const scheduleId = "2c4671c4-1aa1-44fd-a142-5b39e73f753e";
  const schedule = await getMonthlyScheduleById(scheduleId);
  if (!schedule) {
    console.error("SCHEDULE_NOT_FOUND", scheduleId);
    process.exit(1);
  }
  const pdf = await generateAndStorePstSchedulePdf({ schedule, generatedByName: "Codex Audit" });
  if (!pdf.ok) {
    console.error("PDF_FAILED", JSON.stringify(pdf, null, 2));
    process.exit(2);
  }
  const outDir = path.join(process.cwd(), "tmp", "audit");
  await mkdir(outDir, { recursive: true });
  const pdfMetaPath = path.join(outDir, "schedule-2026-05-pdf-meta.json");
  await writeFile(pdfMetaPath, JSON.stringify(pdf.metadata, null, 2), "utf-8");
  console.log(JSON.stringify({ ok: true, pdfMetaPath, metadata: pdf.metadata }, null, 2));
})();
