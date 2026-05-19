import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './mongoDb.js';
import { setupSocket } from './socket.js';
import Message from './models/Message.js';
import Connection from './models/Connection.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000'
      ];
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
      }
      
      if (
        allowedOrigins.includes(cleanOrigin) ||
        /\.vercel\.app$/.test(cleanOrigin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocket(io);

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  
  // --- Daily Database Maintenance (Free Tier Scaling) ---
  const runMaintenance = async () => {
    try {
      console.log('🧹 Running database maintenance...');
      
      // 1. Cleanup messages older than 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const msgResult = await Message.deleteMany({ createdAt: { $lt: threeMonthsAgo } });
      
      // 2. Cleanup rejected connections older than 1 month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const connResult = await Connection.deleteMany({ 
        status: 'rejected', 
        updatedAt: { $lt: oneMonthAgo } 
      });
      
      console.log(`✅ Maintenance complete: Deleted ${msgResult.deletedCount} old messages and ${connResult.deletedCount} rejected connections.`);
    } catch (error) {
      console.error('❌ Maintenance failed:', error);
    }
  };

  // Run every 24 hours (and once on startup)
  setInterval(runMaintenance, 24 * 60 * 60 * 1000);
  runMaintenance();
});