-- AlterTable
ALTER TABLE `Video` ADD COLUMN `pass_hash` VARCHAR(191) NULL,
    ADD COLUMN `protected` BOOLEAN NOT NULL DEFAULT false;
