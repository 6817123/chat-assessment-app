const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen
  };
});

// Method to update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

// Method to set online status
userSchema.methods.setOnlineStatus = function(status) {
  this.isOnline = status;
  if (!status) {
    this.lastSeen = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema);