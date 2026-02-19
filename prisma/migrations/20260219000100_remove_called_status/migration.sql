-- Update existing queues that are still in CALLED status
UPDATE `Queue`
SET `status` = 'WAITING'
WHERE `status` = 'CALLED';

-- Remove CALLED from the enum values
ALTER TABLE `Queue`
  MODIFY `status` ENUM('WAITING', 'SERVING', 'COMPLETED', 'CANCELED') NOT NULL DEFAULT 'WAITING';
