const path = require('node:path');
const fs = require('node:fs');
const pool = require('./db');

let firebaseAdmin = null;
let isFirebaseReady = false;

// Inisialisasi Firebase Admin secara aman (tidak akan crash jika credentials belum diisi)
try {
  const admin = require('firebase-admin');
  const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH || path.join(__dirname, '..', '..', 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseAdmin = admin;
    isFirebaseReady = true;
    console.log('✅ [Firebase Admin] Berhasil diinisialisasi dengan Service Account Key.');
  } else if (process.env.FIREBASE_CONFIG) {
    admin.initializeApp();
    firebaseAdmin = admin;
    isFirebaseReady = true;
    console.log('✅ [Firebase Admin] Diinisialisasi dari Environment Variables.');
  } else {
    console.log('ℹ️ [Firebase Admin] serviceAccountKey.json belum ditemukan di folder backend. Push notification ke FCM akan di-mock dan tetap dicatat di tabel MySQL.');
  }
} catch (err) {
  console.log(`ℹ️ [Firebase Admin] Status: ${err.message}. Backend tetap berjalan normal.`);
}

const notificationService = {
  /**
   * Status ketersediaan Firebase Admin di backend
   */
  isReady() {
    return isFirebaseReady;
  },

  /**
   * Kirim push notification ke pelanggan spesifik dan simpan riwayat di database
   */
  async sendToCustomer({ customerId, title, body, route = '/notifikasi', type = 'pesanan' }) {
    if (!customerId || !title || !body) {
      throw new Error('customerId, title, dan body wajib diisi.');
    }

    // 1. Simpan riwayat notifikasi ke tabel notifications di MySQL
    let insertedId = null;
    try {
      const insertSql = `
        INSERT INTO notifications (customer_id, title, body, type, route, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, FALSE, NOW())
      `;
      const [res] = await pool.query(insertSql, [customerId, title, body, type, route]);
      insertedId = res.insertId;
    } catch (dbErr) {
      console.error('⚠️ [NotificationService] Gagal simpan ke DB notifications:', dbErr.message);
    }

    // 2. Ambil token FCM pelanggan dari database
    let fcmToken = null;
    try {
      const [rows] = await pool.query('SELECT fcm_token FROM customers WHERE id = ? LIMIT 1', [customerId]);
      fcmToken = rows[0]?.fcm_token;
    } catch (tokenErr) {
      console.error('⚠️ [NotificationService] Gagal ambil fcm_token customer:', tokenErr.message);
    }

    // 3. Kirim ke Firebase Cloud Messaging jika token dan admin tersedia
    let pushSent = false;
    if (fcmToken && isFirebaseReady && firebaseAdmin) {
      try {
        const message = {
          token: fcmToken,
          notification: {
            title,
            body,
          },
          data: {
            route: String(route),
            type: String(type),
            customerId: String(customerId),
          },
          android: {
            priority: 'high',
            notification: {
              channelId: 'high_importance_channel',
              sound: 'default',
            },
          },
        };

        const response = await firebaseAdmin.messaging().send(message);
        console.log(`🚀 [NotificationService] Push notification terkirim ke customer ${customerId}:`, response);
        pushSent = true;
      } catch (fcmErr) {
        console.error('❌ [NotificationService] Gagal kirim pesan FCM:', fcmErr.message);
      }
    } else {
      console.log(`🔔 [NotificationService (Lokal/Mock)] Pesan dicatat untuk Customer ${customerId}: "${title}" - "${body}" (FCM Ready: ${isFirebaseReady}, Token: ${fcmToken ? 'Ada' : 'Belum Ada'})`);
    }

    return {
      success: true,
      notificationId: insertedId,
      pushSent,
      hasToken: Boolean(fcmToken),
    };
  },

  /**
   * Broadcast notifikasi ke seluruh pelanggan
   */
  async broadcast({ title, body, route = '/notifikasi', type = 'promo' }) {
    try {
      const [customers] = await pool.query('SELECT id, fcm_token FROM customers');
      const results = [];

      for (const c of customers) {
        const res = await this.sendToCustomer({
          customerId: c.id,
          title,
          body,
          route,
          type,
        });
        results.push(res);
      }

      return {
        success: true,
        totalTargeted: customers.length,
        results,
      };
    } catch (err) {
      console.error('❌ [NotificationService] Gagal broadcast notifikasi:', err.message);
      throw err;
    }
  },
};

module.exports = notificationService;
