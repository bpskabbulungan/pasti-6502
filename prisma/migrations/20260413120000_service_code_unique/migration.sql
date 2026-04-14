ALTER TABLE `Service`
  ADD COLUMN `code` VARCHAR(16) NULL;

UPDATE `Service`
SET `code` = CONCAT('S', UPPER(SUBSTRING(REPLACE(`id`, '-', ''), 1, 6)))
WHERE `code` IS NULL;

UPDATE `Service`
SET `code` = 'K'
WHERE `id` = (
  SELECT `id`
  FROM (
    SELECT `id`
    FROM `Service`
    WHERE LOWER(TRIM(`name`)) = 'konsultasi statistik'
    ORDER BY `createdAt` ASC
    LIMIT 1
  ) AS `first_match`
);

UPDATE `Service`
SET `code` = 'P'
WHERE `id` = (
  SELECT `id`
  FROM (
    SELECT `id`
    FROM `Service`
    WHERE LOWER(TRIM(`name`)) = 'perpustakaan'
    ORDER BY `createdAt` ASC
    LIMIT 1
  ) AS `first_match`
);

UPDATE `Service`
SET `code` = 'R'
WHERE `id` = (
  SELECT `id`
  FROM (
    SELECT `id`
    FROM `Service`
    WHERE LOWER(TRIM(`name`)) = 'rekomendasi statistik'
    ORDER BY `createdAt` ASC
    LIMIT 1
  ) AS `first_match`
);

UPDATE `Service`
SET `code` = 'D'
WHERE `id` = (
  SELECT `id`
  FROM (
    SELECT `id`
    FROM `Service`
    WHERE LOWER(TRIM(`name`)) = 'pelayanan dtsen'
    ORDER BY `createdAt` ASC
    LIMIT 1
  ) AS `first_match`
);

ALTER TABLE `Service`
  MODIFY `code` VARCHAR(16) NOT NULL;

CREATE UNIQUE INDEX `Service_code_key` ON `Service`(`code`);
