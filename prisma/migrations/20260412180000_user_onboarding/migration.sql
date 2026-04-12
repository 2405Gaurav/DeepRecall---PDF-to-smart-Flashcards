DROP INDEX IF EXISTS "users_email_key";

ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "display_name" TEXT;
ALTER TABLE "users" ADD COLUMN "child_name" TEXT;
ALTER TABLE "users" ADD COLUMN "grade" TEXT;
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
