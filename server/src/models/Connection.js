import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  senderId: {
    type: Number,
    required: true,
  },
  receiverId: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'rejected'],
    default: 'pending',
  },
  likeType: {
    type: String,
    enum: ['DATING', 'FRIENDSHIP'],
    default: 'DATING',
  },
}, { timestamps: true });

// Ensure unique pairs
connectionSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default mongoose.model('Connection', connectionSchema);
