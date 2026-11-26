const crypto = require('node:crypto');
const defaultPool = require('../lib/db');
const defaultMidtrans = require('../lib/midtrans');
const defaultNotificationService = require('../lib/notificationService');

const SHIPPING_FEE_IDR = 10000;
const TAX_RATE = 0.05;
const QRIS_EXPIRY_MINUTES = 15;
const CREATING_STALE_MS = 10000;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value.trim());
}

function computeRequestHash({
  customerId,
  items,
  package_id,
  voucher_code,
  customer_phone,
  customer_address,
}) {
  const pkgId =
    typeof package_id === 'string' && package_id.trim().length > 0
      ? package_id.trim()
      : null;

  const qtyMap = new Map();
  if (!pkgId && Array.isArray(items)) {
    for (const rawItem of items) {
      const mealId =
        rawItem && typeof rawItem.meal_id === 'string'
          ? rawItem.meal_id.trim()
          : '';
      const qtyNum = Number(rawItem?.qty);
      if (mealId && Number.isFinite(qtyNum) && qtyNum > 0) {
        qtyMap.set(mealId, (qtyMap.get(mealId) || 0) + Math.round(qtyNum));
      }
    }
  }

  const normalizedItems = Array.from(qtyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([meal_id, qty]) => ({ meal_id, qty }));

  const canonical = JSON.stringify({
    customer_id: String(customerId || '').trim(),
    package_id: pkgId,
    items: normalizedItems,
    voucher_code:
      typeof voucher_code === 'string' && voucher_code.trim().length > 0
        ? voucher_code.trim().toUpperCase()
        : null,
    customer_phone: String(customer_phone || '').trim(),
    customer_address: String(customer_address || '').trim(),
  });

  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function createHttpError(statusCode, message, extra = {}) {
  const err = new Error(message);
  err.statusCode = statusCode;
  Object.assign(err, extra);
  return err;
}

function generateUniqueId(prefix) {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

function getTodayWibYmd(date = new Date()) {
  const wibMillis = date.getTime() + 7 * 60 * 60 * 1000;
  const d = new Date(wibMillis);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysYmd(ymdStr, daysToAdd) {
  const [y, m, d] = ymdStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + daysToAdd));
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDateYmd(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return getTodayWibYmd(new Date(val.getTime()));
  }
  const str = String(val).trim();
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : str;
}

function safeJsonParse(raw, fallback = null) {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(String(raw));
  } catch {
    return fallback;
  }
}

/**
 * Menghitung aturan jadwal langganan berdasarkan tipe paket:
 * - Bulanan: 30 hari kalender
 * - Mingguan: 5 hari (bila nama mencantumkan "5 Hari") atau 7 hari kalender
 * - Harian: 1 hari
 * - Prasmanan / Event: null (pesanan event satu kali, tidak membuat row subscription berulang)
 */
function computeSubscriptionSchedule(pkg, now = new Date()) {
  if (!pkg) return null;
  const pkgType = String(pkg.type || 'Mingguan').trim();
  if (pkgType === 'Prasmanan / Event') {
    return null;
  }

  let totalDays = 7;
  if (pkgType === 'Harian') {
    totalDays = 1;
  } else if (pkgType === 'Bulanan') {
    totalDays = 30;
  } else if (pkgType === 'Mingguan') {
    const lowerName = String(pkg.name || '').toLowerCase();
    totalDays = lowerName.includes('5 hari') ? 5 : 7;
  }

  const startDate = getTodayWibYmd(now);
  const endDate = addDaysYmd(startDate, totalDays - 1);

  const portionsLower = String(pkg.portions || '').toLowerCase();
  let mealSlot = 'Siang & Malam';
  if (portionsLower.includes('full day') || portionsLower.includes('3x')) {
    mealSlot = 'Full Day (3x)';
  } else if (portionsLower.includes('makan siang') && !portionsLower.includes('malam')) {
    mealSlot = 'Makan Siang';
  } else if (portionsLower.includes('makan malam') && !portionsLower.includes('siang')) {
    mealSlot = 'Makan Malam';
  }

  const deliveryTimeSlot =
    mealSlot === 'Makan Malam'
      ? '17.00 – 18.30 WIB (Slot Sore)'
      : '11.30 – 13.00 WIB (Slot Utama)';

  return {
    total_days: totalDays,
    days_remaining: totalDays,
    start_date: startDate,
    end_date: endDate,
    meal_slot: mealSlot,
    delivery_time_slot: deliveryTimeSlot,
  };
}

function mapMidtransToPaymentStatus(midtransData) {
  const txStatus = String(midtransData?.transaction_status || '').toLowerCase();
  const fraudStatus = String(midtransData?.fraud_status || '').toLowerCase();

  if (txStatus === 'settlement') return 'paid';
  if (txStatus === 'capture') {
    if (!fraudStatus || fraudStatus === 'accept') return 'paid';
    if (fraudStatus === 'deny') return 'failed';
    return 'pending';
  }
  if (txStatus === 'expire') return 'expired';
  if (txStatus === 'cancel') return 'cancelled';
  if (txStatus === 'deny' || txStatus === 'failure') return 'failed';
  return 'pending';
}

function formatPaymentResponse(paymentRow, extra = {}) {
  const snapshot = safeJsonParse(paymentRow.request_snapshot, {});
  const breakdown = snapshot.breakdown || {
    subtotal: Number(paymentRow.gross_amount),
    tax: 0,
    shipping_fee: 0,
    discount: 0,
    total: Number(paymentRow.gross_amount),
  };

  let expiresAtIso = null;
  if (paymentRow.expires_at) {
    const dt =
      paymentRow.expires_at instanceof Date
        ? paymentRow.expires_at
        : new Date(paymentRow.expires_at);
    if (!Number.isNaN(dt.getTime())) {
      expiresAtIso = dt.toISOString();
    }
  }

  let paidAtIso = null;
  if (paymentRow.paid_at) {
    const dt =
      paymentRow.paid_at instanceof Date
        ? paymentRow.paid_at
        : new Date(paymentRow.paid_at);
    if (!Number.isNaN(dt.getTime())) {
      paidAtIso = dt.toISOString();
    }
  }

  return {
    payment_id: paymentRow.id,
    order_id: paymentRow.order_id,
    provider_order_id: paymentRow.provider_order_id,
    transaction_id: paymentRow.transaction_id || null,
    amount: Math.round(Number(paymentRow.gross_amount)),
    subtotal: Math.round(Number(breakdown.subtotal ?? paymentRow.gross_amount)),
    tax: Math.round(Number(breakdown.tax ?? 0)),
    shipping_fee: Math.round(Number(breakdown.shipping_fee ?? 0)),
    discount: Math.round(Number(breakdown.discount ?? 0)),
    voucher_code: snapshot.voucher_code || null,
    cart_signature: snapshot.cart_signature || null,
    is_subscription: Boolean(snapshot.is_subscription),
    package_name: snapshot.package_name || snapshot.order_summary?.package_name || 'Pesanan NutriMeal',
    package_detail: snapshot.order_summary?.package_detail || null,
    first_meal_name: snapshot.order_summary?.first_meal_name || 'Menu Sehat NutriMeal',
    first_meal_image: snapshot.order_summary?.first_meal_image || '',
    customer_address: snapshot.delivery?.customer_address || '',
    delivery_time: snapshot.order_summary?.delivery_schedule || '11:30 - 13:00 WIB',
    items: snapshot.items || [],
    qr_string: paymentRow.qr_string || null,
    qr_url: paymentRow.qr_url || null,
    expires_at: expiresAtIso,
    paid_at: paidAtIso,
    server_time: new Date().toISOString(),
    status: paymentRow.status,
    payment_status:
      paymentRow.status === 'paid'
        ? 'Lunas'
        : paymentRow.status === 'expired'
          ? 'Kedaluwarsa'
          : paymentRow.status === 'cancelled' || paymentRow.status === 'failed'
            ? 'Dibatalkan'
            : 'Menunggu Pembayaran',
    ...extra,
  };
}

function createPaymentModel({
  pool = defaultPool,
  midtrans = defaultMidtrans,
  notificationService = defaultNotificationService,
} = {}) {
  async function calculateQuote({ items, package_id, voucher_code }, queryExecutor = pool) {
    const hasItems = Array.isArray(items) && items.length > 0;
    const hasPackage = typeof package_id === 'string' && package_id.trim().length > 0;

    if (!hasItems && !hasPackage) {
      throw createHttpError(400, 'Pilih minimal 1 menu keranjang atau 1 paket langganan.');
    }
    if (hasItems && hasPackage) {
      throw createHttpError(400, 'Tidak dapat menggabungkan checkout menu keranjang dan paket langganan sekaligus.');
    }

    const cleanVoucherCode =
      typeof voucher_code === 'string' && voucher_code.trim().length > 0
        ? voucher_code.trim().toUpperCase()
        : null;

    if (hasPackage) {
      if (cleanVoucherCode) {
        throw createHttpError(400, 'Kode voucher tidak berlaku untuk pembelian paket langganan.');
      }

      const [pkgRows] = await queryExecutor.query(
        'SELECT * FROM packages WHERE id = ? LIMIT 1',
        [package_id.trim()]
      );
      const pkg = pkgRows && pkgRows[0];
      if (!pkg) {
        throw createHttpError(404, `Paket langganan "${package_id.trim()}" tidak ditemukan.`);
      }

      const total = Math.round(Number(pkg.price));
      if (!Number.isFinite(total) || total <= 0) {
        throw createHttpError(400, 'Total pembayaran paket harus lebih dari Rp 0 untuk QRIS.');
      }

      return {
        isSubscription: true,
        package: pkg,
        items: [],
        voucher: null,
        subtotal: total,
        tax: 0,
        shipping_fee: 0,
        discount: 0,
        total,
        portions_count: 1,
        package_name: pkg.name,
        package_detail: pkg.portions || pkg.type || 'Paket Langganan NutriMeal',
        first_meal_name: pkg.name,
        first_meal_image: '',
        itemDetails: [
          {
            id: String(pkg.id).slice(0, 50),
            name: String(pkg.name).slice(0, 50),
            price: total,
            quantity: 1,
          },
        ],
      };
    }

    // Validasi dan gabungkan qty item menu
    const qtyByMealId = new Map();
    for (const rawItem of items) {
      const mealId = rawItem && typeof rawItem.meal_id === 'string' ? rawItem.meal_id.trim() : '';
      const qtyNum = Number(rawItem?.qty);
      if (!mealId || !Number.isInteger(qtyNum) || qtyNum < 1) {
        throw createHttpError(400, 'Setiap item menu wajib memiliki meal_id valid dan qty bilangan bulat >= 1.');
      }
      qtyByMealId.set(mealId, (qtyByMealId.get(mealId) || 0) + qtyNum);
    }

    const mealIds = Array.from(qtyByMealId.keys());
    const placeholders = mealIds.map(() => '?').join(', ');
    const [mealRows] = await queryExecutor.query(
      `SELECT id, name, category, calories, price, image_url, delivery_time, is_available FROM meals WHERE id IN (${placeholders})`,
      mealIds
    );

    const mealMap = new Map((mealRows || []).map((m) => [String(m.id), m]));
    const resolvedItems = [];
    let subtotal = 0;
    let totalPortions = 0;

    for (const mealId of mealIds) {
      const meal = mealMap.get(mealId);
      if (!meal) {
        throw createHttpError(400, `Menu dengan ID "${mealId}" tidak ditemukan di sistem.`);
      }
      if (!Number(meal.is_available)) {
        throw createHttpError(400, `Menu "${meal.name}" sedang tidak tersedia saat ini.`);
      }

      const qty = qtyByMealId.get(mealId);
      const unitPrice = Math.round(Number(meal.price));
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw createHttpError(400, `Harga menu "${meal.name}" tidak valid.`);
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;
      totalPortions += qty;
      resolvedItems.push({
        meal_id: String(meal.id),
        name: String(meal.name),
        unit_price: unitPrice,
        qty,
        line_total: lineTotal,
        image_url: meal.image_url || '',
        delivery_time: meal.delivery_time || '12:00 - 13:00 WIB',
      });
    }

    const tax = Math.round(subtotal * TAX_RATE);
    const shippingFee = SHIPPING_FEE_IDR;
    let discount = 0;
    let appliedVoucher = null;

    if (cleanVoucherCode) {
      const [vocRows] = await queryExecutor.query(
        'SELECT * FROM vouchers WHERE code = ? LIMIT 1',
        [cleanVoucherCode]
      );
      const voucher = vocRows && vocRows[0];
      if (!voucher || !Number(voucher.is_active)) {
        throw createHttpError(400, `Kode voucher "${cleanVoucherCode}" tidak ditemukan atau tidak aktif.`);
      }

      const validUntilYmd = normalizeDateYmd(voucher.valid_until);
      const todayYmd = getTodayWibYmd();
      if (validUntilYmd && validUntilYmd < todayYmd) {
        throw createHttpError(400, `Masa berlaku voucher "${cleanVoucherCode}" sudah berakhir.`);
      }

      const usedCount = Number(voucher.used_count || 0);
      const quota = Number(voucher.quota || 0);
      if (usedCount >= quota) {
        throw createHttpError(400, `Kuota voucher "${cleanVoucherCode}" telah habis.`);
      }

      const minSpend = Math.round(Number(voucher.min_spend || 0));
      if (subtotal < minSpend) {
        throw createHttpError(
          400,
          `Subtotal belanja (Rp ${subtotal.toLocaleString('id-ID')}) belum memenuhi minimum transaksi voucher Rp ${minSpend.toLocaleString('id-ID')}.`
        );
      }

      const dtype = String(voucher.discount_type || 'nominal').toLowerCase();
      const dval = Math.round(Number(voucher.discount_value || 0));
      const maxDisc = voucher.max_discount ? Math.round(Number(voucher.max_discount)) : 0;

      if (dtype === 'percent') {
        discount = Math.round(subtotal * (dval / 100));
        if (maxDisc > 0 && discount > maxDisc) {
          discount = maxDisc;
        }
      } else if (dtype === 'free_shipping') {
        discount = dval > 0 ? Math.min(shippingFee, dval) : shippingFee;
      } else {
        // 'nominal' dan 'cashback' mengurangi total seperti perilaku aplikasi saat ini
        discount = dval;
      }

      const preDiscountTotal = subtotal + tax + shippingFee;
      discount = Math.max(0, Math.min(Math.round(discount), preDiscountTotal));
      appliedVoucher = voucher;
    }

    const total = Math.max(0, subtotal + tax + shippingFee - discount);
    if (total <= 0) {
      throw createHttpError(
        400,
        'Total pembayaran Rp 0 tidak dapat menggunakan QRIS. Silakan sesuaikan pesanan atau voucher.'
      );
    }

    const itemDetails = resolvedItems.map((it) => ({
      id: it.meal_id.slice(0, 50),
      name: it.name.slice(0, 50),
      price: it.unit_price,
      quantity: it.qty,
    }));

    if (tax > 0) {
      itemDetails.push({
        id: 'TAX-PB1',
        name: 'Est. Pajak (PB1 5%)',
        price: tax,
        quantity: 1,
      });
    }
    if (shippingFee > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        name: 'Ongkos Kirim',
        price: shippingFee,
        quantity: 1,
      });
    }
    if (discount > 0 && appliedVoucher) {
      itemDetails.push({
        id: `VOC-${appliedVoucher.code}`.slice(0, 50),
        name: `Diskon ${appliedVoucher.code}`.slice(0, 50),
        price: -discount,
        quantity: 1,
      });
    }

    const packageSummary = resolvedItems.map((it) => `${it.qty}x ${it.name}`).join(', ');
    const firstItem = resolvedItems[0];

    return {
      isSubscription: false,
      package: null,
      items: resolvedItems,
      voucher: appliedVoucher,
      subtotal,
      tax,
      shipping_fee: shippingFee,
      discount,
      total,
      portions_count: totalPortions,
      package_name: packageSummary.slice(0, 150),
      package_detail: `${totalPortions} Porsi Menu Katering`,
      first_meal_name: firstItem.name,
      first_meal_image: firstItem.image_url,
      itemDetails,
    };
  }

  async function syncPaymentStatus({ paymentId, providerOrderId, midtransData }) {
    const conn = await pool.getConnection();
    let updatedRow = null;
    let shouldSendPaidNotification = false;
    let notificationPayload = null;

    try {
      await conn.beginTransaction();

      let paymentSql = 'SELECT * FROM payments WHERE ';
      let paymentParam;
      if (paymentId) {
        paymentSql += 'id = ? FOR UPDATE';
        paymentParam = paymentId;
      } else {
        paymentSql += 'provider_order_id = ? FOR UPDATE';
        paymentParam = providerOrderId;
      }

      const [payRows] = await conn.query(paymentSql, [paymentParam]);
      const payment = payRows && payRows[0];
      if (!payment) {
        await conn.rollback();
        throw createHttpError(404, 'Data pembayaran tidak ditemukan.');
      }

      const [orderRows] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [
        payment.order_id,
      ]);
      const order = orderRows && orderRows[0];

      // Jangan pernah menurunkan status jika sudah paid (guard terhadap notifikasi lama)
      if (payment.status === 'paid') {
        await conn.commit();
        return payment;
      }

      const nextStatus = mapMidtransToPaymentStatus(midtransData);
      const rawJsonStr = JSON.stringify(midtransData || {});
      const incomingTxId = midtransData?.transaction_id || payment.transaction_id || null;

      if (nextStatus === 'paid') {
        // Cocokkan nominal dengan DB bila gross_amount dikirim Midtrans
        if (midtransData?.gross_amount !== undefined && midtransData?.gross_amount !== null) {
          const midtransAmount = Math.round(Number(midtransData.gross_amount));
          if (midtransAmount !== Math.round(Number(payment.gross_amount))) {
            await conn.rollback();
            throw createHttpError(
              400,
              `Nominal Midtrans (${midtransAmount}) tidak cocok dengan tagihan database (${payment.gross_amount}).`
            );
          }
        }

        await conn.query(
          `UPDATE payments
           SET status = 'paid',
               paid_at = COALESCE(paid_at, NOW()),
               transaction_id = COALESCE(?, transaction_id),
               raw_response = ?
           WHERE id = ?`,
          [incomingTxId, rawJsonStr, payment.id]
        );

        await conn.query(
          `UPDATE orders
           SET payment_status = 'Lunas',
               status = CASE WHEN status = 'Menunggu Pembayaran' THEN 'Diterima' ELSE status END
           WHERE id = ?`,
          [payment.order_id]
        );

        if (payment.customer_id) {
          await conn.query(
            `UPDATE customers
             SET total_orders = total_orders + 1,
                 total_spent = total_spent + ?
             WHERE id = ?`,
            [Math.round(Number(payment.gross_amount)), payment.customer_id]
          );
        }

        const snapshot = safeJsonParse(payment.request_snapshot, {});

        // Tambah used_count voucher tepat SEKALI saat settlement
        if (snapshot.voucher_id) {
          await conn.query(
            'UPDATE vouchers SET used_count = used_count + 1 WHERE id = ? AND used_count < quota',
            [snapshot.voucher_id]
          );
        }

        // Buat subscription bila paket langganan tepat SEKALI
        if (snapshot.is_subscription && snapshot.package && payment.customer_id) {
          const schedule = snapshot.subscription_schedule || computeSubscriptionSchedule(snapshot.package);
          if (schedule) {
            const subId = generateUniqueId('SUB');
            const customerName = order?.customer_name || snapshot.delivery?.customer_name || 'Pelanggan NutriMeal';
            const customerPhone = order?.customer_phone || snapshot.delivery?.customer_phone || '';
            const customerAddress = order?.customer_address || snapshot.delivery?.customer_address || '';

            await conn.query(
              `INSERT INTO subscriptions (
                id, customer_id, customer_name, customer_phone, package_name,
                meal_slot, delivery_time_slot, start_date, end_date,
                days_remaining, total_days, status, pause_reason, auto_renew, address
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif', NULL, 1, ?)`,
              [
                subId,
                payment.customer_id,
                customerName,
                customerPhone,
                snapshot.package.name,
                schedule.meal_slot,
                schedule.delivery_time_slot,
                schedule.start_date,
                schedule.end_date,
                schedule.days_remaining,
                schedule.total_days,
                customerAddress,
              ]
            );

            await conn.query(
              'UPDATE customers SET active_subscription = ? WHERE id = ?',
              [snapshot.package.name, payment.customer_id]
            );
          }
        }

        shouldSendPaidNotification = Boolean(payment.customer_id);
        if (shouldSendPaidNotification) {
          notificationPayload = {
            customerId: payment.customer_id,
            title: snapshot.is_subscription
              ? `Langganan Aktif! (#${payment.order_id})`
              : `Pembayaran Diterima! (#${payment.order_id})`,
            body: snapshot.is_subscription
              ? `Paket ${snapshot.package_name || 'Langganan NutriMeal'} berhasil diaktifkan setelah pembayaran QRIS terverifikasi.`
              : `Pembayaran Rp ${Math.round(Number(payment.gross_amount)).toLocaleString('id-ID')} untuk ${snapshot.package_name || 'pesanan NutriMeal'} telah lunas dan diteruskan ke dapur.`,
            route: snapshot.is_subscription ? '/langganan-saya' : '/order-tracking',
            type: snapshot.is_subscription ? 'subscription' : 'pesanan',
          };
        }
      } else if (
        (nextStatus === 'expired' || nextStatus === 'cancelled' || nextStatus === 'failed') &&
        (payment.status === 'pending' || payment.status === 'creating')
      ) {
        const orderPaymentStatus = nextStatus === 'expired' ? 'Kedaluwarsa' : 'Dibatalkan';

        await conn.query(
          `UPDATE payments
           SET status = ?,
               transaction_id = COALESCE(?, transaction_id),
               raw_response = ?
           WHERE id = ?`,
          [nextStatus, incomingTxId, rawJsonStr, payment.id]
        );

        await conn.query(
          `UPDATE orders
           SET status = CASE WHEN status = 'Menunggu Pembayaran' THEN 'Dibatalkan' ELSE status END,
               payment_status = ?
           WHERE id = ?`,
          [orderPaymentStatus, payment.order_id]
        );
      } else {
        // Status masih pending → simpan raw_response terbaru saja
        await conn.query(
          `UPDATE payments
           SET transaction_id = COALESCE(?, transaction_id),
               raw_response = ?
           WHERE id = ?`,
          [incomingTxId, rawJsonStr, payment.id]
        );
      }

      const [freshRows] = await conn.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [
        payment.id,
      ]);
      updatedRow = freshRows[0];

      await conn.commit();
    } catch (err) {
      try {
        await conn.rollback();
      } catch (_) {}
      throw err;
    } finally {
      conn.release();
    }

    // Kirim notifikasi setelah transaksi commit sukses (maksimal SEKALI)
    if (shouldSendPaidNotification && notificationPayload) {
      try {
        await notificationService.sendToCustomer(notificationPayload);
      } catch (notifErr) {
        console.error('⚠️ [PaymentModel] Gagal kirim notifikasi pembayaran lunas:', notifErr.message);
      }
    }

    return updatedRow;
  }

  async function persistPendingChargeResult(paymentId, chargeResult) {
    const expiresAt =
      chargeResult.expiryTime || new Date(Date.now() + QRIS_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      `UPDATE payments
       SET status = 'pending',
           transaction_id = COALESCE(?, transaction_id),
           qr_string = ?,
           qr_url = ?,
           expires_at = ?,
           raw_response = ?
       WHERE id = ? AND status IN ('creating', 'pending')`,
      [
        chargeResult.transactionId || null,
        chargeResult.qrString || null,
        chargeResult.qrUrl || null,
        expiresAt,
        JSON.stringify(chargeResult.rawResponse || {}),
        paymentId,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [paymentId]);
    return rows && rows[0];
  }

  async function markPaymentFailedAndCancelOrder(paymentRow, reasonPayload) {
    await pool.query(
      `UPDATE payments SET status = 'failed', raw_response = ? WHERE id = ? AND status IN ('creating', 'pending')`,
      [JSON.stringify(reasonPayload || {}), paymentRow.id]
    );
    await pool.query(
      `UPDATE orders
       SET status = CASE WHEN status = 'Menunggu Pembayaran' THEN 'Dibatalkan' ELSE status END,
           payment_status = CASE WHEN payment_status = 'Menunggu Pembayaran' THEN 'Dibatalkan' ELSE payment_status END
       WHERE id = ?`,
      [paymentRow.order_id]
    );
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [paymentRow.id]);
    return (rows && rows[0]) || { ...paymentRow, status: 'failed' };
  }

  function extractQrFromStatusData(data) {
    if (!data || typeof data !== 'object') return { qrString: null, qrUrl: null };
    const actions = Array.isArray(data.actions) ? data.actions : [];
    const qrAction =
      actions.find((a) => a.name === 'generate-qr-code') ||
      actions.find((a) => a.name === 'generate-qr-code-v2') ||
      null;
    return {
      qrString: data.qr_string || null,
      qrUrl: qrAction?.url || null,
    };
  }

  async function attemptRecoveryOrSafePending({ paymentRow, chargePayload, initialError }) {
    // 1. Coba ulang sekali dengan Midtrans Idempotency-Key & body yang persis sama
    try {
      const retryRes = await midtrans.chargeQris({
        ...chargePayload,
        idempotencyKey: paymentRow.midtrans_idempotency_key,
      });

      if (!retryRes.isPending202 && (retryRes.qrString || retryRes.qrUrl)) {
        const updated = await persistPendingChargeResult(paymentRow.id, retryRes);
        return updated;
      }

      if (retryRes.transactionStatus === 'settlement' || retryRes.transactionStatus === 'capture') {
        return syncPaymentStatus({
          paymentId: paymentRow.id,
          midtransData: retryRes.rawResponse,
        });
      }
    } catch (retryErr) {
      if (retryErr?.httpStatus && retryErr.httpStatus >= 400 && retryErr.httpStatus < 500 && !retryErr.isAmbiguous) {
        const failed = await markPaymentFailedAndCancelOrder(paymentRow, {
          error: retryErr.message,
          midtransData: retryErr.midtransData || null,
        });
        throw createHttpError(retryErr.httpStatus, retryErr.message, {
          errorCode: 'PAYMENT_CLOSED',
          payment: formatPaymentResponse(failed),
        });
      }
    }

    // 2. Periksa status transaksi di Midtrans sebelum mengambil keputusan status
    try {
      const statusRes = await midtrans.getTransactionStatus(paymentRow.provider_order_id);

      if (statusRes.httpStatus === 404) {
        await markPaymentFailedAndCancelOrder(paymentRow, {
          error: initialError?.message || 'Transaksi belum tercatat di Midtrans.',
        });
        throw createHttpError(
          502,
          initialError?.message || 'Gagal terhubung ke Midtrans saat membuat QRIS. Silakan coba lagi.'
        );
      }

      if (statusRes.httpStatus === 200 && statusRes.data) {
        const mapped = mapMidtransToPaymentStatus(statusRes.data);
        if (mapped === 'paid') {
          return syncPaymentStatus({ paymentId: paymentRow.id, midtransData: statusRes.data });
        }
        if (mapped === 'expired' || mapped === 'cancelled' || mapped === 'failed') {
          const synced = await syncPaymentStatus({ paymentId: paymentRow.id, midtransData: statusRes.data });
          throw createHttpError(409, 'Transaksi QRIS sudah ditutup oleh Midtrans.', {
            errorCode: 'PAYMENT_CLOSED',
            payment: formatPaymentResponse(synced),
          });
        }

        const extracted = extractQrFromStatusData(statusRes.data);
        if (extracted.qrString || extracted.qrUrl) {
          return persistPendingChargeResult(paymentRow.id, {
            transactionId: statusRes.data.transaction_id || null,
            qrString: extracted.qrString,
            qrUrl: extracted.qrUrl,
            expiryTime: midtrans.parseMidtransExpiryToDate?.(statusRes.data.expiry_time) || null,
            rawResponse: statusRes.data,
          });
        }

        // Data QR tidak dapat dipulihkan dari Midtrans -> coba batalkan di Midtrans lalu konfirmasi
        try {
          const cancelRes = await midtrans.cancelTransaction(paymentRow.provider_order_id);
          const cancelCode = Number(cancelRes?.data?.status_code || cancelRes?.httpStatus);
          if (cancelRes?.httpStatus >= 200 && cancelRes.httpStatus < 300 && cancelCode < 400) {
            const cancelledRow = await syncPaymentStatus({
              paymentId: paymentRow.id,
              midtransData: {
                ...cancelRes.data,
                transaction_status: cancelRes.data?.transaction_status || 'cancel',
              },
            });
            throw createHttpError(
              502,
              'Data QRIS tidak lengkap dari Midtrans dan transaksi telah dibatalkan.',
              {
                errorCode: 'PAYMENT_CLOSED',
                payment: formatPaymentResponse(cancelledRow),
              }
            );
          }
        } catch (cancelErr) {
          if (cancelErr.errorCode === 'PAYMENT_CLOSED') throw cancelErr;
        }
      }
    } catch (recErr) {
      if (recErr.statusCode) throw recErr;
    }

    // Tidak bisa memastikan kegagalan -> jangan paksa failed; biarkan creating agar direkonsiliasi
    throw createHttpError(
      409,
      'Permintaan pembayaran masih diproses oleh Midtrans. Coba periksa beberapa saat lagi.',
      { errorCode: 'PAYMENT_PROCESSING' }
    );
  }

  async function reconcileStuckCreatingPayment(paymentRow) {
    const snapshot = safeJsonParse(paymentRow.request_snapshot, {});
    const chargePayload = snapshot?.midtrans_charge_payload || null;

    const statusRes = await midtrans.getTransactionStatus(paymentRow.provider_order_id);
    if (statusRes.httpStatus === 404) {
      return markPaymentFailedAndCancelOrder(paymentRow, {
        error: 'Stale creating record tidak ditemukan di Midtrans (404).',
      });
    }

    if (statusRes.httpStatus === 200 && statusRes.data) {
      const mapped = mapMidtransToPaymentStatus(statusRes.data);
      if (mapped !== 'pending') {
        return syncPaymentStatus({ paymentId: paymentRow.id, midtransData: statusRes.data });
      }

      const extracted = extractQrFromStatusData(statusRes.data);
      if (extracted.qrString || extracted.qrUrl) {
        return persistPendingChargeResult(paymentRow.id, {
          transactionId: statusRes.data.transaction_id || null,
          qrString: extracted.qrString,
          qrUrl: extracted.qrUrl,
          expiryTime: midtrans.parseMidtransExpiryToDate?.(statusRes.data.expiry_time) || null,
          rawResponse: statusRes.data,
        });
      }

      if (chargePayload && paymentRow.midtrans_idempotency_key) {
        try {
          const retryCharge = await midtrans.chargeQris({
            ...chargePayload,
            idempotencyKey: paymentRow.midtrans_idempotency_key,
          });
          if (!retryCharge.isPending202 && (retryCharge.qrString || retryCharge.qrUrl)) {
            return persistPendingChargeResult(paymentRow.id, retryCharge);
          }
        } catch (_) {}
      }

      // Masih pending tanpa QR yang bisa dipulihkan -> batalkan aman di Midtrans
      try {
        const cancelRes = await midtrans.cancelTransaction(paymentRow.provider_order_id);
        const cancelCode = Number(cancelRes?.data?.status_code || cancelRes?.httpStatus);
        if (cancelRes?.httpStatus >= 200 && cancelRes.httpStatus < 300 && cancelCode < 400) {
          return syncPaymentStatus({
            paymentId: paymentRow.id,
            midtransData: {
              ...cancelRes.data,
              transaction_status: cancelRes.data?.transaction_status || 'cancel',
            },
          });
        }
      } catch (_) {}
    }

    return paymentRow;
  }

  async function resolveExistingIdempotentPayment({ existing, requestHash, customerId }) {
    if (existing.customer_id !== customerId) {
      throw createHttpError(403, 'Idempotency key ini milik pelanggan lain.');
    }

    if (existing.request_hash && existing.request_hash !== requestHash) {
      throw createHttpError(
        422,
        'Idempotency key sudah digunakan untuk keranjang/data checkout yang berbeda.',
        { errorCode: 'IDEMPOTENCY_MISMATCH' }
      );
    }

    let current = existing;
    if (current.status === 'creating') {
      const createdAtMs = current.created_at ? new Date(current.created_at).getTime() : Date.now();
      const ageMs = Date.now() - (Number.isNaN(createdAtMs) ? Date.now() : createdAtMs);

      if (ageMs < CREATING_STALE_MS) {
        throw createHttpError(
          409,
          'Pembayaran untuk permintaan ini sedang diproses. Silakan coba lagi sebentar.',
          { errorCode: 'PAYMENT_PROCESSING' }
        );
      }

      try {
        current = await reconcileStuckCreatingPayment(current);
      } catch (_) {
        throw createHttpError(
          409,
          'Pembayaran masih menunggu konfirmasi Midtrans.',
          { errorCode: 'PAYMENT_PROCESSING' }
        );
      }

      if (current.status === 'creating') {
        throw createHttpError(
          409,
          'Pembayaran masih menunggu konfirmasi Midtrans.',
          { errorCode: 'PAYMENT_PROCESSING' }
        );
      }
    }

    if (current.status === 'pending' || current.status === 'paid') {
      return formatPaymentResponse(current);
    }

    throw createHttpError(
      409,
      'Transaksi QRIS untuk key ini sudah dibatalkan, kedaluwarsa, atau gagal.',
      {
        errorCode: 'PAYMENT_CLOSED',
        payment: formatPaymentResponse(current),
      }
    );
  }

  async function createQrisPayment({ customerId, body }) {
    const idempotencyKey =
      typeof body?.idempotency_key === 'string' ? body.idempotency_key.trim() : '';

    if (!isValidUuid(idempotencyKey)) {
      throw createHttpError(
        400,
        'Field idempotency_key wajib berformat UUID v4 yang valid.'
      );
    }

    const customerPhone = String(body?.customer_phone || '').trim();
    const customerAddress = String(body?.customer_address || '').trim();
    if (!customerPhone || customerPhone.length < 6) {
      throw createHttpError(400, 'Nomor WhatsApp/telepon penerima wajib diisi dengan benar.');
    }
    if (!customerAddress || customerAddress.length < 5 || customerAddress.includes('Belum ada alamat')) {
      throw createHttpError(400, 'Alamat lengkap pengiriman wajib diisi.');
    }

    const requestHash = computeRequestHash({
      customerId,
      items: body?.items,
      package_id: body?.package_id,
      voucher_code: body?.voucher_code,
      customer_phone: customerPhone,
      customer_address: customerAddress,
    });

    // 1. Cek idempotency key milik customer ini lebih dulu
    const [existingRows] = await pool.query(
      'SELECT * FROM payments WHERE customer_id = ? AND idempotency_key = ? LIMIT 1',
      [customerId, idempotencyKey]
    );
    const existing = existingRows && existingRows[0];
    if (existing) {
      return resolveExistingIdempotentPayment({ existing, requestHash, customerId });
    }

    // 2. Ambil data pelanggan dari DB + hitung rincian nominal dari DB
    const [custRows] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [customerId]);
    const customer = custRows && custRows[0];
    if (!customer) {
      throw createHttpError(404, 'Akun pelanggan tidak ditemukan.');
    }

    const customerName = String(body?.customer_name || customer.name || 'Pelanggan NutriMeal').trim();
    const quote = await calculateQuote({
      items: body?.items,
      package_id: body?.package_id,
      voucher_code: body?.voucher_code,
    });

    const subscriptionSchedule = quote.isSubscription
      ? computeSubscriptionSchedule(quote.package)
      : null;

    const orderId = generateUniqueId('ORD');
    const paymentId = generateUniqueId('PAY');
    const providerOrderId = orderId;
    const midtransIdempotencyKey = crypto.randomUUID();

    const deliverySchedule = String(
      body?.delivery_schedule ||
        (quote.isSubscription ? 'Senin, 11:30 WIB (Makan Siang & Malam)' : '11:30 - 13:00 WIB')
    );
    const deliveryBatch = body?.delivery_batch === 'Sore/Malam' ? 'Sore/Malam' : 'Pagi/Siang';
    const day = String(body?.day || 'Senin');

    const chargePayload = {
      orderId: providerOrderId,
      grossAmount: quote.total,
      itemDetails: quote.itemDetails,
      customerDetails: {
        first_name: customerName,
        email: customer.email || undefined,
        phone: customerPhone,
      },
      expiryMinutes: QRIS_EXPIRY_MINUTES,
    };

    const snapshot = {
      is_subscription: quote.isSubscription,
      package: quote.package
        ? {
            id: quote.package.id,
            name: quote.package.name,
            type: quote.package.type,
            price: Number(quote.package.price),
            portions: quote.package.portions,
          }
        : null,
      subscription_schedule: subscriptionSchedule,
      items: quote.items,
      voucher_id: quote.voucher ? quote.voucher.id : null,
      voucher_code: quote.voucher ? quote.voucher.code : null,
      breakdown: {
        subtotal: quote.subtotal,
        tax: quote.tax,
        shipping_fee: quote.shipping_fee,
        discount: quote.discount,
        total: quote.total,
      },
      delivery: {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        address_detail: body?.address_detail || null,
      },
      order_summary: {
        package_name: quote.package_name,
        package_detail: quote.package_detail,
        first_meal_name: quote.first_meal_name,
        first_meal_image: quote.first_meal_image,
        portions_count: quote.portions_count,
        delivery_schedule: deliverySchedule,
      },
      cart_signature: body?.cart_signature || null,
      midtrans_charge_payload: chargePayload,
    };

    // 3. Simpan order ('Menunggu Pembayaran') + payment ('creating') SEBELUM memanggil Midtrans
    const conn = await pool.getConnection();
    let insertedPaymentRow = null;
    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO orders (
          id, customer_id, customer_name, customer_phone, customer_address, address_detail,
          customer_type, package_name, package_detail, menu_name, menu_detail, portions_count,
          delivery_schedule, delivery_batch, day, status, total_price,
          payment_method, payment_status, courier_notes, kitchen_notes
        ) VALUES (?, ?, ?, ?, ?, ?, 'Personal', ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Pembayaran', ?, 'QRIS', 'Menunggu Pembayaran', ?, ?)`,
        [
          orderId,
          customerId,
          customerName,
          customerPhone,
          customerAddress,
          body?.address_detail || null,
          quote.package_name,
          quote.package_detail,
          quote.first_meal_name,
          quote.package_detail,
          quote.portions_count,
          deliverySchedule,
          deliveryBatch,
          day,
          quote.total,
          body?.courier_notes || null,
          body?.kitchen_notes || null,
        ]
      );

      await conn.query(
        `INSERT INTO payments (
          id, order_id, customer_id, provider, provider_order_id,
          gross_amount, status, idempotency_key, request_hash, midtrans_idempotency_key, request_snapshot
        ) VALUES (?, ?, ?, 'midtrans_qris', ?, ?, 'creating', ?, ?, ?, ?)`,
        [
          paymentId,
          orderId,
          customerId,
          providerOrderId,
          quote.total,
          idempotencyKey,
          requestHash,
          midtransIdempotencyKey,
          JSON.stringify(snapshot),
        ]
      );

      await conn.commit();
      insertedPaymentRow = {
        id: paymentId,
        order_id: orderId,
        customer_id: customerId,
        provider_order_id: providerOrderId,
        gross_amount: quote.total,
        status: 'creating',
        idempotency_key: idempotencyKey,
        request_hash: requestHash,
        midtrans_idempotency_key: midtransIdempotencyKey,
        request_snapshot: snapshot,
        created_at: new Date(),
      };
    } catch (txErr) {
      try {
        await conn.rollback();
      } catch (_) {}

      if (txErr && txErr.code === 'ER_DUP_ENTRY') {
        const [dupRows] = await pool.query(
          'SELECT * FROM payments WHERE customer_id = ? AND idempotency_key = ? LIMIT 1',
          [customerId, idempotencyKey]
        );
        if (dupRows && dupRows[0]) {
          return resolveExistingIdempotentPayment({
            existing: dupRows[0],
            requestHash,
            customerId,
          });
        }
      }
      throw txErr;
    } finally {
      conn.release();
    }

    // 4. Panggil Midtrans Core API POST /v2/charge dengan Idempotency-Key
    try {
      const chargeResult = await midtrans.chargeQris({
        ...chargePayload,
        idempotencyKey: midtransIdempotencyKey,
      });

      if (chargeResult.transactionStatus === 'settlement' || chargeResult.transactionStatus === 'capture') {
        const settled = await syncPaymentStatus({
          paymentId,
          midtransData: chargeResult.rawResponse,
        });
        return formatPaymentResponse(settled);
      }

      if (chargeResult.isPending202 || (!chargeResult.qrString && !chargeResult.qrUrl)) {
        const recovered = await attemptRecoveryOrSafePending({
          paymentRow: insertedPaymentRow,
          chargePayload,
          initialError: null,
        });
        return formatPaymentResponse(recovered);
      }

      const pendingRow = await persistPendingChargeResult(paymentId, chargeResult);
      return formatPaymentResponse(pendingRow);
    } catch (midtransErr) {
      if (midtransErr.errorCode || (midtransErr.statusCode && midtransErr.statusCode >= 400)) {
        throw midtransErr;
      }

      if (midtransErr.isAmbiguous) {
        const recovered = await attemptRecoveryOrSafePending({
          paymentRow: insertedPaymentRow,
          chargePayload,
          initialError: midtransErr,
        });
        return formatPaymentResponse(recovered);
      }

      // Penolakan bisnis definitif dari Midtrans (4xx)
      const failedRow = await markPaymentFailedAndCancelOrder(insertedPaymentRow, {
        error: midtransErr.message,
        midtransData: midtransErr.midtransData || null,
      });
      throw createHttpError(
        midtransErr.httpStatus && midtransErr.httpStatus >= 400 && midtransErr.httpStatus < 500
          ? midtransErr.httpStatus
          : 502,
        midtransErr.message || 'Gagal membuat kode QRIS di server pembayaran Midtrans.',
        {
          errorCode: 'PAYMENT_CLOSED',
          payment: formatPaymentResponse(failedRow),
        }
      );
    }
  }

  async function getPaymentById({ paymentId, customerId }) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [paymentId]);
    let payment = rows && rows[0];
    if (!payment) {
      throw createHttpError(404, 'Pembayaran tidak ditemukan.');
    }
    if (payment.customer_id !== customerId) {
      throw createHttpError(403, 'Anda tidak memiliki akses ke pembayaran ini.');
    }

    if (payment.status === 'creating') {
      try {
        payment = await reconcileStuckCreatingPayment(payment);
      } catch (_) {}
      return formatPaymentResponse(payment);
    }

    if (payment.status === 'pending') {
      const statusRes = await midtrans.getTransactionStatus(payment.provider_order_id);
      if (statusRes.httpStatus === 200 && statusRes.data && statusRes.data.transaction_status) {
        const synced = await syncPaymentStatus({
          paymentId: payment.id,
          midtransData: statusRes.data,
        });
        return formatPaymentResponse(synced);
      }
    }

    return formatPaymentResponse(payment);
  }

  async function getActivePayment(customerId) {
    // Rekonsiliasi lebih dulu bila ada row 'creating' yang tertinggal
    const [creatingRows] = await pool.query(
      `SELECT * FROM payments
       WHERE customer_id = ? AND status = 'creating'
       ORDER BY created_at DESC LIMIT 3`,
      [customerId]
    );
    for (const row of creatingRows || []) {
      const createdAtMs = row.created_at ? new Date(row.created_at).getTime() : Date.now();
      if (!Number.isNaN(createdAtMs) && Date.now() - createdAtMs >= CREATING_STALE_MS) {
        try {
          await reconcileStuckCreatingPayment(row);
        } catch (_) {}
      }
    }

    const [rows] = await pool.query(
      `SELECT * FROM payments
       WHERE customer_id = ?
         AND status = 'pending'
         AND qr_string IS NOT NULL
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY created_at DESC
       LIMIT 1`,
      [customerId]
    );

    const active = rows && rows[0];
    if (!active) return null;

    // Sinkronkan sekalian agar jika baru saja dibayar lewat webhook/Midtrans simulator tidak stale
    try {
      const statusRes = await midtrans.getTransactionStatus(active.provider_order_id);
      if (statusRes.httpStatus === 200 && statusRes.data && statusRes.data.transaction_status) {
        const synced = await syncPaymentStatus({
          paymentId: active.id,
          midtransData: statusRes.data,
        });
        if (synced.status !== 'pending') {
          return null;
        }
        return formatPaymentResponse(synced);
      }
    } catch (_) {}

    return formatPaymentResponse(active);
  }

  async function cancelPayment({ paymentId, customerId }) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [paymentId]);
    const payment = rows && rows[0];
    if (!payment) {
      throw createHttpError(404, 'Pembayaran tidak ditemukan.');
    }
    if (payment.customer_id !== customerId) {
      throw createHttpError(403, 'Anda tidak memiliki akses untuk membatalkan pembayaran ini.');
    }

    if (payment.status === 'paid') {
      throw createHttpError(409, 'Pembayaran sudah lunas sehingga tidak dapat dibatalkan.', {
        payment: formatPaymentResponse(payment),
      });
    }
    if (payment.status === 'cancelled' || payment.status === 'expired' || payment.status === 'failed') {
      return formatPaymentResponse(payment);
    }

    // 1. Cek status Midtrans terlebih dahulu
    const preCheck = await midtrans.getTransactionStatus(payment.provider_order_id);
    if (preCheck.httpStatus === 200 && preCheck.data) {
      const mapped = mapMidtransToPaymentStatus(preCheck.data);
      if (mapped === 'paid') {
        const syncedPaid = await syncPaymentStatus({
          paymentId: payment.id,
          midtransData: preCheck.data,
        });
        throw createHttpError(409, 'Pembayaran sudah diterima (Lunas) oleh Midtrans.', {
          payment: formatPaymentResponse(syncedPaid),
        });
      }
      if (mapped === 'cancelled' || mapped === 'expired' || mapped === 'failed') {
        const syncedDone = await syncPaymentStatus({
          paymentId: payment.id,
          midtransData: preCheck.data,
        });
        return formatPaymentResponse(syncedDone);
      }
    } else if (payment.status === 'creating' && preCheck.httpStatus === 404) {
      const syncedCancelled = await syncPaymentStatus({
        paymentId: payment.id,
        midtransData: {
          transaction_status: 'cancel',
          status_message: 'Dibatalkan sebelum tercatat di Midtrans.',
        },
      });
      return formatPaymentResponse(syncedCancelled);
    }

    // 2. Masih pending → panggil POST /v2/{order_id}/cancel
    const cancelRes = await midtrans.cancelTransaction(payment.provider_order_id);
    const cancelCode = Number(cancelRes.data?.status_code || cancelRes.httpStatus);

    if (cancelRes.httpStatus >= 200 && cancelRes.httpStatus < 300 && cancelCode < 400) {
      const synced = await syncPaymentStatus({
        paymentId: payment.id,
        midtransData: {
          ...cancelRes.data,
          transaction_status: cancelRes.data?.transaction_status || 'cancel',
        },
      });
      return formatPaymentResponse(synced);
    }

    // 3. Jika ditolak (mis. 412), cek status Midtrans sekali lagi sebelum menyerah; jangan tandai batal sepihak
    const recheck = await midtrans.getTransactionStatus(payment.provider_order_id);
    if (recheck.httpStatus === 200 && recheck.data) {
      const recheckedStatus = mapMidtransToPaymentStatus(recheck.data);
      const synced = await syncPaymentStatus({
        paymentId: payment.id,
        midtransData: recheck.data,
      });

      if (recheckedStatus === 'paid') {
        throw createHttpError(409, 'Pembayaran ternyata sudah Lunas sehingga tidak bisa dibatalkan.', {
          payment: formatPaymentResponse(synced),
        });
      }
      if (recheckedStatus === 'cancelled' || recheckedStatus === 'expired' || recheckedStatus === 'failed') {
        return formatPaymentResponse(synced);
      }
    }

    throw createHttpError(
      502,
      cancelRes.data?.status_message ||
        'Midtrans menolak pembatalan transaksi. Status belum berubah.'
    );
  }

  async function handleWebhookNotification(payload) {
    const orderId = payload?.order_id;
    const statusCode = payload?.status_code;
    const grossAmount = payload?.gross_amount;
    const signatureKey = payload?.signature_key;

    const isValidSig = midtrans.verifySignatureKey({
      orderId,
      statusCode,
      grossAmount,
      signatureKey,
    });

    if (!isValidSig) {
      throw createHttpError(401, 'Signature key webhook Midtrans tidak valid.');
    }

    const [rows] = await pool.query(
      'SELECT * FROM payments WHERE provider_order_id = ? LIMIT 1',
      [String(orderId)]
    );
    const payment = rows && rows[0];
    if (!payment) {
      throw createHttpError(404, `Pembayaran untuk order_id ${orderId} tidak ditemukan.`);
    }

    // Konfirmasi ulang status melalui GET status resmi ke Midtrans
    const statusRes = await midtrans.getTransactionStatus(payment.provider_order_id);
    const verifiedMidtransData =
      statusRes.httpStatus === 200 && statusRes.data && statusRes.data.transaction_status
        ? statusRes.data
        : payload;

    // Cocokkan nominal dengan DB
    if (verifiedMidtransData?.gross_amount !== undefined && verifiedMidtransData?.gross_amount !== null) {
      const verifiedAmount = Math.round(Number(verifiedMidtransData.gross_amount));
      if (verifiedAmount !== Math.round(Number(payment.gross_amount))) {
        throw createHttpError(400, 'Nominal transaksi tidak sesuai dengan tagihan di database.');
      }
    }

    const synced = await syncPaymentStatus({
      paymentId: payment.id,
      midtransData: verifiedMidtransData,
    });

    return formatPaymentResponse(synced);
  }

  async function simulatePaymentPaid({ paymentId, customerId }) {
    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [paymentId]);
    const payment = rows && rows[0];
    if (!payment) {
      throw createHttpError(404, 'Data pembayaran tidak ditemukan.');
    }
    if (customerId && payment.customer_id !== customerId) {
      throw createHttpError(403, 'Anda tidak memiliki akses ke pembayaran ini.');
    }

    const synced = await syncPaymentStatus({
      paymentId: payment.id,
      midtransData: {
        transaction_status: 'settlement',
        payment_type: 'qris',
        status_code: '200',
        gross_amount: String(payment.gross_amount),
        transaction_time: new Date().toISOString(),
      },
    });

    return formatPaymentResponse(synced);
  }

  return {
    calculateQuote,
    computeSubscriptionSchedule,
    syncPaymentStatus,
    createQrisPayment,
    getPaymentById,
    getActivePayment,
    cancelPayment,
    handleWebhookNotification,
    simulatePaymentPaid,
  };
}

module.exports = {
  ...createPaymentModel(),
  createPaymentModel,
  createHttpError,
  mapMidtransToPaymentStatus,
  computeSubscriptionSchedule,
  computeRequestHash,
  isValidUuid,
  formatPaymentResponse,
};
