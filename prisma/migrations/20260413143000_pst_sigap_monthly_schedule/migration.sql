-- CreateTable
CREATE TABLE `PstOfficerCandidate` (
    `id` VARCHAR(191) NOT NULL,
    `sigapContactId` VARCHAR(191) NOT NULL,
    `sigapUsername` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `whatsappNumber` VARCHAR(191) NULL,
    `employmentStatus` ENUM('MASUK', 'CUTI', 'SAKIT', 'DINAS', 'NONAKTIF', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `sourceStatusRaw` VARCHAR(191) NULL,
    `isActiveCandidate` BOOLEAN NOT NULL DEFAULT true,
    `syncStatus` ENUM('SYNCED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'SYNCED',
    `syncMessage` VARCHAR(191) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `priorityNextMonth` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PstOfficerCandidate_sigapContactId_key`(`sigapContactId`),
    INDEX `PstOfficerCandidate_isActiveCandidate_employmentStatus_idx`(`isActiveCandidate`, `employmentStatus`),
    INDEX `PstOfficerCandidate_sigapUsername_idx`(`sigapUsername`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SigapSyncLog` (
    `id` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `success` BOOLEAN NOT NULL DEFAULT false,
    `result` ENUM('SUCCESS', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'FAILED',
    `totalFetched` INTEGER NOT NULL DEFAULT 0,
    `totalProcessed` INTEGER NOT NULL DEFAULT 0,
    `totalSaved` INTEGER NOT NULL DEFAULT 0,
    `totalFailed` INTEGER NOT NULL DEFAULT 0,
    `totalDuplicates` INTEGER NOT NULL DEFAULT 0,
    `message` VARCHAR(191) NULL,
    `errorDetail` VARCHAR(191) NULL,
    `rawSummary` JSON NULL,
    `triggeredById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SigapSyncLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthlySchedule` (
    `id` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `generatedById` VARCHAR(191) NULL,
    `holidayCalendar` JSON NOT NULL,
    `summary` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MonthlySchedule_month_year_key`(`month`, `year`),
    INDEX `MonthlySchedule_year_month_idx`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleDetail` (
    `id` VARCHAR(191) NOT NULL,
    `monthlyScheduleId` VARCHAR(191) NOT NULL,
    `scheduleDate` DATETIME(3) NOT NULL,
    `weekOfMonth` INTEGER NOT NULL,
    `weekday` INTEGER NOT NULL,
    `slotRole` ENUM('PST', 'WFO') NOT NULL,
    `status` ENUM('ASSIGNED', 'UNASSIGNED', 'SWAPPED', 'REPLACED') NOT NULL DEFAULT 'ASSIGNED',
    `officerId` VARCHAR(191) NULL,
    `isHoliday` BOOLEAN NOT NULL DEFAULT false,
    `holidayName` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ScheduleDetail_monthlyScheduleId_scheduleDate_slotRole_key`(`monthlyScheduleId`, `scheduleDate`, `slotRole`),
    INDEX `ScheduleDetail_officerId_scheduleDate_idx`(`officerId`, `scheduleDate`),
    INDEX `ScheduleDetail_scheduleDate_idx`(`scheduleDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OfficerAvailability` (
    `id` VARCHAR(191) NOT NULL,
    `officerId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `type` ENUM('CUTI', 'SAKIT', 'DINAS', 'LAINNYA') NOT NULL DEFAULT 'LAINNYA',
    `reason` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OfficerAvailability_officerId_date_key`(`officerId`, `date`),
    INDEX `OfficerAvailability_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssignmentHistory` (
    `id` VARCHAR(191) NOT NULL,
    `officerId` VARCHAR(191) NOT NULL,
    `monthlyScheduleId` VARCHAR(191) NULL,
    `scheduleDetailId` VARCHAR(191) NULL,
    `scheduleDate` DATETIME(3) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `slotRole` ENUM('PST', 'WFO') NOT NULL,
    `score` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AssignmentHistory_officerId_scheduleDate_idx`(`officerId`, `scheduleDate`),
    INDEX `AssignmentHistory_year_month_idx`(`year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReshuffleLog` (
    `id` VARCHAR(191) NOT NULL,
    `monthlyScheduleId` VARCHAR(191) NOT NULL,
    `actionType` ENUM('AUTO_REPLACE', 'SWAP', 'MANUAL_OVERRIDE') NOT NULL,
    `firstScheduleDetailId` VARCHAR(191) NULL,
    `secondScheduleDetailId` VARCHAR(191) NULL,
    `oldOfficerId` VARCHAR(191) NULL,
    `newOfficerId` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `performedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReshuffleLog_monthlyScheduleId_createdAt_idx`(`monthlyScheduleId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SwapRequest` (
    `id` VARCHAR(191) NOT NULL,
    `monthlyScheduleId` VARCHAR(191) NOT NULL,
    `firstScheduleDetailId` VARCHAR(191) NOT NULL,
    `secondScheduleDetailId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPLIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requestedById` VARCHAR(191) NULL,
    `approvedById` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,
    `appliedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SwapRequest_monthlyScheduleId_status_idx`(`monthlyScheduleId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SigapSyncLog` ADD CONSTRAINT `SigapSyncLog_triggeredById_fkey` FOREIGN KEY (`triggeredById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MonthlySchedule` ADD CONSTRAINT `MonthlySchedule_generatedById_fkey` FOREIGN KEY (`generatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleDetail` ADD CONSTRAINT `ScheduleDetail_monthlyScheduleId_fkey` FOREIGN KEY (`monthlyScheduleId`) REFERENCES `MonthlySchedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleDetail` ADD CONSTRAINT `ScheduleDetail_officerId_fkey` FOREIGN KEY (`officerId`) REFERENCES `PstOfficerCandidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficerAvailability` ADD CONSTRAINT `OfficerAvailability_officerId_fkey` FOREIGN KEY (`officerId`) REFERENCES `PstOfficerCandidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfficerAvailability` ADD CONSTRAINT `OfficerAvailability_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentHistory` ADD CONSTRAINT `AssignmentHistory_officerId_fkey` FOREIGN KEY (`officerId`) REFERENCES `PstOfficerCandidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentHistory` ADD CONSTRAINT `AssignmentHistory_monthlyScheduleId_fkey` FOREIGN KEY (`monthlyScheduleId`) REFERENCES `MonthlySchedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignmentHistory` ADD CONSTRAINT `AssignmentHistory_scheduleDetailId_fkey` FOREIGN KEY (`scheduleDetailId`) REFERENCES `ScheduleDetail`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReshuffleLog` ADD CONSTRAINT `ReshuffleLog_monthlyScheduleId_fkey` FOREIGN KEY (`monthlyScheduleId`) REFERENCES `MonthlySchedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReshuffleLog` ADD CONSTRAINT `ReshuffleLog_firstScheduleDetailId_fkey` FOREIGN KEY (`firstScheduleDetailId`) REFERENCES `ScheduleDetail`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReshuffleLog` ADD CONSTRAINT `ReshuffleLog_secondScheduleDetailId_fkey` FOREIGN KEY (`secondScheduleDetailId`) REFERENCES `ScheduleDetail`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReshuffleLog` ADD CONSTRAINT `ReshuffleLog_oldOfficerId_fkey` FOREIGN KEY (`oldOfficerId`) REFERENCES `PstOfficerCandidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReshuffleLog` ADD CONSTRAINT `ReshuffleLog_newOfficerId_fkey` FOREIGN KEY (`newOfficerId`) REFERENCES `PstOfficerCandidate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReshuffleLog` ADD CONSTRAINT `ReshuffleLog_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SwapRequest` ADD CONSTRAINT `SwapRequest_monthlyScheduleId_fkey` FOREIGN KEY (`monthlyScheduleId`) REFERENCES `MonthlySchedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SwapRequest` ADD CONSTRAINT `SwapRequest_firstScheduleDetailId_fkey` FOREIGN KEY (`firstScheduleDetailId`) REFERENCES `ScheduleDetail`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SwapRequest` ADD CONSTRAINT `SwapRequest_secondScheduleDetailId_fkey` FOREIGN KEY (`secondScheduleDetailId`) REFERENCES `ScheduleDetail`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SwapRequest` ADD CONSTRAINT `SwapRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SwapRequest` ADD CONSTRAINT `SwapRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
