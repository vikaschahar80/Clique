import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin', isAdmin: true }
    });
    console.log(`✅ User ${email} has been promoted to Admin.`);
  } catch (error) {
    console.error(`❌ Failed to promote user: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with the email you want to promote
const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.log("Usage: node promote-admin.js <email>");
} else {
  promoteToAdmin(emailToPromote);
}
