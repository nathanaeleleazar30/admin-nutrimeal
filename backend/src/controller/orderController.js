const orderModel = require('../model/orderModel');

const orderController = {
  // GET /api/orders
  async getAll(req, res, next) {
    try {
      const { status, batch, day, search, customer_id, customerId } = req.query;
      const finalCustomerId = customer_id || customerId;
      const orders = await orderModel.getAll({
        status,
        batch,
        day,
        search,
        customer_id: finalCustomerId,
      });
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

      const { verifyJwt } = require('../lib/jwt');
      const { extractBearerToken, ADMIN_ROLES } = require('../middleware/authMiddleware');
      const token = extractBearerToken(req);
      let authPayload = null;
      if (token) {
        try {
          authPayload = verifyJwt(token);
        } catch (_err) {
          authPayload = null;
        }
      }
      const isAdmin = Boolean(authPayload && ADMIN_ROLES.has(authPayload.role));
      const requestedPaymentStatus = req.body.payment_status;

      if (requestedPaymentStatus === 'Lunas' && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Status Lunas hanya dapat ditetapkan melalui pembayaran QRIS terverifikasi atau oleh admin',
        });
      }

      const safeBody = { ...req.body };
      if (!isAdmin) {
        safeBody.payment_status = requestedPaymentStatus === 'COD' ? 'COD' : 'Menunggu Pembayaran';
        safeBody.status = safeBody.payment_status === 'COD' ? 'Diterima' : 'Menunggu Pembayaran';
      } else {
        safeBody.payment_status = requestedPaymentStatus || 'Menunggu Pembayaran';
        safeBody.status =
          req.body.status ||
          (['Lunas', 'COD'].includes(safeBody.payment_status) ? 'Diterima' : 'Menunggu Pembayaran');
      }

      const newOrder = await orderModel.create(safeBody);

      // Otomatis buat notifikasi in-app hanya untuk pesanan yang sudah dibayar (Lunas/COD)
      if (req.body.customer_id && ['Lunas', 'COD'].includes(newOrder.payment_status)) {
        try {
          const notificationModel = require('../model/notificationModel');
          await notificationModel.create({
            customer_id: req.body.customer_id,
            title: `Pesanan ${newOrder.id} Diterima! 🎉`,
            body: `Pesanan ${newOrder.package_name || 'katering sehat'} sebesar Rp ${Number(newOrder.total_price).toLocaleString('id-ID')} telah masuk ke dapur NutriMeal.`,
            type: 'order',
            route: '/notifikasi',
          });
        } catch (_) {}
      }

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
      if (req.body.payment_status === 'Lunas') {
        const { verifyJwt } = require('../lib/jwt');
        const { extractBearerToken, ADMIN_ROLES } = require('../middleware/authMiddleware');
        const token = extractBearerToken(req);
        let authPayload = null;
        if (token) {
          try {
            authPayload = verifyJwt(token);
          } catch (_err) {
            authPayload = null;
          }
        }
        if (!authPayload || !ADMIN_ROLES.has(authPayload.role)) {
          return res.status(403).json({
            success: false,
            message: 'Status Lunas hanya dapat ditetapkan melalui pembayaran QRIS terverifikasi atau oleh admin',
          });
        }
      }
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

