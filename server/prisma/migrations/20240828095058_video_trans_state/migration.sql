/*
  Warnings:

  - You are about to drop the column `owner_id` on the `Video` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Video` DROP FOREIGN KEY `Video_owner_id_fkey`;

-- AlterTable
ALTER TABLE `Video` DROP COLUMN `owner_id`,
    ADD COLUMN `transcode_state` VARCHAR(191) NOT NULL DEFAULT 'QUEUED',
    MODIFY `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
