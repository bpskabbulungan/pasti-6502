-- Add storage key for object-storage based analytics exports
ALTER TABLE `AnalyticsExportJob`
  ADD COLUMN `storageKey` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `AnalyticsExportJob_storageKey_key`
  ON `AnalyticsExportJob`(`storageKey`);
