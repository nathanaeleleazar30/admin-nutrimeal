const faqModel = require('../model/faqModel');

const faqController = {
  // GET /api/faqs
  async getAll(req, res, next) {
    try {
      const faqs = await faqModel.getAll();
      res.status(200).json({
        success: true,
        data: faqs,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/faqs/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const faq = await faqModel.getById(id);
      if (!faq) {
        return res.status(404).json({
          success: false,
          message: `FAQ dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        data: faq,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/faqs
  async create(req, res, next) {
    try {
      const { category, question, answer } = req.body;
      if (!category || !question || !answer) {
        return res.status(400).json({
          success: false,
          message: 'Field category, question, dan answer wajib diisi',
        });
      }

      const newFaq = await faqModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'FAQ berhasil ditambahkan',
        data: newFaq,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/faqs/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await faqModel.update(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `FAQ dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'FAQ berhasil diperbarui',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/faqs/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await faqModel.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `FAQ dengan ID ${id} tidak ditemukan`,
        });
      }
      res.status(200).json({
        success: true,
        message: 'FAQ berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = faqController;
