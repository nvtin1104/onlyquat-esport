-- Migration: update_user_model
-- Aligns users table with updated schema:
--   - UserRole enum: 3 lowercase values → 7 uppercase values
--   - UserStatus enum: new enum (ACTIVE, UNACTIVE, BAN, LOCK)
--   - users table: remove firstName, lastName, isActive
--   - users table: add name, accountType, status, ggId, bio, suspendedAt, suspendedUntil, suspensionReason
--   - role column: single enum → enum array

-- ─── Step 1: Rename old UserRole enum ────────────────────────────────────────
ALTER TYPE "UserRole" RENAME TO "UserRole_old";

-- ─── Step 2: Create new UserRole enum (7 uppercase values) ───────────────────
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'ORGANIZER', 'CREATOR', 'PARTNER', 'PLAYER', 'USER');

-- ─── Step 3: Create UserStatus enum ──────────────────────────────────────────
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'UNACTIVE', 'BAN', 'LOCK');

-- ─── Step 4: Add new columns to users ────────────────────────────────────────
ALTER TABLE "users"
  ADD COLUMN "name"             TEXT,
  ADD COLUMN "accountType"      INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "status"           "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "ggId"             TEXT,
  ADD COLUMN "bio"              TEXT,
  ADD COLUMN "suspendedAt"      TIMESTAMP(3),
  ADD COLUMN "suspendedUntil"   TIMESTAMP(3),
  ADD COLUMN "suspensionReason" TEXT,
  ADD COLUMN "role_new"         "UserRole"[] NOT NULL DEFAULT '{}';

-- ─── Step 5: Migrate existing data ───────────────────────────────────────────
UPDATE "users" SET
  "name" = NULLIF(TRIM(COALESCE("firstName", '') || ' ' || COALESCE("lastName", '')), ''),
  "accountType" = CASE WHEN "role"::TEXT = 'admin' THEN 0 ELSE 1 END,
  "role_new" = CASE
    WHEN "role"::TEXT = 'admin'     THEN ARRAY['ADMIN'::"UserRole"]
    WHEN "role"::TEXT = 'organizer' THEN ARRAY['ORGANIZER'::"UserRole"]
    WHEN "role"::TEXT = 'player'    THEN ARRAY['PLAYER'::"UserRole"]
    ELSE                                 ARRAY['USER'::"UserRole"]
  END;

-- ─── Step 6: Drop old role column, rename new one ────────────────────────────
ALTER TABLE "users" DROP COLUMN "role";
ALTER TABLE "users" RENAME COLUMN "role_new" TO "role";

-- ─── Step 7: Drop old columns ────────────────────────────────────────────────
ALTER TABLE "users"
  DROP COLUMN "firstName",
  DROP COLUMN "lastName",
  DROP COLUMN "isActive";

-- ─── Step 8: Drop old UserRole enum ──────────────────────────────────────────
DROP TYPE "UserRole_old";
