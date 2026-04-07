-- Add service feedback fields for guest queue follow-up
ALTER TABLE `Queue`
  ADD COLUMN `serviceRating` INTEGER NULL,
  ADD COLUMN `serviceFeedback` TEXT NULL,
  ADD COLUMN `feedbackSubmittedAt` DATETIME(3) NULL;
