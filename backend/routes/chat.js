const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads (in-memory storage for this assessment)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and audio files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|webm|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// In-memory store for conversations (as per assessment requirements)
const conversations = new Map();
const messages = new Map();

// Assistant responses in multiple languages
const assistantResponses = {
  en: [
    "Hello! How can I help you today?",
    "That's an interesting question. Let me think about that.",
    "I understand what you're asking. Here's what I think...",
    "Thanks for sharing that with me. I appreciate your perspective.",
    "That's a great point. I'd like to add that...",
    "I see what you mean. Let me provide some insights on this topic.",
    "That's an excellent question! Here's my take on it...",
    "I appreciate you bringing this up. Let me help clarify that for you.",
    "Interesting! I've learned something new from your message.",
    "Thank you for the detailed explanation. I find this topic fascinating."
  ],
  ar: [
    "مرحباً! كيف يمكنني مساعدتك اليوم؟",
    "هذا سؤال مثير للاهتمام. دعني أفكر في ذلك.",
    "أفهم ما تسأل عنه. إليك ما أعتقده...",
    "شكراً لك على مشاركة ذلك معي. أقدر وجهة نظرك.",
    "هذه نقطة رائعة. أود أن أضيف أن...",
    "أرى ما تعنيه. دعني أقدم بعض الرؤى حول هذا الموضوع.",
    "هذا سؤال ممتاز! إليك رأيي في الأمر...",
    "أقدر طرحك لهذا الموضوع. دعني أساعد في توضيح ذلك لك.",
    "مثير للاهتمام! لقد تعلمت شيئاً جديداً من رسالتك.",
    "شكراً لك على الشرح المفصل. أجد هذا الموضوع رائعاً."
  ]
};

// Generate assistant response based on user input
function generateAssistantResponse(userText) {
  const isArabic = /[\u0600-\u06FF]/.test(userText);
  const responses = isArabic ? assistantResponses.ar : assistantResponses.en;
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

// Random thinking texts
const thinkingTexts = [
  "Let me think about this...",
  "Processing your request...", 
  "Analyzing your message...",
  "Working on a response...",
  "Give me a moment...",
  "Hmm, interesting question...",
  "Looking into this...",
  "Considering your input..."
];

// Random chat titles
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

// POST /api/chat - Main chat endpoint that echoes back messages with attachments
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    console.log('Chat POST request received');
    
    // Better logging with error handling for JSON parsing
    try {
      console.log('req.body:', JSON.stringify(req.body, null, 2));
    } catch (jsonError) {
      console.log('JSON parsing error for req.body:', jsonError.message);
      console.log('req.body (raw):', req.body);
    }
    
    console.log('req.files:', req.files ? req.files.length : 0);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { text, conversationId } = req.body;
    const files = req.files || [];
    
    // Validate input
    if (!text && files.length === 0) {
      console.log('Validation failed: no text or files');
      return res.status(400).json({
        success: false,
        message: 'Message must contain text or attachments'
      });
    }

    // Process attachments
    const attachments = files.map(file => ({
      id: generateId(),
      name: file.originalname,
      type: getFileType(file),
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      size: file.size,
      mimeType: file.mimetype
    }));

    // Simulate 2-second processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create user message
    const userMessage = {
      id: generateId(),
      text: text || '',
      attachments,
      timestamp: new Date().toISOString(),
      sender: 'user',
      type: 'text'
    };

    // Create assistant response message
    const assistantMessage = {
      id: generateId(),
      text: generateAssistantResponse(text || 'File attached'),
      attachments: [],
      timestamp: new Date().toISOString(),
      sender: 'assistant',
      type: 'text'
    };

    // Store messages in conversation if conversationId provided
    if (conversationId) {
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, {
          id: conversationId,
          title: getRandomChatTitle(),
          created: new Date().toISOString(),
          messages: []
        });
      }
      
      const conversation = conversations.get(conversationId);
      conversation.messages.push(userMessage);
      conversation.messages.push(assistantMessage);
    }

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      },
      message: 'Message processed successfully'
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('JSON parsing error detected:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON data in request'
      });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds limit (10MB)'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/chat/title - Get random chat title
router.get('/title', (req, res) => {
  try {
    const title = getRandomChatTitle();
    res.json({
      success: true,
      title
    });
  } catch (error) {
    console.error('Error getting chat title:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat title'
    });
  }
});

// GET /api/chat/thinking - Get random thinking text
router.get('/thinking', (req, res) => {
  try {
    const thinking = getRandomThinking();
    res.json({
      success: true,
      thinking
    });
  } catch (error) {
    console.error('Error getting thinking text:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get thinking text'
    });
  }
});

// GET /api/chat/conversations - Get all conversations
router.get('/conversations', (req, res) => {
  try {
    const conversationList = Array.from(conversations.values()).map(conv => ({
      id: conv.id,
      title: conv.title,
      created: conv.created,
      messageCount: conv.messages.length, // Add message count
      lastMessage: conv.messages[conv.messages.length - 1] || null
    }));
    
    res.json({
      success: true,
      data: conversationList
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
});

// GET /api/chat/conversations/:id - Get specific conversation with messages
router.get('/conversations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const conversation = conversations.get(id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation'
    });
  }
});

// GET /api/chat/messages - Get paginated messages for a conversation
router.get('/messages', (req, res) => {
  try {
    const { conversationId, limit = 50, cursor } = req.query;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'conversationId is required'
      });
    }
    
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const allMessages = conversation.messages || [];
    const limitNum = parseInt(limit);
    let startIndex = 0;
    
    // Handle cursor-based pagination
    if (cursor) {
      const cursorIndex = allMessages.findIndex(msg => msg.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }
    
    const messages = allMessages.slice(startIndex, startIndex + limitNum);
    const nextCursor = messages.length === limitNum && startIndex + limitNum < allMessages.length 
      ? messages[messages.length - 1].id 
      : null;
    
    res.json({
      success: true,
      data: {
        items: messages,
        nextCursor
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

// POST /api/chat/conversations - Create new conversation
router.post('/conversations', (req, res) => {
  try {
    const { title } = req.body;
    const conversationId = generateId();
    
    const conversation = {
      id: conversationId,
      title: title || getRandomChatTitle(),
      created: new Date().toISOString(),
      messages: []
    };
    
    conversations.set(conversationId, conversation);
    
    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// GET /api/chat/health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Helper functions
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getFileType(file) {
  const mimetype = file.mimetype;
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  return 'file';
}

function getRandomChatTitle() {
  return chatTitles[Math.floor(Math.random() * chatTitles.length)];
}

function getRandomThinking() {
  return thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];
}

module.exports = router;