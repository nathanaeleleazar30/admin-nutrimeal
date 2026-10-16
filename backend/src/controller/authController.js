const adminModel = require('../model/adminModel');
const customerModel = require('../model/customerModel');
const { OAuth2Client } = require('google-auth-library');

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

        const token = `token_nutrimeal_${admin.id}_${Date.now()}`;
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

        const token = `token_customer_${customer.id}_${Date.now()}`;
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

  // GET /api/auth/me (Admin Info - baca dari token di header)
  async getMe(req, res, next) {
    try {
      const authHeader = req.headers.authorization || '';
      // Token format: token_nutrimeal_{adminId}_{timestamp}
      const match = authHeader.replace('Bearer ', '').match(/token_nutrimeal_(adm-[^_]+)/);
      if (!match || !match[1]) {
        return res.status(401).json({ success: false, message: 'Token tidak valid atau tidak ditemukan.' });
      }
      const admin = await adminModel.findById(match[1]);
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

  // POST /api/auth/google (Google Sign-In: Mobile Customer & Web Admin)
  async googleAuth(req, res, next) {
    try {
      const { idToken, email, name, googleId, photoUrl, forAdmin } = req.body;

      // Untuk Web Admin: wajib mengirimkan idToken Google yang nyata
      if (forAdmin && !idToken) {
        return res.status(400).json({
          success: false,
          message: 'Login Google Admin wajib menggunakan idToken Google yang valid.',
        });
      }

      let verifiedEmail = null;
      let verifiedName = name || null;
      let verifiedGoogleId = googleId || null;
      let verifiedAvatar = photoUrl || null;

      // 1. Verifikasi idToken Google secara resmi
      if (idToken) {
        try {
          const validAudiences = [
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
          verifiedEmail = payload.email;
          verifiedName = payload.name || payload.given_name || verifiedName;
          verifiedGoogleId = payload.sub;
          verifiedAvatar = payload.picture || verifiedAvatar;
        } catch (tokenErr) {
          // Token tidak valid
          return res.status(401).json({
            success: false,
            message: 'Google idToken tidak valid atau kedaluwarsa: ' + tokenErr.message,
          });
        }
      } else {
        // Tidak ada idToken — hanya boleh untuk mobile dengan email (non-admin)
        if (forAdmin) {
          return res.status(401).json({
            success: false,
            message: 'Login Google Admin wajib menggunakan idToken Google yang valid.',
          });
        }
        verifiedEmail = email || null;
      }

      // 2. Validasi minimal: email wajib ada setelah verifikasi
      if (!verifiedEmail) {
        return res.status(400).json({
          success: false,
          message: 'Data autentikasi Google tidak lengkap: email tidak ditemukan dari token.',
        });
      }

      // 3. Jika untuk Web Admin atau email adalah admin terdaftar
      const existingAdmin = await adminModel.findByEmail(verifiedEmail);
      if (existingAdmin || forAdmin) {
        let admin = existingAdmin;
        if (!admin) {
          admin = await adminModel.create({
            id: `adm-${Date.now()}`,
            name: verifiedName || 'Admin Google',
            email: verifiedEmail,
            password: 'google_oauth_managed',
            role: 'admin',
          });
        }

        const token = `token_nutrimeal_${admin.id}_${Date.now()}`;
        return res.status(200).json({
          success: true,
          message: 'Login Google Admin berhasil.',
          data: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token,
          },
        });
      }

      // 4. Cari atau buat customer di database untuk Mobile Customer
      const customer = await customerModel.findOrCreateGoogleUser({
        googleId: verifiedGoogleId,
        email: verifiedEmail,
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

      // 5. Generate token sesi login aplikasi mobile
      const token = `token_customer_${customer.id}_${Date.now()}`;

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

  // GET /api/auth/customer-me (Cek Sesi Customer Mobile)
  async getCustomerMe(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const customerId = req.query.id;

      let customer = null;
      if (customerId) {
        customer = await customerModel.getById(customerId);
      } else if (authHeader) {
        const match = authHeader.match(/token_customer_(cst-[0-9]+)/);
        if (match && match[1]) {
          customer = await customerModel.getById(match[1]);
        }
      }

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

      const token = `token_customer_${newCustomer.id}_${Date.now()}`;

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
