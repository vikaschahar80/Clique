import mongoose from 'mongoose';
import Chat from './src/models/Chat.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clique').then(async () => {
  const chats = await Chat.find({});
  const seen = new Set();
  let deleted = 0;
  for (const chat of chats) {
    const sortedParticipants = [...chat.participants].sort().join(',');
    if (seen.has(sortedParticipants)) {
      await Chat.deleteOne({ _id: chat._id });
      deleted++;
    } else {
      seen.add(sortedParticipants);
    }
  }
  console.log('Deleted ' + deleted + ' duplicate chats.');
  process.exit(0);
}).catch(console.error);
