require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import Middleware Error Handler
const { errorHandler, notFoundHandler } = require('./src/lib/errorHandler');

// Import Routes
const mealRoutes = require('./src/routes/mealRoutes');
const packageRoutes = require('./src/routes/packageRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const voucherRoutes = require('./src/routes/voucherRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const faqRoutes = require('./src/routes/faqRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. Middleware Global (Urutan Sesuai Soal UTS)
// ==========================================

// a. CORS - Izinkan origin frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// b. Express JSON Body Parser
app.use(express.json());

// c. Logger Request (Morgan)
app.use(morgan('dev'));

// ==========================================
// 2. Health Check Root
// ==========================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NutriMeal REST API Server Berjalan Normal',
    version: '1.0.0',
    documentation: {
      meals: '/api/meals',
      packages: '/api/packages',
      orders: '/api/orders',
      vouchers: '/api/vouchers',
      customers: '/api/customers',
      subscriptions: '/api/subscriptions',
      faqs: '/api/faqs',
    },
  });
});

// ==========================================
// 3. Pendaftaran Router
// ==========================================
app.use('/api/meals', mealRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/auth', authRoutes);

// ==========================================
// 4. Handler 404 (Membalas JSON)
// ==========================================
app.use(notFoundHandler);

// ==========================================
// 5. Error Handler 4 Parameter di Paling Akhir
// ==========================================
app.use(errorHandler);

// ==========================================
// 6. Jalankan Server
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server NutriMeal Backend berjalan pada port http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});
