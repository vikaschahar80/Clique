/*
  Warnings:

  - You are about to drop the column `allowAnonymous` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `autoFilterAbuse` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `blockScreenshots` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `enableEmergencyAlert` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `interestedIn` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `lookingFor` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `maxAge` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `minAge` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `moderatorIntervention` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `openToNearby` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `openToTravel` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `selectedCircles` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `whoCanMessage` on the `UserPreference` table. All the data in the column will be lost.
  - You are about to drop the column `aliasExpiry` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `drinkingHabit` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `identityMode` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `prompt1` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `prompt2` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `prompt3` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `showGender` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `smokingHabit` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `useRealName` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `verificationType` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `workoutHabit` on the `UserProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LifestyleFrequency" AS ENUM ('NEVER', 'SOMETIMES', 'OFTEN', 'REGULARLY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "DrugFrequency" AS ENUM ('NEVER', 'SOMETIMES', 'OFTEN', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "RelationshipGoal" AS ENUM ('LIFE_PARTNER', 'LONG_TERM', 'LONG_TERM_OPEN_TO_SHORT', 'SHORT_TERM_OPEN_TO_LONG', 'FIGURING_OUT', 'FRIENDSHIP', 'CASUAL', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "PromptQuestion" AS ENUM ('TWO_TRUTHS_AND_A_LIE', 'IM_LOOKING_FOR_SOMEONE_WHO', 'THE_KEY_TO_MY_HEART_IS', 'MY_IDEAL_SUNDAY_LOOKS_LIKE', 'IM_OVERLY_COMPETITIVE_ABOUT', 'THE_BEST_WAY_TO_ASK_ME_OUT_IS', 'I_KNOW_THE_BEST_SPOT_IN_TOWN_FOR', 'MY_MOST_CONTROVERSIAL_OPINION_IS', 'IM_WEIRDLY_ATTRACTED_TO', 'DONT_HATE_ME_IF_I', 'A_SHOWER_THOUGHT_I_RECENTLY_HAD', 'MY_SIMPLE_PLEASURES', 'THE_DORKIEST_THING_ABOUT_ME_IS', 'I_WONT_SHUT_UP_ABOUT', 'MY_GO_TO_KARAOKE_SONG_IS', 'I_RECENTLY_DISCOVERED_THAT', 'TOGETHER_WE_COULD', 'IM_CONVINCED_THAT', 'MY_BIGGEST_FLEX_IS', 'GREEN_FLAGS_I_LOOK_FOR', 'DATING_ME_IS_LIKE', 'I_GEEK_OUT_ON', 'THE_WAY_TO_WIN_ME_OVER_IS', 'IM_A_REGULAR_AT', 'ILL_FALL_FOR_YOU_IF', 'MY_LOVE_LANGUAGE_IS', 'I_TAKE_PRIDE_IN', 'ALL_I_ASK_IS_THAT_YOU', 'WELL_GET_ALONG_IF', 'LETS_DEBATE_THIS_TOPIC', 'IM_KNOWN_FOR', 'MY_HIDDEN_TALENT_IS', 'YOU_SHOULD_NOT_GO_OUT_WITH_ME_IF', 'I_WANT_SOMEONE_WHO', 'TYPICAL_SUNDAY', 'I_LIKE_MY_DATES_TO_BE', 'WHAT_IM_LOOKING_FOR', 'THIS_YEAR_I_REALLY_WANT_TO', 'THE_HALLMARK_OF_A_GOOD_RELATIONSHIP_IS', 'MY_GREATEST_STRENGTH_IS', 'IM_READY_TO');

-- DropForeignKey
ALTER TABLE "UserPreference" DROP CONSTRAINT "UserPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- AlterTable
ALTER TABLE "UserPreference" DROP COLUMN "allowAnonymous",
DROP COLUMN "autoFilterAbuse",
DROP COLUMN "blockScreenshots",
DROP COLUMN "enableEmergencyAlert",
DROP COLUMN "interestedIn",
DROP COLUMN "lookingFor",
DROP COLUMN "maxAge",
DROP COLUMN "minAge",
DROP COLUMN "moderatorIntervention",
DROP COLUMN "openToNearby",
DROP COLUMN "openToTravel",
DROP COLUMN "selectedCircles",
DROP COLUMN "whoCanMessage",
ADD COLUMN     "ageRangeMax" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "ageRangeMin" INTEGER NOT NULL DEFAULT 18,
ADD COLUMN     "interestedInGender" TEXT[],
ALTER COLUMN "maxDistance" SET DEFAULT 50;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "aliasExpiry",
DROP COLUMN "displayName",
DROP COLUMN "drinkingHabit",
DROP COLUMN "gender",
DROP COLUMN "identityMode",
DROP COLUMN "phoneNumber",
DROP COLUMN "prompt1",
DROP COLUMN "prompt2",
DROP COLUMN "prompt3",
DROP COLUMN "showGender",
DROP COLUMN "smokingHabit",
DROP COLUMN "useRealName",
DROP COLUMN "verificationType",
DROP COLUMN "workoutHabit",
ADD COLUMN     "aboutMe" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "children" TEXT,
ADD COLUMN     "college" TEXT,
ADD COLUMN     "datingGoal" "RelationshipGoal",
ADD COLUMN     "drinking" "LifestyleFrequency",
ADD COLUMN     "drugs" "DrugFrequency",
ADD COLUMN     "ethnicity" TEXT,
ADD COLUMN     "exercise" "LifestyleFrequency",
ADD COLUMN     "familyPlan" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "hometown" TEXT,
ADD COLUMN     "isCollegeVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPersonVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWorkVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT[],
ADD COLUMN     "pets" TEXT[],
ADD COLUMN     "preferredName" TEXT,
ADD COLUMN     "prompt1Answer" TEXT,
ADD COLUMN     "prompt1Question" "PromptQuestion",
ADD COLUMN     "prompt2Answer" TEXT,
ADD COLUMN     "prompt2Question" "PromptQuestion",
ADD COLUMN     "prompt3Answer" TEXT,
ADD COLUMN     "prompt3Question" "PromptQuestion",
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "sexuality" TEXT,
ADD COLUMN     "smoking" "LifestyleFrequency",
ADD COLUMN     "work" TEXT,
ALTER COLUMN "location" DROP NOT NULL;

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "GenderPreference";

-- DropEnum
DROP TYPE "IdentityMode";

-- DropEnum
DROP TYPE "MessagePermission";

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
