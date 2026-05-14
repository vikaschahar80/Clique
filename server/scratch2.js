import 'dotenv/config';
import prisma from './src/db.js';

prisma.user.findMany({ include: { profile: true } }).then(users => {
  console.log(users.map(u => ({ id: u.id, name: u.fullName, preferredName: u.profile?.preferredName })));
  process.exit(0);
});
