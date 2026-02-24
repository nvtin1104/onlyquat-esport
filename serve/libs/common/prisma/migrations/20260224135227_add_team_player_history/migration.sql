-- CreateEnum
CREATE TYPE "TeamHistoryEventType" AS ENUM ('NAME_CHANGE', 'LOGO_CHANGE', 'ACHIEVEMENT', 'PLAYER_JOIN', 'PLAYER_LEAVE', 'ORG_CHANGE');

-- CreateEnum
CREATE TYPE "PlayerHistoryEventType" AS ENUM ('DISPLAY_NAME_CHANGE', 'TEAM_JOIN', 'TEAM_LEAVE', 'TEAM_TRANSFER', 'ACHIEVEMENT', 'TIER_CHANGE');

-- CreateTable
CREATE TABLE "team_histories" (
    "id" TEXT NOT NULL,
    "eventType" "TeamHistoryEventType" NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "note" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT,

    CONSTRAINT "team_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_histories" (
    "id" TEXT NOT NULL,
    "eventType" "PlayerHistoryEventType" NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "note" TEXT,
    "happenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "player_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_histories_teamId_happenedAt_idx" ON "team_histories"("teamId", "happenedAt" DESC);

-- CreateIndex
CREATE INDEX "player_histories_playerId_happenedAt_idx" ON "player_histories"("playerId", "happenedAt" DESC);

-- AddForeignKey
ALTER TABLE "team_histories" ADD CONSTRAINT "team_histories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_histories" ADD CONSTRAINT "team_histories_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_histories" ADD CONSTRAINT "player_histories_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_histories" ADD CONSTRAINT "player_histories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
