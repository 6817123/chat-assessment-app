const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Message, User } = require('../models');

// GET /api/messages/:conversationId - Get messages for a conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Validate conversationId format (should be userId1_userId2)
    if (!conversationId.includes('_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID format'
      });
    }

    const messages = await Message.getConversationMessages(
      conversationId,
      parseInt(limit),
      parseInt(skip)
    );

    // Reverse to show oldest first
    const sortedMessages = messages.reverse();

    res.json({
      success: true,
      data: sortedMessages,
      count: sortedMessages.length,
      conversationId
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/messages - Create a new message
router.post('/', async (req, res) => {
  try {
    const { sender, receiver, text, messageType = 'text' } = req.body;

    // Validation
    if (!sender || !receiver || !text) {
      return res.status(400).json({
        success: false,
        message: 'Sender, receiver, and text are required'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty'
      });
    }

    // Verify sender and receiver exist
    const [senderUser, receiverUser] = await Promise.all([
      User.findById(sender),
      User.findById(receiver)
    ]);

    if (!senderUser) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(sender, receiver);

    // Create new message
    const newMessage = new Message({
      sender,
      receiver,
      conversationId,
      text: text.trim(),
      messageType
    });

    await newMessage.save();

    // Populate sender and receiver info for response
    await newMessage.populate('sender', 'username displayName avatar');
    await newMessage.populate('receiver', 'username displayName avatar');

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error creating message:', error);

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
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/messages/:id/read - Mark message as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      data: message,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/messages/:id - Edit a message
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty'
      });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.editMessage(text.trim());
    await message.populate('sender', 'username displayName avatar');
    await message.populate('receiver', 'username displayName avatar');

    res.json({
      success: true,
      data: message,
      message: 'Message updated successfully'
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await Message.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/messages/conversations/:userId - Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all messages where user is sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$$ROOT' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.receiver',
          foreignField: '_id',
          as: 'receiverInfo'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;