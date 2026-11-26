const paymentModel = require('../model/paymentModel');

const paymentController = {
  // POST /api/payments/quote
  async quote(req, res, next) {
    try {
      const result = await paymentModel.calculateQuote({
        items: req.body?.items,
        package_id: req.body?.package_id,
        voucher_code: req.body?.voucher_code,
      });

      return res.status(200).json({
        success: true,
        data: {
          is_subscription: result.isSubscription,
          package_name: result.package_name,
          package_detail: result.package_detail,
          subtotal: result.subtotal,
          tax: result.tax,
          shipping_fee: result.shipping_fee,
          discount: result.discount,
          total: result.total,
          voucher_code: result.voucher ? result.voucher.code : null,
          items: result.items,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/payments/qris
  async createQris(req, res, next) {
    try {
      const data = await paymentModel.createQrisPayment({
        customerId: req.customerId,
        body: req.body || {},
      });

      return res.status(201).json({
        success: true,
        message: 'Kode QRIS dinamis berhasil dibuat.',
        data,
      });
    } catch (error) {
      if (error.errorCode || error.payment) {
        return res.status(error.statusCode || 400).json({
          success: false,
          code: error.errorCode || undefined,
          message: error.message,
          ...(error.payment ? { data: error.payment } : {}),
        });
      }
      next(error);
    }
  },

  // GET /api/payments/active
  async getActive(req, res, next) {
    try {
      const data = await paymentModel.getActivePayment(req.customerId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/payments/:id
  async getById(req, res, next) {
    try {
      const data = await paymentModel.getPaymentById({
        paymentId: req.params.id,
        customerId: req.customerId,
      });
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/payments/:id/cancel
  async cancel(req, res, next) {
    try {
      const data = await paymentModel.cancelPayment({
        paymentId: req.params.id,
        customerId: req.customerId,
      });
      return res.status(200).json({
        success: true,
        message: 'Pembayaran QRIS berhasil dibatalkan.',
        data,
      });
    } catch (error) {
      if (error.statusCode === 409 && error.payment) {
        return res.status(409).json({
          success: false,
          code: error.errorCode || undefined,
          message: error.message,
          data: error.payment,
        });
      }
      next(error);
    }
  },

  // POST /api/payments/notification (Midtrans Webhook)
  async webhook(req, res, next) {
    try {
      const data = await paymentModel.handleWebhookNotification(req.body || {});
      return res.status(200).json({
        success: true,
        message: 'Notifikasi pembayaran diproses.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentController;
