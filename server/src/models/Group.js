import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  handle: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^@[\w-]+$/, 'Handle must start with @ and contain only letters, numbers, underscores, or hyphens']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: Number, // Reference to Postgres User ID
    required: true
  },
  members: [{
    type: Number, // Array of Postgres User IDs
    default: []
  }],
  memberCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

groupSchema.pre('save', function() {
  if (this.isModified('members')) {
    this.memberCount = this.members.length;
  }
});

// Index for trending search (memberCount)
groupSchema.index({ memberCount: -1 });
groupSchema.index({ name: 'text', description: 'text', handle: 'text' });

export default mongoose.model('Group', groupSchema);
