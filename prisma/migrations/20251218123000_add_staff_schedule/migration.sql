-- Add QueueStatus value
ALTER TYPE "QueueStatus" ADD VALUE IF NOT EXISTS 'CALLED';

-- CreateEnum
CREATE TYPE "DutyCycleStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutyCycle" (
    "id" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "status" "DutyCycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "staffOrder" JSONB NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DutyCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutySchedule" (
    "id" TEXT NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "staffId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DutySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DutySchedule_scheduleDate_key" ON "DutySchedule"("scheduleDate");

-- CreateIndex
CREATE INDEX "DutySchedule_staffId_idx" ON "DutySchedule"("staffId");

-- CreateIndex
CREATE INDEX "DutySchedule_cycleId_idx" ON "DutySchedule"("cycleId");

-- AddForeignKey
ALTER TABLE "DutySchedule" ADD CONSTRAINT "DutySchedule_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutySchedule" ADD CONSTRAINT "DutySchedule_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "DutyCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
