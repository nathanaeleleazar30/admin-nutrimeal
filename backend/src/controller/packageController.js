const packageModel = require('../model/packageModel');

const packageController = {
  // GET /api/packages
  async getAll(req, res, next) {
    try {
      const packages = await packageModel.getAll();
      res.status(200).json({
        success: true,
        data: packages,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/packages/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const pkg = await packageModel.getById(id);
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: `Paket dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        data: pkg,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/packages
  async create(req, res, next) {
    try {
      const { name, price, portions } = req.body;
      if (!name || !price || !portions) {
        return res.status(400).json({
          success: false,
          message: 'Field name, price, dan portions wajib diisi',
        });
      }

      const newPkg = await packageModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Paket berhasil ditambahkan',
        data: newPkg,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/packages/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await packageModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Paket dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Paket berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/packages/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await packageModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Paket dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Paket berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = packageController;
