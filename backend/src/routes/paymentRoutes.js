const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const { requireCustomerAuth } = require('../middleware/authMiddleware');

// Webhook Midtrans dipanggil langsung oleh server Midtrans (diverifikasi via signature_key SHA-512)
router.post('/notification', paymentController.webhook);

// Endpoint pelanggan (wajib JWT customer; /active didaftarkan sebelum /:id)
router.post('/quote', requireCustomerAuth, paymentController.quote);
router.post('/qris', requireCustomerAuth, paymentController.createQris);
router.get('/active', requireCustomerAuth, paymentController.getActive);
router.get('/:id', requireCustomerAuth, paymentController.getById);
router.post('/:id/cancel', requireCustomerAuth, paymentController.cancel);

module.exports = router;
