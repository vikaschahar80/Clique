-- Optional ID on verification requests; email-based path; other affiliation email on profile
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "otherAffiliationEmail" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "isOtherAffiliationVerified" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "VerificationRequest" ADD COLUMN IF NOT EXISTS "verificationMethod" TEXT NOT NULL DEFAULT 'id_document';
ALTER TABLE "VerificationRequest" ADD COLUMN IF NOT EXISTS "affiliationEmail" TEXT;
ALTER TABLE "VerificationRequest" ALTER COLUMN "idCardUrl" DROP NOT NULL;
