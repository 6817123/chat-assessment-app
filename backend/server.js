const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

// Import routes
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Title endpoint (as specified in requirements)
app.get('/title', (req, res) => {
  const chatTitles = [
    "General Discussion",
    "Quick Chat", 
    "Daily Conversation",
    "Casual Talk",
    "Random Thoughts",
    "Morning Chat",
    "Evening Discussion",
    "Friendly Conversation",
    "Quick Questions",
    "General Inquiry"
  ];
  
  const title = chatTitles[Math.floor(Math.random() * chatTitles.length)];
  res.json({ title });
});

// API Routes
app.use('/api/chat', chatRoutes);

// Direct endpoints for frontend convenience (proxy to chat routes)
app.get('/conversations', (req, res, next) => {
  req.url = '/conversations';
  req.originalUrl = '/api/chat/conversations';
  chatRoutes(req, res, next);
});
app.post('/conversations', (req, res, next) => {
  req.url = '/conversations';
  req.originalUrl = '/api/chat/conversations';
  chatRoutes(req, res, next);
});
app.get('/messages', (req, res, next) => {
  req.url = '/messages';
  req.originalUrl = '/api/chat/messages';
  chatRoutes(req, res, next);
});
app.post('/chat', (req, res, next) => {
  req.url = '/';
  req.originalUrl = '/api/chat/';
  chatRoutes(req, res, next);
});
app.get('/health', (req, res, next) => {
  req.url = '/health';
  req.originalUrl = '/api/chat/health';
  chatRoutes(req, res, next);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running — Welcome to Chat Assessment API!'
  });
});
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.IO connection handling
const activeUsers = new Map(); // Store active users and their socket IDs

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user:join', async (userData) => {
    try {
      const { userId, username } = userData;
      
      // Store user info with socket ID
      activeUsers.set(socket.id, { userId, username });
      
      // Join user to their personal room for direct messaging
      socket.join(`user_${userId}`);
      
      // Broadcast user online status to all clients
      socket.broadcast.emit('user:online', { userId, username });
      
      console.log(`User ${username} (${userId}) joined`);
      
      socket.emit('user:joined', { 
        success: true, 
        message: 'Successfully connected to chat' 
      });
    } catch (error) {
      console.error('Error handling user join:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle sending messages
  socket.on('message:send', async (messageData) => {
    try {
      const { sender, receiver, text, messageType = 'text', conversationId } = messageData;
      
      // Create message object for real-time broadcasting
      const newMessage = {
        id: Date.now().toString(),
        sender,
        receiver,
        conversationId: conversationId || `${sender}_${receiver}`,
        text: text.trim(),
        messageType,
        timestamp: new Date().toISOString()
      };

      // Send message to both sender and receiver
      io.to(`user_${sender}`).emit('message:received', newMessage);
      io.to(`user_${receiver}`).emit('message:received', newMessage);

      console.log(`Message sent from ${sender} to ${receiver}: ${text.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error handling message send:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    const { conversationId, userId, username } = data;
    socket.to(conversationId).emit('typing:start', { userId, username });
  });

  socket.on('typing:stop', (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit('typing:stop', { userId });
  });

  // Handle message read status
  socket.on('message:read', async (data) => {
    try {
      const { messageId, userId } = data;
      
      // Notify sender that message was read (in-memory only)
      socket.broadcast.emit('message:read', { messageId, userId });
    } catch (error) {
      console.error('Error handling message read:', error);
    }
  });

  // Handle joining conversation rooms
  socket.on('conversation:join', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('conversation:leave', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  // Handle user disconnection
  socket.on('disconnect', async () => {
    try {
      const userData = activeUsers.get(socket.id);
      
      if (userData) {
        const { userId, username } = userData;
        
        // Remove user from active users
        activeUsers.delete(socket.id);
        
        // Broadcast user offline status
        socket.broadcast.emit('user:offline', { userId, username });
        
        console.log(`User ${username} (${userId}) disconnected`);
      } else {
        console.log(`Unknown user disconnected: ${socket.id}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});





// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});