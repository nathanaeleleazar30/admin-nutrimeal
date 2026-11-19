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
      const name = req.body.name;
      const category = req.body.category;
      const calories = req.body.calories;
      const price = req.body.price;
      const image_url = req.body.image_url || req.body.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop';
      const description = req.body.description !== undefined && req.body.description !== '' ? req.body.description : 'Menu katering sehat bergizi';
      const schedule = req.body.schedule || 'Setiap Hari';

      // Validasi input wajib
      if (!name || !category || calories === undefined || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Field name, category, calories, dan price wajib diisi',
        });
      }

      const payload = {
        ...req.body,
        name,
        category,
        calories: Number(calories),
        price: Number(price),
        image_url,
        description,
        schedule,
      };

      const newMeal = await mealModel.create(payload);
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
