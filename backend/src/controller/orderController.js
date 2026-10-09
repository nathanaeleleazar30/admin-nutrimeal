const orderModel = require('../model/orderModel');

const orderController = {
  // GET /api/orders
  async getAll(req, res, next) {
    try {
      const { status, batch, day, search } = req.query;
      const orders = await orderModel.getAll({ status, batch, day, search });
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await orderModel.getById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Pesanan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders
  async create(req, res, next) {
    try {
      const { customer_name, customer_phone, customer_address, package_name, total_price } = req.body;
      if (!customer_name || !customer_phone || !customer_address || !package_name || !total_price) {
        return res.status(400).json({
          success: false,
          message: 'Field customer_name, customer_phone, customer_address, package_name, dan total_price wajib diisi',
        });
      }

      const newOrder = await orderModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Pesanan berhasil dibuat',
        data: newOrder,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/orders/:id/status
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status pesanan wajib diisi',
        });
      }

      const updated = await orderModel.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Pesanan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: `Status pesanan berhasil diubah menjadi ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/orders/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await orderModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Pesanan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Data pesanan berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/orders/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await orderModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Pesanan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Pesanan berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = orderController;
