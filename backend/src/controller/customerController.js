const customerModel = require('../model/customerModel');

const customerController = {
  // GET /api/customers
  async getAll(req, res, next) {
    try {
      const { search } = req.query;
      const customers = await customerModel.getAll(search);
      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/customers/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await customerModel.getById(id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Pelanggan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/customers
  async create(req, res, next) {
    try {
      const { name, email, phone, address } = req.body;
      if (!name || !email || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: 'Field name, email, phone, dan address wajib diisi',
        });
      }

      const newCustomer = await customerModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Pelanggan berhasil ditambahkan',
        data: newCustomer,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/customers/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await customerModel.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Pelanggan dengan ID ${id} tidak ditemukan`,
        });
      }

      // Validasi kata sandi jika melakukan ubah password
      if (req.body.new_password) {
        if (existing.password && req.body.old_password && existing.password !== req.body.old_password) {
          return res.status(400).json({
            success: false,
            message: 'Kata sandi saat ini tidak cocok.',
          });
        }
        req.body.password = req.body.new_password;
      }

      const updated = await customerModel.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Data pelanggan berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/customers/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await customerModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Pelanggan dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Pelanggan berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/customers/fcm-token
  async updateFcmToken(req, res, next) {
    try {
      const { customerId, email, fcmToken } = req.body;
      if (!fcmToken) {
        return res.status(400).json({
          success: false,
          message: 'fcmToken wajib diisi',
        });
      }

      let targetId = customerId;
      if (!targetId && email) {
        const customer = await customerModel.findByEmail(email);
        targetId = customer?.id;
      }

      if (!targetId) {
        return res.status(400).json({
          success: false,
          message: 'customerId atau email pelanggan tidak ditemukan',
        });
      }

      await customerModel.updateFcmToken(targetId, fcmToken);

      res.status(200).json({
        success: true,
        message: 'Token FCM pelanggan berhasil diperbarui',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = customerController;

