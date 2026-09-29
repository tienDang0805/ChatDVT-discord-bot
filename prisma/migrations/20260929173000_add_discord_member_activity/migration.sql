CREATE TABLE "DiscordMemberActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "linkCount" INTEGER NOT NULL DEFAULT 0,
    "mediaCount" INTEGER NOT NULL DEFAULT 0,
    "firstTrackedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "DiscordMemberActivity_guildId_userId_key"
ON "DiscordMemberActivity"("guildId", "userId");

CREATE INDEX "DiscordMemberActivity_guildId_messageCount_idx"
ON "DiscordMemberActivity"("guildId", "messageCount");

CREATE INDEX "DiscordMemberActivity_guildId_linkCount_idx"
ON "DiscordMemberActivity"("guildId", "linkCount");

CREATE INDEX "DiscordMemberActivity_guildId_mediaCount_idx"
ON "DiscordMemberActivity"("guildId", "mediaCount");
