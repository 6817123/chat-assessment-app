
const conversations = new Map();

function getConversation(id) {
  return conversations.get(id);
}

function ensureConversation(id, titleGenerator) {
  if (!conversations.has(id)) {
    conversations.set(id, {
      id,
      title: titleGenerator(),
      created: new Date().toISOString(),
      messages: []
    });
  }
  return conversations.get(id);
}

function createConversation(customTitle, titleGenerator, idGenerator) {
  const id = idGenerator();
  const conversation = {
    id,
    title: customTitle || titleGenerator(),
    created: new Date().toISOString(),
    messages: []
  };
  conversations.set(id, conversation);
  return conversation;
}

function deleteConversation(id) {
  return conversations.delete(id);
}

function listConversations() {
  return Array.from(conversations.values()).map(c => ({
    id: c.id,
    title: c.title,
    created: c.created,
    messageCount: c.messages.length,
    lastMessage: c.messages[c.messages.length - 1] || null
  }));
}

function addMessages(conversationId, msgs) {
  const conv = conversations.get(conversationId);
  if (!conv) return false;
  conv.messages.push(...msgs);
  return true;
}

function paginateMessages(conversationId, { limit = 50, cursor }) {
  const conv = conversations.get(conversationId);
  if (!conv) return null;
  const all = conv.messages;
  const limitNum = parseInt(limit, 10);
  let startIndex = 0;
  if (cursor) {
    const idx = all.findIndex(m => m.id === cursor);
    if (idx !== -1) startIndex = idx + 1;
  }
  const slice = all.slice(startIndex, startIndex + limitNum);
  const nextCursor = slice.length === limitNum && (startIndex + limitNum) < all.length
    ? slice[slice.length - 1].id
    : null;
  return { items: slice, nextCursor };
}

module.exports = {
  getConversation,
  ensureConversation,
  createConversation,
  deleteConversation,
  listConversations,
  addMessages,
  paginateMessages
};
