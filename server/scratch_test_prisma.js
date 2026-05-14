import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Attempting to create email verification with userId: null...");
    await prisma.emailVerification.create({
      data: {
        userId: null,
        purpose: 'registration',
        email: 'test@example.com',
        codeHash: 'hash',
        expiresAt: new Date(Date.now() + 10000)
      }
    });
    console.log("Success!");
  } catch (error) {
    console.error("Caught error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
