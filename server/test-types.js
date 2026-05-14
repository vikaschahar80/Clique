import mongoose from 'mongoose';
import 'dotenv/config';
import Chat from './src/models/Chat.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const chat = await Chat.findOne({});
  const userId = 3;
  console.log('chat.participants:', chat.participants);
  console.log('types:', typeof chat.participants[0], typeof userId);
  console.log('Equality 3 === 3:', chat.participants[0] === userId);
  const other = chat.participants.find(p => p !== userId);
  console.log('otherParticipantId:', other);
  process.exit(0);
});
