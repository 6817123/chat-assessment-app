const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ createdAt: -1 });

// Static method to generate conversation ID
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  // Sort user IDs to ensure consistent conversation ID regardless of order
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return sortedIds.join('_');
};

// Static method to get messages for a conversation
messageSchema.statics.getConversationMessages = function(conversationId, limit = 50, skip = 0) {
  return this.find({ conversationId })
    .populate('sender', 'username displayName avatar')
    .populate('receiver', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newText) {
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
});

// Ensure virtuals are included in JSON output
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Message', messageSchema);