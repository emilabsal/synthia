-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT
);

-- CreateTable
CREATE TABLE "Song" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramFileId" TEXT NOT NULL,
    "fileUniqueId" TEXT NOT NULL,
    "title" TEXT,
    "performer" TEXT,
    "duration" INTEGER NOT NULL,
    "fileName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedById" INTEGER NOT NULL,
    CONSTRAINT "Song_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Song_fileUniqueId_key" ON "Song"("fileUniqueId");
