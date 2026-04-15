-- CreateTable
CREATE TABLE `PstGenerateAttemptLog` (
    `id` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `downloadPdf` BOOLEAN NOT NULL DEFAULT false,
    `forceRegenerate` BOOLEAN NOT NULL DEFAULT false,
    `allowSameFridayAssignee` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    `alreadyExists` BOOLEAN NULL,
    `errorMessage` VARCHAR(191) NULL,
    `requestedById` VARCHAR(191) NULL,
    `monthlyScheduleId` VARCHAR(191) NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PstGenerateAttemptLog_year_month_createdAt_idx`(`year`, `month`, `createdAt`),
    INDEX `PstGenerateAttemptLog_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `PstGenerateAttemptLog_requestedById_createdAt_idx`(`requestedById`, `createdAt`),
    INDEX `PstGenerateAttemptLog_monthlyScheduleId_createdAt_idx`(`monthlyScheduleId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PstGenerateAttemptLog` ADD CONSTRAINT `PstGenerateAttemptLog_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PstGenerateAttemptLog` ADD CONSTRAINT `PstGenerateAttemptLog_monthlyScheduleId_fkey` FOREIGN KEY (`monthlyScheduleId`) REFERENCES `MonthlySchedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
