-- Align Queue runtime contract with application services
ALTER TABLE `Queue`
  ADD COLUMN `queueType` ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'OFFLINE',
  ADD COLUMN `endTime` DATETIME(3) NULL;

-- Backfill queue origin hint for existing online visitor-form records
UPDATE `Queue`
SET `queueType` = 'ONLINE'
WHERE `tempUuid` IS NOT NULL;
