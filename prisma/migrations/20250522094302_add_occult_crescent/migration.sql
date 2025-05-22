-- CreateEnum
CREATE TYPE "event_variant" AS ENUM ('normal', 'occult_crescent');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "jobs" ADD VALUE 'phantom_bard';
ALTER TYPE "jobs" ADD VALUE 'phantom_berserker';
ALTER TYPE "jobs" ADD VALUE 'phantom_cannoneer';
ALTER TYPE "jobs" ADD VALUE 'phantom_chemist';
ALTER TYPE "jobs" ADD VALUE 'phantom_freelancer';
ALTER TYPE "jobs" ADD VALUE 'phantom_geomancer';
ALTER TYPE "jobs" ADD VALUE 'phantom_knight';
ALTER TYPE "jobs" ADD VALUE 'phantom_monk';
ALTER TYPE "jobs" ADD VALUE 'phantom_oracle';
ALTER TYPE "jobs" ADD VALUE 'phantom_ranger';
ALTER TYPE "jobs" ADD VALUE 'phantom_samurai';
ALTER TYPE "jobs" ADD VALUE 'phantom_thief';
ALTER TYPE "jobs" ADD VALUE 'phantom_timemage';

-- AlterEnum
ALTER TYPE "roles" ADD VALUE 'phantom_job';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "event_variant" "event_variant" DEFAULT 'normal';
