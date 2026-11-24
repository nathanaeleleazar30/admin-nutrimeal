const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');

// GET /api/chat/conversations - Ambil daftar semua percakapan (Admin Web)
router.get('/conversations', chatController.getConversations);

// GET /api/chat/conversations/:customerId - Ambil detail percakapan customer (Mobile App)
router.get('/conversations/:customerId', chatController.getConversation);

// POST /api/chat/messages - Kirim pesan (Admin Web atau Mobile App)
router.post('/messages', chatController.sendMessage);

// PATCH /api/chat/conversations/:conversationId/read - Tandai dibaca
router.patch('/conversations/:conversationId/read', chatController.markRead);

module.exports = router;
