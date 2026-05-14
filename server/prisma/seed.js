import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import 'dotenv/config';

// Import Mongoose Models
import Connection from '../src/models/Connection.js';
import Chat from '../src/models/Chat.js';
import Message from '../src/models/Message.js';

const prisma = new PrismaClient();

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/clique_chat");
    console.log("MongoDB Connected for seeding");
  } catch (err) {
    console.error("MongoDB Connection Error during seed:", err);
  }
}

async function main() {
  console.log('Seeding dummy data...');
  await connectMongo();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Clear existing MongoDB Collections
  if (mongoose.connection.readyState === 1) {
    await Connection.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    console.log("Cleared old MongoDB records.");
  }

  // 1. Create Main Dummy User
  const user1 = await prisma.user.upsert({
    where: { email: 'dummy@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'dummy@example.com',
      password: hashedPassword,
      fullName: 'Dummy User',
      profile: {
        create: {
          preferredName: 'D-Unit',
          dob: new Date('1995-05-15'),
          height: 175,
          location: 'San Francisco',
          hometown: 'Los Angeles',
          photos: ['https://images.unsplash.com/photo-1500648767791-c9199017f7e5?w=600&h=800&fit=crop'],
          bio: 'Tech enthusiast. Coffee lover. World traveler.',
        }
      }
    }
  });

  // Mock Users to seed
  const mockUsers = [
    {
      email: 'sarah@example.com', name: 'Sarah Johnson',
      photo: 'https://images.unsplash.com/photo-1630939687530-241d630735df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MDI4NDI3OHww&ixlib=rb-4.1.0&q=80&w=1080',
      message: 'Hey! How was your weekend?', sender: 'other'
    },
    {
      email: 'michael@example.com', name: 'Michael Chen',
      photo: 'https://images.unsplash.com/photo-1737574821698-862e77f044c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDIxODYyMnww&ixlib=rb-4.1.0&q=80&w=1080',
      message: 'That sounds amazing! 🎉', sender: 'other'
    },
    {
      email: 'emma@example.com', name: 'Emma Rodriguez',
      photo: 'https://images.unsplash.com/photo-1617797981313-1c3f60f29f9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFzaWFuJTIwd29tYW4lMjBzbWlsaW5nfGVufDF8fHx8MTc3MDMxMjE3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      message: 'Would love to grab coffee sometime!', sender: 'me'
    },
  ];

  // Likes (Pending) Users
  const pendingLikeUsers = [
    {
      email: 'olivia@example.com', name: 'Olivia Parker',
      photo: 'https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBoYXBweXxlbnwxfHx8fDE3NzAyODY5MjB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      email: 'alex@example.com', name: 'Alex Thompson',
      photo: 'https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMGNhc3VhbCUyMHNtaWxpbmd8ZW58MXx8fHwxNzcwMjUxMjAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ];

  for (const mock of mockUsers) {
    const user = await prisma.user.upsert({
      where: { email: mock.email },
      update: { password: hashedPassword },
      create: {
        email: mock.email,
        password: hashedPassword,
        fullName: mock.name,
        profile: {
          create: {
            preferredName: mock.name.split(' ')[0],
            dob: new Date('1996-01-01'),
            photos: [mock.photo],
            bio: 'Just looking for fun!',
          }
        }
      }
    });

    if (mongoose.connection.readyState === 1) {
      // Create a Match (Mutual Connection)
      await Connection.create({
        senderId: user1.id,
        receiverId: user.id,
        status: 'matched'
      });
      await Connection.create({
        senderId: user.id,
        receiverId: user1.id,
        status: 'matched'
      });

      // Create Chat Room
      const newChat = await Chat.create({
        participants: [user1.id, user.id],
      });

      // Create initial message
      const msg = await Message.create({
        chatId: newChat._id,
        senderId: mock.sender === 'me' ? user1.id : user.id,
        text: mock.message,
      });

      // Update last message
      newChat.lastMessage = msg._id;
      await newChat.save();
    }
  }

  for (const mock of pendingLikeUsers) {
    const user = await prisma.user.upsert({
      where: { email: mock.email },
      update: { password: hashedPassword },
      create: {
        email: mock.email,
        password: hashedPassword,
        fullName: mock.name,
        profile: {
          create: {
            preferredName: mock.name.split(' ')[0],
            dob: new Date('1998-05-15'),
            photos: [mock.photo],
          }
        }
      }
    });

    if (mongoose.connection.readyState === 1) {
      // They liked user1
      await Connection.create({
        senderId: user.id,
        receiverId: user1.id,
        status: 'pending'
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });
