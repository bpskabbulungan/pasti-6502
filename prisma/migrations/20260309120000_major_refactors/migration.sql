-- CreateTable
CREATE TABLE `QueueCounter` (
    `id` VARCHAR(191) NOT NULL,
    `queueDate` DATETIME(3) NOT NULL,
    `lastNumber` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QueueCounter_queueDate_key`(`queueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsExportJob` (
    `id` VARCHAR(191) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `format` ENUM('XLSX', 'PDF') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `contentType` VARCHAR(191) NULL,
    `payload` LONGBLOB NULL,
    `errorMessage` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnalyticsExportJob_requestedById_createdAt_idx`(`requestedById`, `createdAt`),
    INDEX `AnalyticsExportJob_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnalyticsExportJob` ADD CONSTRAINT `AnalyticsExportJob_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable
DROP TABLE `StaffMember`;
