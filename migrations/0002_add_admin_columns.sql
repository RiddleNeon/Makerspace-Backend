-- Migration number: 0002 	 2026-10-30T17:31:08.913Z


ALTER TABLE "user"
ADD COLUMN "banned" INTEGER DEFAULT 0;

ALTER TABLE "user"
ADD COLUMN "banReason" TEXT;

ALTER TABLE "user"
ADD COLUMN "banExpires" INTEGER;

ALTER TABLE "session"
ADD COLUMN "impersonatedBy" TEXT;

