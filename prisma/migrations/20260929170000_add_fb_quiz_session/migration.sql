CREATE TABLE "FbQuizSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'choosing_topic',
    "topic" TEXT NOT NULL DEFAULT '',
    "difficulty" TEXT NOT NULL DEFAULT '',
    "questions" TEXT NOT NULL DEFAULT '[]',
    "currentQuestion" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "FbQuizSession_senderId_key" ON "FbQuizSession"("senderId");
CREATE INDEX "FbQuizSession_status_idx" ON "FbQuizSession"("status");
CREATE INDEX "FbQuizSession_updatedAt_idx" ON "FbQuizSession"("updatedAt");
