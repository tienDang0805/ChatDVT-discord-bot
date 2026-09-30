ALTER TABLE "DiscordMemberActivity"
ADD COLUMN "historicalMessageCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "DiscordMemberActivity"
ADD COLUMN "historicalLinkCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "DiscordMemberActivity"
ADD COLUMN "historicalMediaCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "DiscordMemberActivity"
ADD COLUMN "historicalSyncedAt" DATETIME;
