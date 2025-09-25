const express = require('express');
const router = express.Router();
const { User } = require('../models');

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username displayName avatar isOnline lastSeen')
      .sort({ displayName: 1 })
      .lean();

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id, 'username displayName avatar isOnline lastSeen')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, email, displayName, avatar } = req.body;

    // Validation
    if (!username || !email || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and display name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this username or email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      displayName,
      avatar: avatar || null
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      data: {
        id: newUser._id,
        username: newUser.username,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        isOnline: newUser.isOnline,
        lastSeen: newUser.lastSeen
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/users/:id/status - Update user online status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.setOnlineStatus(isOnline);

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      },
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;