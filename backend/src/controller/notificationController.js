const notificationModel = require('../model/notificationModel');
const notificationService = require('../lib/notificationService');

const notificationController = {
  // GET /api/notifications?customerId=...
  async getByCustomer(req, res, next) {
    try {
      const customerId = req.query.customerId || req.query.userId;
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter customerId wajib disertakan.',
        });
      }

      const notifications = await notificationModel.getByCustomerId(customerId);
      const unreadCount = await notificationModel.getUnreadCount(customerId);

      res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
        firebaseReady: notificationService.isReady(),
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/notifications/:id/read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const { customerId } = req.body;
      const success = await notificationModel.markAsRead(id, customerId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: `Notifikasi dengan ID ${id} tidak ditemukan.`,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notifikasi berhasil ditandai sebagai dibaca.',
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/notifications/read-all
  async markAllAsRead(req, res, next) {
    try {
      const { customerId } = req.body;
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'customerId wajib disertakan dalam body.',
        });
      }

      const totalUpdated = await notificationModel.markAllAsRead(customerId);
      res.status(200).json({
        success: true,
        message: `${totalUpdated} notifikasi berhasil ditandai sebagai dibaca.`,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/notifications/send (Kirim notifikasi manual / dari admin panel)
  async sendManual(req, res, next) {
    try {
      const { customerId, title, body, route, type, isBroadcast } = req.body;

      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: 'title dan body wajib diisi.',
        });
      }

      if (isBroadcast) {
        const result = await notificationService.broadcast({ title, body, route, type });
        return res.status(200).json({
          success: true,
          message: 'Notifikasi berhasil dibroadcast ke seluruh pelanggan.',
          data: result,
        });
      }

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'customerId wajib diisi jika bukan broadcast.',
        });
      }

      const result = await notificationService.sendToCustomer({
        customerId,
        title,
        body,
        route,
        type,
      });

      res.status(200).json({
        success: true,
        message: 'Notifikasi berhasil diproses.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
