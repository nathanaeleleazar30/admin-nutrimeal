const adminModel = require('../model/adminModel');

const authController = {
  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi.',
        });
      }

      const admin = await adminModel.findByEmail(email);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah.',
        });
      }

      // Verifikasi password (plaintext atau bcrypt)
      if (admin.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah.',
        });
      }

      // Login sukses
      const token = `token_nutrimeal_${admin.id}_${Date.now()}`;

      res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  async getMe(req, res, next) {
    try {
      const admin = await adminModel.findByEmail('nathanael@nutrimeal.id');
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin tidak ditemukan' });
      }
      res.status(200).json({
        success: true,
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
