import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  senderId: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  readBy: [{
    type: Number,
  }],
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
