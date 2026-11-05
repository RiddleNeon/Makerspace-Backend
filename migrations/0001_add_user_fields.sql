-- Migration number: 0001 	 2026-10-25T08:46:32.384Z

ALTER TABLE "user"
ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

ALTER TABLE "user"
ADD COLUMN "displayName" TEXT;


