-- AlterTable
ALTER TABLE `Queue`
    ADD COLUMN `dutyStaffId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Queue_dutyStaffId_idx` ON `Queue`(`dutyStaffId`);

-- CreateTable
CREATE TABLE `DutySettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `workDays` JSON NOT NULL,
    `reminderEnabled` BOOLEAN NOT NULL DEFAULT true,
    `autoAssignEnabled` BOOLEAN NOT NULL DEFAULT true,
    `reminderTemplate` TEXT NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Makassar',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DutyDayOff` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('HOLIDAY', 'LEAVE') NOT NULL DEFAULT 'HOLIDAY',
    `note` VARCHAR(191) NULL,
    `settingsId` VARCHAR(191) NOT NULL DEFAULT 'default',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DutyDayOff_date_key`(`date`),
    INDEX `DutyDayOff_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DutyReminderLog` (
    `id` VARCHAR(191) NOT NULL,
    `reminderDate` DATETIME(3) NOT NULL,
    `staffId` VARCHAR(191) NOT NULL,
    `scheduleId` VARCHAR(191) NULL,
    `settingsId` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `channel` ENUM('FONNTE') NOT NULL DEFAULT 'FONNTE',
    `success` BOOLEAN NOT NULL DEFAULT false,
    `providerResponse` JSON NULL,
    `errorMessage` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DutyReminderLog_reminderDate_staffId_channel_key`(`reminderDate`, `staffId`, `channel`),
    INDEX `DutyReminderLog_reminderDate_idx`(`reminderDate`),
    INDEX `DutyReminderLog_staffId_idx`(`staffId`),
    INDEX `DutyReminderLog_scheduleId_idx`(`scheduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default settings
INSERT INTO `DutySettings` (`id`, `workDays`, `reminderEnabled`, `autoAssignEnabled`, `reminderTemplate`, `timezone`, `updatedAt`)
VALUES (
    'default',
    '[1,2,3,4,5]',
    true,
    true,
    'Assalamu''alaikum/selamat pagi {{nama_petugas}}.\n\nPengingat jadwal PST {{hari}}, {{tanggal}}.\nAnda dijadwalkan bertugas layanan PST BPS Kabupaten Bulungan.\n\nMohon hadir tepat waktu. Terima kasih.',
    'Asia/Makassar',
    CURRENT_TIMESTAMP(3)
)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- AddForeignKey
ALTER TABLE `Queue`
    ADD CONSTRAINT `Queue_dutyStaffId_fkey`
    FOREIGN KEY (`dutyStaffId`) REFERENCES `StaffMember`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DutyDayOff`
    ADD CONSTRAINT `DutyDayOff_settingsId_fkey`
    FOREIGN KEY (`settingsId`) REFERENCES `DutySettings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DutyReminderLog`
    ADD CONSTRAINT `DutyReminderLog_staffId_fkey`
    FOREIGN KEY (`staffId`) REFERENCES `StaffMember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DutyReminderLog`
    ADD CONSTRAINT `DutyReminderLog_scheduleId_fkey`
    FOREIGN KEY (`scheduleId`) REFERENCES `DutySchedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DutyReminderLog`
    ADD CONSTRAINT `DutyReminderLog_settingsId_fkey`
    FOREIGN KEY (`settingsId`) REFERENCES `DutySettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
