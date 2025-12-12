-- Align queueNumber type with Prisma schema (integer per-day numbering)
ALTER TABLE "Queue"
ALTER COLUMN "queueNumber" TYPE INTEGER USING ("queueNumber"::integer);

ALTER TABLE "Queue"
ALTER COLUMN "queueNumber" SET NOT NULL;
