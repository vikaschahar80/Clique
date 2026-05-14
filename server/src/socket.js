import Message from './models/Message.js';
import Chat from './models/Chat.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins their personal room and their chat rooms
    socket.on('setup', (userData) => {
      if (userData && userData.id) {
        socket.join(userData.id.toString());
        socket.emit('connected');
      }
    });

    socket.on('join chat', (room) => {
      socket.join(room);
      console.log('User Joined Room: ' + room);
    });

    socket.on('new message', async (newMessageReceived) => {
      const chat = newMessageReceived.chatId;

      if (!chat) return console.log('chat not defined');

      // Emit to everyone in the room except sender
      socket.in(chat).emit('message received', newMessageReceived);
    });

    // WebRTC Signaling
    socket.on('callUser', (data) => {
      // data contains: userToCall (userId), signalData, from, name
      socket.in(data.chatId).emit('callUser', {
        signal: data.signalData,
        from: data.from,
        name: data.name,
        chatId: data.chatId
      });
    });

    socket.on('answerCall', (data) => {
      socket.in(data.chatId).emit('callAccepted', data.signal);
    });

    socket.on('endCall', (data) => {
      socket.in(data.chatId).emit('callEnded');
    });

    socket.on('iceCandidate', (data) => {
      socket.in(data.chatId).emit('iceCandidate', data.candidate);
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED');
    });
  });
};
