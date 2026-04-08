-- Remove unused guestbook fields for cleanup and refactor

-- 1. Remove queueType from Queue (all queues are offline by default)
ALTER TABLE `Queue` DROP COLUMN `queueType`;

-- 2. Remove endTime from Queue (only one date field needed)
ALTER TABLE `Queue` DROP COLUMN `endTime`;

-- 3. Remove purpose from Guest (keep only Layanan/Service)
ALTER TABLE `Guest` DROP COLUMN `purpose`;

-- 4. Remove purpose from Visitor enum usage (if needed)
-- Note: The Purpose enum is still in schema but won't be used for exports
