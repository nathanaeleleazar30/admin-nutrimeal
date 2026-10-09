const subscriptionModel = require('../model/subscriptionModel');

const subscriptionController = {
  // GET /api/subscriptions
  async getAll(req, res, next) {
    try {
      const subs = await subscriptionModel.getAll();
      res.status(200).json({
        success: true,
        data: subs,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/subscriptions/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const sub = await subscriptionModel.getById(id);
      if (!sub) {
        return res.status(404).json({
          success: false,
          message: `Data langganan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        data: sub,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/subscriptions
  async create(req, res, next) {
    try {
      const { customer_id, customer_name, package_name, start_date, end_date } = req.body;
      if (!customer_id || !customer_name || !package_name || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Field customer_id, customer_name, package_name, start_date, dan end_date wajib diisi',
        });
      }

      const newSub = await subscriptionModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Langganan berhasil didaftarkan',
        data: newSub,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/subscriptions/:id/status
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, pause_reason } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status langganan (Aktif/Dijeda/Selesai) wajib diisi',
        });
      }

      const updated = await subscriptionModel.updateStatus(id, status, pause_reason);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Data langganan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: `Status langganan berhasil diperbarui menjadi ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/subscriptions/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await subscriptionModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Data langganan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Data langganan berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = subscriptionController;
