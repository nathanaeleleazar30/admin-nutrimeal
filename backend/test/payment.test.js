const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

process.env.JWT_SECRET = 'unit-test-jwt-secret-nutrimeal';
process.env.MIDTRANS_SERVER_KEY = 'SB-Mid-server-UNITTESTKEY123';
process.env.MIDTRANS_IS_PRODUCTION = 'false';

const { createPaymentModel } = require('../src/model/paymentModel');
const { createMidtransClient } = require('../src/lib/midtrans');
const { signJwt } = require('../src/lib/jwt');
const orderController = require('../src/controller/orderController');

function createMockDbState({ simulateDuplicateInsert = false } = {}) {
  const meals = [
    {
      id: 'meal-1',
      name: 'Grilled Chicken Rice Bowl',
      category: 'Tinggi Protein',
      calories: 520,
      price: 45000,
      image_url: '/uploads/chicken.jpg',
      delivery_time: '11:30 - 13:00 WIB',
      is_available: 1,
    },
    {
      id: 'meal-off',
      name: 'Menu Habis',
      category: 'Diet',
      calories: 400,
      price: 40000,
      image_url: '',
      delivery_time: '11:30 - 13:00 WIB',
      is_available: 0,
    },
  ];

  const packages = [
    {
      id: 'pkg-1',
      name: 'Paket Sehat Diet Mingguan',
      type: 'Mingguan',
      portions: '10 Porsi (Makan Siang & Malam)',
      price: 350000,
    },
    {
      id: 'pkg-popular',
      name: 'Paket Bulanan Lengkap',
      type: 'Bulanan',
      portions: '60 Box (Siang & Malam)',
      price: 750000,
    },
  ];

  const vouchers = [
    {
      id: 'voc-1',
      code: 'DISKON10',
      discount_type: 'percent',
      discount_value: 10,
      max_discount: 20000,
      min_spend: 40000,
      valid_until: '2099-12-31',
      quota: 50,
      used_count: 2,
      is_active: 1,
    },
    {
      id: 'voc-ship',
      code: 'GRATISONGKIR',
      discount_type: 'free_shipping',
      discount_value: 0,
      max_discount: null,
      min_spend: 30000,
      valid_until: '2099-12-31',
      quota: 50,
      used_count: 0,
      is_active: 1,
    },
    {
      id: 'voc-exp',
      code: 'KADALUARSA',
      discount_type: 'nominal',
      discount_value: 10000,
      max_discount: null,
      min_spend: 0,
      valid_until: '2020-01-01',
      quota: 50,
      used_count: 0,
      is_active: 1,
    },
    {
      id: 'voc-full',
      code: 'HABIS',
      discount_type: 'nominal',
      discount_value: 10000,
      max_discount: null,
      min_spend: 0,
      valid_until: '2099-12-31',
      quota: 5,
      used_count: 5,
      is_active: 1,
    },
  ];

  const customers = [
    { id: 'cst-a', name: 'Andi A', email: 'a@test.com', total_orders: 0, total_spent: 0 },
    { id: 'cst-b', name: 'Budi B', email: 'b@test.com', total_orders: 0, total_spent: 0 },
  ];

  const orders = [];
  const payments = [];
  const subscriptions = [];
  let dupBypassOnce = false;

  async function runQuery(sql, params = []) {
    const clean = sql.replace(/\s+/g, ' ').trim();

    if (clean.startsWith('SELECT * FROM packages WHERE id = ?')) {
      return [packages.filter((p) => p.id === params[0])];
    }
    if (clean.includes('FROM meals WHERE id IN')) {
      const set = new Set(params);
      return [meals.filter((m) => set.has(m.id))];
    }
    if (clean.startsWith('SELECT * FROM vouchers WHERE code = ?')) {
      return [vouchers.filter((v) => v.code === params[0])];
    }
    if (clean.startsWith('SELECT * FROM customers WHERE id = ?')) {
      return [customers.filter((c) => c.id === params[0])];
    }
    if (clean.startsWith('SELECT * FROM payments WHERE customer_id = ? AND idempotency_key = ?')) {
      if (simulateDuplicateInsert && !dupBypassOnce) {
        dupBypassOnce = true;
        return [[]];
      }
      return [payments.filter((p) => p.customer_id === params[0] && p.idempotency_key === params[1])];
    }
    if (clean.startsWith('SELECT * FROM payments WHERE customer_id = ?') && clean.includes("status = 'creating'")) {
      return [payments.filter((p) => p.customer_id === params[0] && p.status === 'creating')];
    }
    if (clean.startsWith('SELECT * FROM payments WHERE customer_id = ?') && clean.includes("status = 'pending'")) {
      return [payments.filter((p) => p.customer_id === params[0] && p.status === 'pending' && p.qr_string)];
    }
    if (clean.startsWith('SELECT * FROM payments WHERE provider_order_id = ?')) {
      return [payments.filter((p) => p.provider_order_id === params[0])];
    }
    if (clean.startsWith('SELECT * FROM payments WHERE id = ?')) {
      return [payments.filter((p) => p.id === params[0])];
    }
    if (clean.startsWith('SELECT * FROM orders WHERE id = ?')) {
      return [orders.filter((o) => o.id === params[0])];
    }
    if (clean.startsWith('INSERT INTO orders')) {
      const [
        id,
        customer_id,
        customer_name,
        customer_phone,
        customer_address,
        address_detail,
        package_name,
        package_detail,
        menu_name,
        menu_detail,
        portions_count,
        delivery_schedule,
        delivery_batch,
        day,
        total_price,
        courier_notes,
        kitchen_notes,
      ] = params;
      orders.push({
        id,
        customer_id,
        customer_name,
        customer_phone,
        customer_address,
        address_detail,
        package_name,
        package_detail,
        menu_name,
        menu_detail,
        portions_count,
        delivery_schedule,
        delivery_batch,
        day,
        status: 'Menunggu Pembayaran',
        total_price,
        payment_method: 'QRIS',
        payment_status: 'Menunggu Pembayaran',
        courier_notes,
        kitchen_notes,
      });
      return [{ affectedRows: 1 }];
    }
    if (clean.startsWith('INSERT INTO payments')) {
      const [
        id,
        order_id,
        customer_id,
        provider_order_id,
        gross_amount,
        idempotency_key,
        request_hash,
        midtrans_idempotency_key,
        request_snapshot,
      ] = params;
      if (payments.some((p) => p.customer_id === customer_id && p.idempotency_key === idempotency_key)) {
        const dupErr = new Error('Duplicate entry');
        dupErr.code = 'ER_DUP_ENTRY';
        throw dupErr;
      }
      payments.push({
        id,
        order_id,
        customer_id,
        provider: 'midtrans_qris',
        provider_order_id,
        transaction_id: null,
        gross_amount,
        status: 'creating',
        qr_string: null,
        qr_url: null,
        expires_at: null,
        paid_at: null,
        idempotency_key,
        request_hash,
        midtrans_idempotency_key,
        request_snapshot,
        raw_response: null,
        created_at: new Date(),
      });
      return [{ affectedRows: 1 }];
    }
    if (clean.startsWith("UPDATE payments SET status = 'pending', transaction_id =")) {
      const [transaction_id, qr_string, qr_url, expires_at, raw_response, id] = params;
      const p = payments.find((x) => x.id === id && ['creating', 'pending'].includes(x.status));
      if (p) {
        p.status = 'pending';
        p.transaction_id = transaction_id || p.transaction_id;
        p.qr_string = qr_string;
        p.qr_url = qr_url;
        p.expires_at = expires_at;
        p.raw_response = raw_response;
      }
      return [{ affectedRows: p ? 1 : 0 }];
    }
    if (clean.startsWith("UPDATE payments SET status = 'paid'")) {
      const [txId, raw, id] = params;
      const p = payments.find((x) => x.id === id);
      if (p) {
        p.status = 'paid';
        p.paid_at = p.paid_at || new Date();
        p.transaction_id = txId || p.transaction_id;
        p.raw_response = raw;
      }
      return [{ affectedRows: p ? 1 : 0 }];
    }
    if (clean.startsWith('UPDATE payments SET status = ?, transaction_id = COALESCE')) {
      const [status, txId, raw, id] = params;
      const p = payments.find((x) => x.id === id);
      if (p) {
        p.status = status;
        p.transaction_id = txId || p.transaction_id;
        p.raw_response = raw;
      }
      return [{ affectedRows: p ? 1 : 0 }];
    }
    if (clean.startsWith('UPDATE payments SET transaction_id = COALESCE(?, transaction_id)')) {
      const [txId, raw, id] = params;
      const p = payments.find((x) => x.id === id);
      if (p) {
        p.transaction_id = txId || p.transaction_id;
        p.raw_response = raw;
      }
      return [{ affectedRows: p ? 1 : 0 }];
    }
    if (clean.startsWith("UPDATE payments SET status = 'failed'")) {
      const [raw, id] = params;
      const p = payments.find((x) => x.id === id);
      if (p) {
        p.status = 'failed';
        p.raw_response = raw;
      }
      return [{ affectedRows: 1 }];
    }
    if (clean.startsWith("UPDATE orders SET payment_status = 'Lunas'")) {
      const o = orders.find((x) => x.id === params[0]);
      if (o) {
        o.payment_status = 'Lunas';
        if (o.status === 'Menunggu Pembayaran') o.status = 'Diterima';
      }
      return [{ affectedRows: o ? 1 : 0 }];
    }
    if (clean.startsWith('UPDATE orders SET status = CASE WHEN status =')) {
      if (params.length === 1) {
        const o = orders.find((x) => x.id === params[0]);
        if (o) {
          if (o.status === 'Menunggu Pembayaran') o.status = 'Dibatalkan';
          if (o.payment_status === 'Menunggu Pembayaran') o.payment_status = 'Dibatalkan';
        }
        return [{ affectedRows: o ? 1 : 0 }];
      }
      const [paymentStatus, id] = params;
      const o = orders.find((x) => x.id === id);
      if (o) {
        o.payment_status = paymentStatus;
        if (o.status === 'Menunggu Pembayaran') o.status = 'Dibatalkan';
      }
      return [{ affectedRows: o ? 1 : 0 }];
    }
    if (clean.startsWith('UPDATE customers SET total_orders = total_orders + 1')) {
      const [spent, id] = params;
      const c = customers.find((x) => x.id === id);
      if (c) {
        c.total_orders += 1;
        c.total_spent += Number(spent);
      }
      return [{ affectedRows: 1 }];
    }
    if (clean.startsWith('UPDATE customers SET active_subscription = ?')) {
      const [pkgName, id] = params;
      const c = customers.find((x) => x.id === id);
      if (c) c.active_subscription = pkgName;
      return [{ affectedRows: 1 }];
    }
    if (clean.startsWith('UPDATE vouchers SET used_count = used_count + 1')) {
      const v = vouchers.find((x) => x.id === params[0] && x.used_count < x.quota);
      if (v) v.used_count += 1;
      return [{ affectedRows: v ? 1 : 0 }];
    }
    if (clean.startsWith('INSERT INTO subscriptions')) {
      subscriptions.push({ id: params[0], customer_id: params[1], package_name: params[4], total_days: params[10] });
      return [{ affectedRows: 1 }];
    }

    throw new Error(`Unhandled SQL in mock pool: ${clean}`);
  }

  const pool = {
    query: runQuery,
    async getConnection() {
      return {
        query: runQuery,
        async beginTransaction() {},
        async commit() {},
        async rollback() {},
        release() {},
      };
    },
  };

  return { pool, orders, payments, vouchers, subscriptions, customers };
}

function makeSig(orderId, statusCode, grossAmount) {
  return crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest('hex');
}

test('calculateQuote computes exact server totals and rejects invalid vouchers/meals', async () => {
  const { pool } = createMockDbState();
  const model = createPaymentModel({ pool });

  const quote = await model.calculateQuote({
    items: [{ meal_id: 'meal-1', qty: 2 }],
    voucher_code: 'DISKON10',
  });
  assert.equal(quote.subtotal, 90000);
  assert.equal(quote.tax, 4500);
  assert.equal(quote.shipping_fee, 10000);
  assert.equal(quote.discount, 9000);
  assert.equal(quote.total, 95500);

  const shipQuote = await model.calculateQuote({
    items: [{ meal_id: 'meal-1', qty: 1 }],
    voucher_code: 'GRATISONGKIR',
  });
  assert.equal(shipQuote.discount, 10000);
  assert.equal(shipQuote.total, 45000 + 2250);

  await assert.rejects(
    () => model.calculateQuote({ items: [{ meal_id: 'meal-off', qty: 1 }] }),
    (err) => err.statusCode === 400
  );
  await assert.rejects(
    () => model.calculateQuote({ items: [{ meal_id: 'meal-1', qty: 1 }], voucher_code: 'KADALUARSA' }),
    (err) => err.statusCode === 400
  );
  await assert.rejects(
    () => model.calculateQuote({ items: [{ meal_id: 'meal-1', qty: 1 }], voucher_code: 'HABIS' }),
    (err) => err.statusCode === 400
  );
  await assert.rejects(
    () => model.calculateQuote({ items: [{ meal_id: 'meal-1', qty: 0 }] }),
    (err) => err.statusCode === 400
  );
});

test('idempotency enforces UUID v4, request_hash mismatch (422), creating processing (409), ER_DUP_ENTRY, and closed state (409)', async () => {
  const state = createMockDbState({ simulateDuplicateInsert: true });
  let chargeCalls = 0;
  let capturedIdempotencyHeader = null;
  let cancelCalledWithIdempotency = false;

  const mockFetch = async (url, init) => {
    if (String(url).includes('/v2/charge')) {
      chargeCalls += 1;
      capturedIdempotencyHeader = init.headers['Idempotency-Key'];
      const body = JSON.parse(init.body);
      return new Response(
        JSON.stringify({
          status_code: '201',
          transaction_id: `tx-${chargeCalls}`,
          order_id: body.transaction_details.order_id,
          gross_amount: `${body.transaction_details.gross_amount}.00`,
          transaction_status: 'pending',
          qr_string: `000201-${body.transaction_details.order_id}`,
          actions: [{ name: 'generate-qr-code', url: `https://sandbox/qr/${body.transaction_details.order_id}` }],
          expiry_time: '2099-12-31 23:59:59',
        }),
        { status: 201 }
      );
    }
    if (String(url).endsWith('/cancel')) {
      cancelCalledWithIdempotency = Boolean(init.headers['Idempotency-Key']);
      return new Response(JSON.stringify({ status_code: '200', transaction_status: 'cancel' }), { status: 200 });
    }
    if (String(url).endsWith('/status')) {
      return new Response(
        JSON.stringify({ status_code: '201', transaction_status: 'pending' }),
        { status: 200 }
      );
    }
    throw new Error(`Unexpected URL: ${url}`);
  };

  const realMidtrans = createMidtransClient({ fetchImpl: mockFetch });
  const model = createPaymentModel({
    pool: state.pool,
    midtrans: realMidtrans,
    notificationService: { sendToCustomer: async () => {} },
  });

  // Non-UUID key rejected
  await assert.rejects(
    () =>
      model.createQrisPayment({
        customerId: 'cst-a',
        body: {
          idempotency_key: 'not-a-uuid',
          items: [{ meal_id: 'meal-1', qty: 1 }],
          customer_phone: '08123456789',
          customer_address: 'Jl. Soekarno Hatta No. 1',
        },
      }),
    (err) => err.statusCode === 400
  );

  const validUuid = crypto.randomUUID();
  const payload = {
    idempotency_key: validUuid,
    items: [{ meal_id: 'meal-1', qty: 1 }],
    customer_phone: '08123456789',
    customer_address: 'Jl. Soekarno Hatta No. 1',
  };

  const first = await model.createQrisPayment({ customerId: 'cst-a', body: payload });
  assert.equal(chargeCalls, 1);
  assert.ok(capturedIdempotencyHeader && capturedIdempotencyHeader.length <= 46);

  // Concurrent duplicate insert (ER_DUP_ENTRY) returns exact same payment without second charge
  const concurrentDup = await model.createQrisPayment({ customerId: 'cst-a', body: payload });
  assert.equal(chargeCalls, 1);
  assert.equal(concurrentDup.payment_id, first.payment_id);

  // Different payload with same idempotency_key -> 422 IDEMPOTENCY_MISMATCH
  await assert.rejects(
    () =>
      model.createQrisPayment({
        customerId: 'cst-a',
        body: { ...payload, items: [{ meal_id: 'meal-1', qty: 2 }] },
      }),
    (err) => err.statusCode === 422 && err.errorCode === 'IDEMPOTENCY_MISMATCH'
  );

  // Fresh 'creating' record -> 409 PAYMENT_PROCESSING
  const creatingUuid = crypto.randomUUID();
  state.payments.push({
    id: 'PAY-CREATING-1',
    order_id: 'ORD-CREATING-1',
    customer_id: 'cst-a',
    provider_order_id: 'ORD-CREATING-1',
    gross_amount: 57250,
    status: 'creating',
    idempotency_key: creatingUuid,
    request_hash: state.payments[0].request_hash,
    created_at: new Date(),
  });
  await assert.rejects(
    () =>
      model.createQrisPayment({
        customerId: 'cst-a',
        body: { ...payload, idempotency_key: creatingUuid },
      }),
    (err) => err.statusCode === 409 && err.errorCode === 'PAYMENT_PROCESSING'
  );

  // Customer B cannot read or cancel Customer A's payment
  await assert.rejects(
    () => model.getPaymentById({ paymentId: first.payment_id, customerId: 'cst-b' }),
    (err) => err.statusCode === 403
  );
  await assert.rejects(
    () => model.cancelPayment({ paymentId: first.payment_id, customerId: 'cst-b' }),
    (err) => err.statusCode === 403
  );

  // Cancel does not send Idempotency-Key header, then reusing cancelled UUID returns 409 PAYMENT_CLOSED
  await model.cancelPayment({ paymentId: first.payment_id, customerId: 'cst-a' });
  assert.equal(cancelCalledWithIdempotency, false);
  await assert.rejects(
    () => model.createQrisPayment({ customerId: 'cst-a', body: payload }),
    (err) => err.statusCode === 409 && err.errorCode === 'PAYMENT_CLOSED'
  );
});

test('202 / timeout on charge recovers via same Midtrans Idempotency-Key without falsely marking failed', async () => {
  const state = createMockDbState();
  let chargeAttempts = 0;

  const mockMidtrans = {
    verifySignatureKey: () => true,
    parseMidtransExpiryToDate: () => new Date(Date.now() + 900000),
    async chargeQris({ orderId, grossAmount }) {
      chargeAttempts += 1;
      if (chargeAttempts === 1) {
        return {
          isPending202: true,
          statusCode: '202',
          transactionId: 'tx-202',
          orderId,
          grossAmount,
          transactionStatus: 'pending',
          qrString: null,
          qrUrl: null,
          rawResponse: { status_code: '202' },
        };
      }
      return {
        isPending202: false,
        statusCode: '201',
        transactionId: 'tx-202',
        orderId,
        grossAmount,
        transactionStatus: 'pending',
        qrString: '000201-RECOVERED',
        qrUrl: 'https://sandbox/qr-recovered',
        expiryTime: new Date(Date.now() + 900000),
        rawResponse: { status_code: '201', transaction_status: 'pending' },
      };
    },
    async getTransactionStatus() {
      return { httpStatus: 200, data: { status_code: '201', transaction_status: 'pending' } };
    },
  };

  const model = createPaymentModel({
    pool: state.pool,
    midtrans: mockMidtrans,
    notificationService: { sendToCustomer: async () => {} },
  });

  const payment = await model.createQrisPayment({
    customerId: 'cst-a',
    body: {
      idempotency_key: crypto.randomUUID(),
      items: [{ meal_id: 'meal-1', qty: 1 }],
      customer_phone: '08123456789',
      customer_address: 'Jl. Ijen No. 1',
    },
  });

  assert.equal(chargeAttempts, 2);
  assert.equal(payment.status, 'pending');
  assert.equal(payment.qr_string, '000201-RECOVERED');
});

test('webhook signature validation, idempotent settlement, and anti-downgrade guard', async () => {
  const state = createMockDbState();
  let notificationsSent = 0;

  const realMidtrans = createMidtransClient();
  const mockMidtrans = {
    verifySignatureKey: realMidtrans.verifySignatureKey,
    async chargeQris({ orderId, grossAmount }) {
      return {
        isPending202: false,
        statusCode: '201',
        transactionId: 'tx-settle-1',
        orderId,
        grossAmount: String(grossAmount),
        qrString: '000201-SUB',
        qrUrl: 'https://sandbox/qr',
        expiryTime: new Date(Date.now() + 15 * 60 * 1000),
        rawResponse: { transaction_status: 'pending' },
      };
    },
    async getTransactionStatus(orderId) {
      const p = state.payments.find((x) => x.provider_order_id === orderId);
      return {
        httpStatus: 200,
        data: {
          order_id: orderId,
          transaction_id: 'tx-settle-1',
          transaction_status: 'settlement',
          status_code: '200',
          gross_amount: `${p.gross_amount}.00`,
        },
      };
    },
  };

  const model = createPaymentModel({
    pool: state.pool,
    midtrans: mockMidtrans,
    notificationService: {
      sendToCustomer: async () => {
        notificationsSent += 1;
      },
    },
  });

  const payment = await model.createQrisPayment({
    customerId: 'cst-a',
    body: {
      idempotency_key: crypto.randomUUID(),
      package_id: 'pkg-popular',
      customer_phone: '08123456789',
      customer_address: 'Jl. Ijen No. 8',
    },
  });

  await assert.rejects(
    () =>
      model.handleWebhookNotification({
        order_id: payment.provider_order_id,
        status_code: '200',
        gross_amount: `${payment.amount}.00`,
        signature_key: 'bad-signature',
      }),
    (err) => err.statusCode === 401
  );

  const validSig = makeSig(payment.provider_order_id, '200', `${payment.amount}.00`);
  const settled1 = await model.handleWebhookNotification({
    order_id: payment.provider_order_id,
    status_code: '200',
    gross_amount: `${payment.amount}.00`,
    signature_key: validSig,
    transaction_status: 'settlement',
  });
  assert.equal(settled1.status, 'paid');
  assert.equal(settled1.payment_status, 'Lunas');
  assert.equal(state.subscriptions.length, 1);
  assert.equal(state.subscriptions[0].total_days, 30);
  assert.equal(notificationsSent, 1);

  const settled2 = await model.handleWebhookNotification({
    order_id: payment.provider_order_id,
    status_code: '200',
    gross_amount: `${payment.amount}.00`,
    signature_key: validSig,
    transaction_status: 'settlement',
  });
  assert.equal(settled2.status, 'paid');
  assert.equal(state.subscriptions.length, 1);
  assert.equal(notificationsSent, 1);

  const afterExpire = await model.syncPaymentStatus({
    paymentId: payment.payment_id,
    midtransData: { transaction_status: 'expire' },
  });
  assert.equal(afterExpire.status, 'paid');
});

test('cancelPayment returns 409 Conflict if Midtrans reports already settled', async () => {
  const state = createMockDbState();
  const mockMidtrans = {
    verifySignatureKey: () => true,
    async chargeQris({ orderId, grossAmount }) {
      return {
        isPending202: false,
        statusCode: '201',
        transactionId: 'tx-c1',
        orderId,
        grossAmount: String(grossAmount),
        qrString: '000201-C1',
        qrUrl: 'https://sandbox/c1',
        expiryTime: new Date(Date.now() + 15 * 60 * 1000),
        rawResponse: {},
      };
    },
    async getTransactionStatus(orderId) {
      const p = state.payments.find((x) => x.provider_order_id === orderId);
      return {
        httpStatus: 200,
        data: {
          order_id: orderId,
          transaction_id: 'tx-c1',
          transaction_status: 'settlement',
          status_code: '200',
          gross_amount: `${p.gross_amount}.00`,
        },
      };
    },
    async cancelTransaction() {
      throw new Error('Should not cancel an already settled transaction');
    },
  };

  const model = createPaymentModel({
    pool: state.pool,
    midtrans: mockMidtrans,
    notificationService: { sendToCustomer: async () => {} },
  });

  const payment = await model.createQrisPayment({
    customerId: 'cst-a',
    body: {
      idempotency_key: crypto.randomUUID(),
      items: [{ meal_id: 'meal-1', qty: 1 }],
      customer_phone: '08123456789',
      customer_address: 'Jl. Malang No. 5',
    },
  });

  await assert.rejects(
    () => model.cancelPayment({ paymentId: payment.payment_id, customerId: 'cst-a' }),
    (err) => err.statusCode === 409 && err.payment?.status === 'paid'
  );
});

test('POST /api/orders rejects payment_status Lunas from customer or unauthenticated caller', async () => {
  const customerJwt = signJwt({ id: 'cst-a', role: 'customer', email: 'a@test.com' });

  const makeReq = (token) => ({
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: {
      customer_name: 'Andi',
      customer_phone: '081234',
      customer_address: 'Jl. Testing',
      package_name: 'Grilled Chicken',
      total_price: 50000,
      payment_status: 'Lunas',
    },
  });

  const makeRes = () => {
    const out = { statusCode: 200, jsonBody: null };
    return {
      status(code) {
        out.statusCode = code;
        return this;
      },
      json(body) {
        out.jsonBody = body;
        return out;
      },
    };
  };

  const unauthRes = await orderController.create(makeReq(null), makeRes(), (e) => {
    throw e;
  });
  assert.equal(unauthRes.statusCode, 403);

  const custRes = await orderController.create(makeReq(customerJwt), makeRes(), (e) => {
    throw e;
  });
  assert.equal(custRes.statusCode, 403);
});
