import 'dotenv/config';
import prisma from './src/db.js';

prisma.user.findMany({ where: { id: { in: [3, 9] } }, include: { profile: true } }).then(users => {
  console.log(users.map(u => ({ id: u.id, photo: u.profile?.photos?.[0] })));
  process.exit(0);
});
