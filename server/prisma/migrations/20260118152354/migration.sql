-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'OTHER');

-- CreateEnum
CREATE TYPE "IdentityMode" AS ENUM ('REAL_NAME', 'PSEUDONYM', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('MEN', 'WOMEN', 'EVERYONE');

-- CreateEnum
CREATE TYPE "MessagePermission" AS ENUM ('ANYONE', 'SAME_CIRCLE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "showGender" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "useRealName" BOOLEAN NOT NULL DEFAULT true,
    "identityMode" "IdentityMode" NOT NULL,
    "aliasExpiry" TEXT,
    "verificationType" TEXT NOT NULL,
    "photos" TEXT[],
    "interests" TEXT[],
    "drinkingHabit" TEXT,
    "smokingHabit" TEXT,
    "workoutHabit" TEXT,
    "prompt1" TEXT,
    "prompt2" TEXT,
    "prompt3" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lookingFor" TEXT[],
    "selectedCircles" TEXT[],
    "openToNearby" BOOLEAN NOT NULL DEFAULT true,
    "openToTravel" BOOLEAN NOT NULL DEFAULT true,
    "interestedIn" "GenderPreference" NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "maxDistance" INTEGER NOT NULL,
    "whoCanMessage" "MessagePermission" NOT NULL,
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "blockScreenshots" BOOLEAN NOT NULL DEFAULT true,
    "autoFilterAbuse" BOOLEAN NOT NULL DEFAULT true,
    "enableEmergencyAlert" BOOLEAN NOT NULL DEFAULT true,
    "moderatorIntervention" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
