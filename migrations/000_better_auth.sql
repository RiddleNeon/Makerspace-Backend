-- Migration number: 0001
-- Better Auth

CREATE TABLE "user" (
    "id" text not null primary key,
    "name" text not null,
    "email" text not null unique,
    "emailVerified" integer not null,
    "image" text,
    "createdAt" date not null,
    "updatedAt" date not null
);

CREATE TABLE "account" (
    "id" text not null primary key,
    "accountId" text not null,
    "providerId" text not null,
    "userId" text not null references "user" ("id") on delete cascade,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" date,
    "refreshTokenExpiresAt" date,
    "scope" text,
    "password" text,
    "createdAt" date not null,
    "updatedAt" date not null
);

CREATE TABLE "session" (
    "id" text not null primary key,
    "expiresAt" date not null,
    "token" text not null unique,
    "createdAt" date not null,
    "updatedAt" date not null,
    "ipAddress" text,
    "userAgent" text,
    "userId" text not null references "user" ("id") on delete cascade
);

CREATE TABLE "verification" (
    "id" text not null primary key,
    "identifier" text not null,
    "value" text not null,
    "expiresAt" date not null,
    "createdAt" date not null,
    "updatedAt" date not null
);

CREATE INDEX "account_userId_idx"
    ON "account" ("userId");

CREATE INDEX "session_userId_idx"
    ON "session" ("userId");

CREATE INDEX "verification_identifier_idx"
    ON "verification" ("identifier");



-- Custom

CREATE TABLE "user_profile" (
  "auth_user_id" text not null on delete cascade,
  "role" text not null,

  foreign key (auth_user_id) references "user" ("id")
)


