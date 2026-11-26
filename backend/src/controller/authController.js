const adminModel = require('../model/adminModel');
const customerModel = require('../model/customerModel');
const { OAuth2Client } = require('google-auth-library');
const { signJwt, verifyJwt } = require('../lib/jwt');
const { ADMIN_ROLES, extractBearerToken } = require('../middleware/authMiddleware');

let googleOAuthClient = null;
if (process.env.GOOGLE_CLIENT_ID) {
  googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

const authController = {
  // POST /api/auth/login (Login Admin atau Customer)
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi.',
        });
      }

      const cleanEmail = email.toLowerCase().trim();

      // 1. Coba cari di akun Admin
      const admin = await adminModel.findByEmail(cleanEmail);
      if (admin) {
        // Verifikasi password admin
        if (admin.password !== password) {
          return res.status(401).json({
            success: false,
            message: 'Email atau password salah.',
          });
        }

        const token = signJwt({
          sub: admin.id,
          email: admin.email,
          role: admin.role || 'admin',
          type: 'admin',
        });
        return res.status(200).json({
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
      }

      // 2. Jika bukan admin, cek di akun Customer (Mobile App)
      const customer = await customerModel.findByEmail(cleanEmail);
      if (customer) {
        // Verifikasi password customer (hanya jika customer punya password yang cocok)
        if (!customer.password || customer.password !== password) {
          return res.status(401).json({
            success: false,
            message: 'Email atau password salah.',
          });
        }

        const token = signJwt({
          sub: customer.id,
          email: customer.email,
          role: 'customer',
          type: 'customer',
        });
        return res.status(200).json({
          success: true,
          message: 'Login berhasil.',
          data: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            role: 'customer',
            customer: {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              avatar_url: customer.avatar_url || null,
              height_cm: customer.height_cm,
              weight_kg: customer.weight_kg,
              age: customer.age,
              allergies: customer.allergies,
              dietary_goals: customer.dietary_goals,
              target_calories: customer.target_calories,
              two_factor_auth: customer.two_factor_auth,
              total_orders: customer.total_orders,
              total_spent: customer.total_spent,
              active_subscription: customer.active_subscription,
            },
            token,
          },
        });
      }

      // 3. Email tidak terdaftar baik di admin maupun customer
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me (Admin Info - baca & verifikasi JWT di header)
  async getMe(req, res, next) {
    try {
      const token = extractBearerToken(req);
      const payload = verifyJwt(token);
      if (!payload || !payload.sub || !ADMIN_ROLES.has(payload.role)) {
        return res.status(401).json({ success: false, message: 'Token admin tidak valid atau telah berakhir.' });
      }
      const admin = await adminModel.findById(payload.sub);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin tidak ditemukan.' });
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

  // POST /api/auth/google (Google Sign-In: Mobile Customer & Web Admin — wajib idToken)
  async googleAuth(req, res, next) {
    try {
      const { idToken, forAdmin } = req.body;

      // Wajib mengirimkan idToken Google yang valid untuk semua login Google
      if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Login Google wajib menyertakan idToken Google yang valid.',
        });
      }

      let verifiedEmail = null;
      let verifiedName = null;
      let verifiedGoogleId = null;
      let verifiedAvatar = null;

      try {
        const validAudiences = [
          '692683965471-fhlmrbkuf99b6mo2gh366vv18g50tpc2.apps.googleusercontent.com',
          '326249737628-v0qtts2k6an7pgap2r6qo70bk0n3r81j.apps.googleusercontent.com',
          '326249737628-2glmsskab2ds7pe1p4f76hff1sp45vh3.apps.googleusercontent.com',
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_ANDROID_CLIENT_ID,
        ].filter(Boolean);

        const client = googleOAuthClient || new OAuth2Client(validAudiences[0]);

        const ticket = await client.verifyIdToken({
          idToken,
          audience: validAudiences.length > 0 ? validAudiences : undefined,
        });

        const payload = ticket.getPayload();
        if (!payload || payload.email_verified === false) {
          return res.status(401).json({
            success: false,
            message: 'Email akun Google belum terverifikasi.',
          });
        }
        verifiedEmail = payload.email;
        verifiedName = payload.name || payload.given_name || null;
        verifiedGoogleId = payload.sub;
        verifiedAvatar = payload.picture || null;
      } catch (tokenErr) {
        return res.status(401).json({
          success: false,
          message: 'Google idToken tidak valid atau kedaluwarsa: ' + tokenErr.message,
        });
      }

      if (!verifiedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Data autentikasi Google tidak lengkap: email tidak ditemukan dari token.',
        });
      }

      // Untuk Web Admin: JANGAN membuat admin baru otomatis. Hanya izinkan admin terdaftar.
      const existingAdmin = await adminModel.findByEmail(verifiedEmail.toLowerCase().trim());
      if (forAdmin) {
        if (!existingAdmin) {
          return res.status(403).json({
            success: false,
            message: 'Akun Google Anda tidak terdaftar sebagai admin NutriMeal.',
          });
        }

        const token = signJwt({
          sub: existingAdmin.id,
          email: existingAdmin.email,
          role: existingAdmin.role || 'admin',
          type: 'admin',
        });
        return res.status(200).json({
          success: true,
          message: 'Login Google Admin berhasil.',
          data: {
            id: existingAdmin.id,
            name: existingAdmin.name,
            email: existingAdmin.email,
            role: existingAdmin.role,
            token,
          },
        });
      }

      // Cari atau buat customer di database untuk Mobile Customer
      const customer = await customerModel.findOrCreateGoogleUser({
        googleId: verifiedGoogleId,
        email: verifiedEmail.toLowerCase().trim(),
        name: verifiedName || 'Pengguna NutriMeal',
        avatarUrl: verifiedAvatar,
        phone: req.body.phone || '',
      });

      if (!customer) {
        return res.status(500).json({
          success: false,
          message: 'Gagal memproses data akun customer di database.',
        });
      }

      const token = signJwt({
        sub: customer.id,
        email: customer.email,
        role: 'customer',
        type: 'customer',
      });

      return res.status(200).json({
        success: true,
        message: 'Autentikasi Google berhasil.',
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            avatar_url: customer.avatar_url || verifiedAvatar || null,
            height_cm: customer.height_cm,
            weight_kg: customer.weight_kg,
            age: customer.age,
            allergies: customer.allergies,
            dietary_goals: customer.dietary_goals,
            target_calories: customer.target_calories,
            two_factor_auth: customer.two_factor_auth,
            total_orders: customer.total_orders,
            total_spent: customer.total_spent,
            active_subscription: customer.active_subscription,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/customer-me (Cek Sesi Customer Mobile - wajib JWT valid)
  async getCustomerMe(req, res, next) {
    try {
      const token = extractBearerToken(req);
      const payload = verifyJwt(token);
      if (!payload || !payload.sub || payload.role !== 'customer') {
        return res.status(401).json({
          success: false,
          message: 'Token sesi customer tidak valid atau telah berakhir.',
        });
      }

      const customer = await customerModel.getById(payload.sub);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer tidak ditemukan atau sesi telah berakhir.',
        });
      }

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/register (Daftar Admin Baru — Hanya untuk Superadmin)
  async registerAdmin(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nama, email, dan password wajib diisi.',
        });
      }

      // Cek apakah email sudah terdaftar
      const existing = await adminModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar sebagai admin.',
        });
      }

      const newAdmin = await adminModel.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role || 'admin',
      });

      return res.status(201).json({
        success: true,
        message: 'Akun admin berhasil dibuat.',
        data: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/customer-register (Daftar Customer Baru dari Mobile)
  async registerCustomer(req, res, next) {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nama, email, dan password wajib diisi.',
        });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = await customerModel.findByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan login menggunakan akun Anda.',
        });
      }

      const newCustomer = await customerModel.create({
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        password: password,
      });

      const token = signJwt({
        sub: newCustomer.id,
        email: newCustomer.email,
        role: 'customer',
        type: 'customer',
      });

      return res.status(201).json({
        success: true,
        message: 'Pendaftaran berhasil. Akun Anda telah tersimpan di sistem.',
        data: {
          customer: {
            id: newCustomer.id,
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            address: newCustomer.address,
            avatar_url: newCustomer.avatar_url || null,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
