
const thinkingTexts = [
  'Let me think about this...',
  'Processing your request...',
  'Analyzing your message...',
  'Working on a response...',
  'Give me a moment...',
  'Hmm, interesting question...',
  'Looking into this...',
  'Considering your input...'
];

const chatTitles = [
  'General Discussion',
  'Quick Chat',
  'Daily Conversation',
  'Casual Talk',
  'Random Thoughts',
  'Morning Chat',
  'Evening Discussion',
  'Friendly Conversation',
  'Quick Questions',
  'General Inquiry'
];

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getRandomChatTitle() {
  return chatTitles[Math.floor(Math.random() * chatTitles.length)];
}

function getRandomThinking() {
  return thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];
}

function detectArabic(text='') {
  return /[\u0600-\u06FF]/.test(text);
}

function getFileType(file) {
  const mimetype = file.mimetype;
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  return 'file';
}

function buildAttachmentObjects(files=[]) {
  return files.map(file => ({
    id: generateId(),
    name: file.originalname,
    type: getFileType(file),
    url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    size: file.size,
    mimeType: file.mimetype
  }));
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = {
  generateId,
  getRandomChatTitle,
  getRandomThinking,
  detectArabic,
  getFileType,
  buildAttachmentObjects,
  delay
};
