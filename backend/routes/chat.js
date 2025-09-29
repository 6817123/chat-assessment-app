const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const controller = require('../controllers/chatController');

router.post('/', upload.array('files', 10), controller.postChat);

router.get('/title', controller.getTitle);
router.get('/thinking', controller.getThinking);
router.get('/health', controller.health);

router.get('/conversations', controller.listConversations);
router.get('/conversations/:id', controller.getConversation);
router.post('/conversations', controller.createConversation);
router.delete('/conversations/:id', controller.deleteConversation);

router.get('/messages', controller.getMessages);

module.exports = router;