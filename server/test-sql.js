import prisma from './src/db.js';
async function run() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';`);
    console.log('Added role column');
  } catch(e) { console.error('Role error:', e.message); }

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;`);
    console.log('Added isAdmin column');
  } catch(e) { console.error('isAdmin error:', e.message); }
  
  process.exit(0);
}
run();
