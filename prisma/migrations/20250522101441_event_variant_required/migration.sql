/*
  Warnings:

  - Made the column `event_variant` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "event_variant" SET NOT NULL;
