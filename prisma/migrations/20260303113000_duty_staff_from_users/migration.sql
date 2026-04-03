-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- Reset old duty assignment data that used StaffMember references
UPDATE `Queue` SET `dutyStaffId` = NULL WHERE `dutyStaffId` IS NOT NULL;
DELETE FROM `DutyReminderLog`;
DELETE FROM `DutySchedule`;

-- Re-point duty staff foreign keys to User table (PETUGAS)
ALTER TABLE `Queue`
    DROP FOREIGN KEY `Queue_dutyStaffId_fkey`;

ALTER TABLE `DutySchedule`
    DROP FOREIGN KEY `DutySchedule_staffId_fkey`;

ALTER TABLE `DutyReminderLog`
    DROP FOREIGN KEY `DutyReminderLog_staffId_fkey`;

ALTER TABLE `Queue`
    ADD CONSTRAINT `Queue_dutyStaffId_fkey`
    FOREIGN KEY (`dutyStaffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `DutySchedule`
    ADD CONSTRAINT `DutySchedule_staffId_fkey`
    FOREIGN KEY (`staffId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `DutyReminderLog`
    ADD CONSTRAINT `DutyReminderLog_staffId_fkey`
    FOREIGN KEY (`staffId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
