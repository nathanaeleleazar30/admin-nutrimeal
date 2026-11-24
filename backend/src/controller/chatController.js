const chatModel = require('../model/chatModel');

const chatController = {
  // GET /api/chat/conversations
  // Ambil semua daftar percakapan (untuk Admin Web)
  async getConversations(req, res, next) {
    try {
      const conversations = await chatModel.getAllConversations();
      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/chat/conversations/:customerId
  // Ambil atau mulai percakapan spesifik untuk customer (untuk Flutter Mobile)
  async getConversation(req, res, next) {
    try {
      const { customerId } = req.params;
      const { name, phone } = req.query;

      const conversation = await chatModel.getOrCreateConversation(
        customerId,
        name || 'Pelanggan NutriMeal',
        phone || ''
      );

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/chat/messages
  // Kirim pesan baru (bisa dari Admin Web atau Flutter Mobile)
  async sendMessage(req, res, next) {
    try {
      const {
        conversationId,
        customerId,
        sender,
        text,
        time,
        ticket,
        customerName,
        customerPhone,
      } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Teks pesan tidak boleh kosong',
        });
      }

      const validSender = sender === 'admin' ? 'admin' : 'customer';

      const newMessage = await chatModel.createMessage({
        conversationId,
        customerId,
        sender: validSender,
        text: text.trim(),
        time,
        ticket,
        customerName,
        customerPhone,
      });

      res.status(201).json({
        success: true,
        message: 'Pesan berhasil terkirim',
        data: newMessage,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/chat/conversations/:conversationId/read
  // Tandai semua pesan di percakapan sebagai dibaca
  async markRead(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { readerType = 'admin' } = req.body;

      await chatModel.markAsRead(conversationId, readerType);

      res.status(200).json({
        success: true,
        message: 'Percakapan berhasil ditandai telah dibaca',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = chatController;
