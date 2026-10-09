const mealModel = require('../model/mealModel');

const mealController = {
  // GET /api/meals
  async getAll(req, res, next) {
    try {
      const { category, search } = req.query;
      const meals = await mealModel.getAll({ category, search });
      res.status(200).json({
        success: true,
        data: meals,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/meals/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const meal = await mealModel.getById(id);
      if (!meal) {
        return res.status(404).json({
          success: false,
          message: `Menu dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        data: meal,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/meals
  async create(req, res, next) {
    try {
      const { name, category, calories, price, image_url, description, schedule } = req.body;

      // Validasi input wajib
      if (!name || !category || !calories || !price || !image_url || !description || !schedule) {
        return res.status(400).json({
          success: false,
          message: 'Field name, category, calories, price, image_url, description, dan schedule wajib diisi',
        });
      }

      const newMeal = await mealModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Menu berhasil ditambahkan',
        data: newMeal,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/meals/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await mealModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Menu dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Menu berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/meals/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await mealModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Menu dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Menu berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = mealController;
