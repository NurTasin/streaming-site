-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `pass_hash` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` VARCHAR(191) NOT NULL,
    `owner_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `views` BIGINT NOT NULL DEFAULT 0,
    `org_file_dest` VARCHAR(191) NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `transcoded_file_dest` VARCHAR(191) NULL,
    `org_file_size` BIGINT NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL,

    INDEX `Video_owner_id_idx`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
