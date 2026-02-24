-- AlterTable players: drop old skill columns, add new ones + stats/isPro
ALTER TABLE "players" DROP COLUMN IF EXISTS "aim";
ALTER TABLE "players" DROP COLUMN IF EXISTS "gameIq";
ALTER TABLE "players" DROP COLUMN IF EXISTS "clutch";
ALTER TABLE "players" DROP COLUMN IF EXISTS "teamplay";
ALTER TABLE "players" DROP COLUMN IF EXISTS "bannerUrl";
ALTER TABLE "players" DROP COLUMN IF EXISTS "role";

ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "stats" JSONB DEFAULT '{}';
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "mechanics" SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "tactics" SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "composure" SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "teamwork" SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "isPro" BOOLEAN NOT NULL DEFAULT true;

-- Drop old indexes
DROP INDEX IF EXISTS "players_rating_idx";
DROP INDEX IF EXISTS "players_gameId_idx";

-- Create new combined index
CREATE INDEX IF NOT EXISTS "players_gameId_rating_idx" ON "players"("gameId", "rating" DESC);

-- AlterTable ratings: replace old skill columns with new ones
ALTER TABLE "ratings" DROP COLUMN IF EXISTS "aim";
ALTER TABLE "ratings" DROP COLUMN IF EXISTS "gameIq";
ALTER TABLE "ratings" DROP COLUMN IF EXISTS "clutch";
ALTER TABLE "ratings" DROP COLUMN IF EXISTS "teamplay";

ALTER TABLE "ratings" ADD COLUMN IF NOT EXISTS "mechanics" SMALLINT;
ALTER TABLE "ratings" ADD COLUMN IF NOT EXISTS "tactics" SMALLINT;
ALTER TABLE "ratings" ADD COLUMN IF NOT EXISTS "composure" SMALLINT;
ALTER TABLE "ratings" ADD COLUMN IF NOT EXISTS "teamwork" SMALLINT;
