-- Game model: rename iconUrl→logo, add website/mediaLinks/organizationId
-- Team model: rename logoUrl→logo, remove regionTag/wins/losses/draws, add website/mediaLinks/description

-- ─── Game: drop old column, add new columns ─────────────────────────────────
ALTER TABLE "games" RENAME COLUMN "iconUrl" TO "logo";
ALTER TABLE "games" ADD COLUMN "website" TEXT;
ALTER TABLE "games" ADD COLUMN "mediaLinks" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "games" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "games" ADD CONSTRAINT "games_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "games_organizationId_idx" ON "games"("organizationId");

-- ─── Team: drop old columns, rename, add new columns ─────────────────────────
ALTER TABLE "teams" RENAME COLUMN "logoUrl" TO "logo";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "region";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "wins";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "losses";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "draws";
ALTER TABLE "teams" ADD COLUMN "website" TEXT;
ALTER TABLE "teams" ADD COLUMN "mediaLinks" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "teams" ADD COLUMN "description" TEXT;

