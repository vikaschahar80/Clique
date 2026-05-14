import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true
  },
  fullName: String,
  email: String,
  idCardUrl: {
    type: String,
    required: true
  },
  selfieUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('VerificationRequest', verificationRequestSchema);
