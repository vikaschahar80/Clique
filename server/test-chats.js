import mongoose from 'mongoose';
import 'dotenv/config';
import Chat from './src/models/Chat.js';

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const chats = await Chat.find({});
  console.log('Chats in DB:', chats);
  process.exit(0);
});
