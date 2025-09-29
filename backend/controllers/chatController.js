
const chatStore = require('../services/chatStore');
const {
  generateId,
  getRandomChatTitle,
  getRandomThinking,
  buildAttachmentObjects,
  delay
} = require('../utils/chatUtils');

async function postChat(req, res) {
  try {
    const { text = '', conversationId } = req.body;
    const files = req.files || [];

    if (!text && files.length === 0) {
      return res.status(400).json({ success: false, message: 'Message must contain text or attachments' });
    }

    const attachments = buildAttachmentObjects(files);

    const userMessage = {
      id: generateId(),
      text: text || '',
      attachments,
      timestamp: new Date().toISOString(),
      sender: 'user',
      type: 'text'
    };

    // Simulate thinking delay (~2s)
    await delay(2000);

    const assistantMessage = {
      id: generateId(),
      text: `Echo: ${text || (attachments.length ? 'Attachment received' : '')}`.trim(),
      attachments: attachments.map(a => ({ ...a })),
      timestamp: new Date().toISOString(),
      sender: 'assistant',
      type: 'text'
    };

    if (conversationId) {
      chatStore.ensureConversation(conversationId, getRandomChatTitle);
      chatStore.addMessages(conversationId, [userMessage, assistantMessage]);
    }

    return res.json({
      success: true,
      data: { userMessage, assistantMessage },
      message: 'Echo processed successfully'
    });
  } catch (err) {
    console.error('Error in postChat:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds limit (10MB)' });
    }
    return res.status(500).json({ success: false, message: err.message || 'Failed to process message' });
  }
}

function getTitle(req, res) {
  return res.json({ success: true, title: getRandomChatTitle() });
}

function getThinking(req, res) {
  return res.json({ success: true, thinking: getRandomThinking() });
}

function listConversations(req, res) {
  try {
    return res.json({ success: true, data: chatStore.listConversations() });
  } catch (e) {
    console.error('Error listing conversations:', e);
    return res.status(500).json({ success: false, message: 'Failed to get conversations' });
  }
}

function getConversation(req, res) {
  const { id } = req.params;
  const conv = chatStore.getConversation(id);
  if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
  return res.json({ success: true, data: conv });
}

function getMessages(req, res) {
  const { conversationId, limit = 50, cursor } = req.query;
  if (!conversationId) {
    return res.status(400).json({ success: false, message: 'conversationId is required' });
  }
  const page = chatStore.paginateMessages(conversationId, { limit, cursor });
  if (!page) return res.status(404).json({ success: false, message: 'Conversation not found' });
  return res.json({ success: true, data: page });
}

function createConversation(req, res) {
  try {
    const { title } = req.body;
    const conv = chatStore.createConversation(title, getRandomChatTitle, generateId);
    return res.status(201).json({ success: true, data: conv });
  } catch (e) {
    console.error('Error creating conversation:', e);
    return res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
}

function deleteConversation(req, res) {
  const { id } = req.params;
  const deleted = chatStore.deleteConversation(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Conversation not found' });
  return res.json({ success: true, message: 'Conversation deleted successfully' });
}

function health(req, res) {
  return res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
}

module.exports = {
  postChat,
  getTitle,
  getThinking,
  listConversations,
  getConversation,
  getMessages,
  createConversation,
  deleteConversation,
  health
};
