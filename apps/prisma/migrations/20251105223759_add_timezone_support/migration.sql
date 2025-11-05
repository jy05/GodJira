-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "systemTimezone" TEXT NOT NULL DEFAULT 'America/Chicago';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "timezone" TEXT DEFAULT 'America/Chicago';
