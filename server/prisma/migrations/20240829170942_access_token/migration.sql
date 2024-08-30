-- AlterTable
ALTER TABLE `Video` ADD COLUMN `referer` JSON NULL;

-- CreateTable
CREATE TABLE `AccessToken` (
    `id` VARCHAR(191) NOT NULL,
    `videoId` VARCHAR(191) NOT NULL,
    `type` ENUM('ONE_TIME', 'TIME_BOUND') NOT NULL DEFAULT 'ONE_TIME',
    `expires_on` DATETIME(3) NULL,
    `used` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
