const voucherModel = require('../model/voucherModel');

const voucherController = {
  // GET /api/vouchers
  async getAll(req, res, next) {
    try {
      const vouchers = await voucherModel.getAll();
      res.status(200).json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/vouchers/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const voucher = await voucherModel.getById(id);
      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: `Voucher dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        data: voucher,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/vouchers
  async create(req, res, next) {
    try {
      const { code, title, discount_value } = req.body;
      if (!code || !title || !discount_value) {
        return res.status(400).json({
          success: false,
          message: 'Field code, title, dan discount_value wajib diisi',
        });
      }

      // Cek duplikasi kode
      const existing = await voucherModel.getByCode(code);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Kode voucher ${code.toUpperCase()} sudah terdaftar`,
        });
      }

      const newVoucher = await voucherModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Voucher berhasil dibuat',
        data: newVoucher,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/vouchers/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await voucherModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Voucher dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Voucher berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/vouchers/:id/toggle
  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const toggled = await voucherModel.toggleStatus(id);
      if (!toggled) {
        return res.status(404).json({
          success: false,
          message: `Voucher dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: `Status voucher berhasil diubah menjadi ${toggled.is_active ? 'Aktif' : 'Nonaktif'}`,
        data: toggled,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/vouchers/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await voucherModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Voucher dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Voucher berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = voucherController;
