const crypto = require('node:crypto');

function getMidtransConfig() {
  const isProduction = String(process.env.MIDTRANS_IS_PRODUCTION || 'false').toLowerCase() === 'true';
  const serverKey = (process.env.MIDTRANS_SERVER_KEY || '').trim();
  const baseUrl = isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com';

  return {
    isProduction,
    serverKey,
    baseUrl,
  };
}

function buildAuthHeader(serverKey) {
  if (!serverKey) {
    const err = new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi di .env backend.');
    err.statusCode = 500;
    throw err;
  }
  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

function formatWibOrderTime(date = new Date()) {
  const wibMillis = date.getTime() + 7 * 60 * 60 * 1000;
  const d = new Date(wibMillis);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} +0700`;
}

function parseMidtransExpiryToDate(expiryStr) {
  if (!expiryStr || typeof expiryStr !== 'string') return null;
  const trimmed = expiryStr.trim();
  // Format Midtrans: "2021-06-23 15:40:24" (GMT+7 / WIB) atau ISO
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed.replace(' ', 'T')}+07:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

function createMidtransClient({ fetchImpl } = {}) {
  const getFetch = () => fetchImpl || globalThis.fetch;

  async function request(method, path, { body, headers = {}, timeoutMs = 15000 } = {}) {
    const cfg = getMidtransConfig();
    const authHeader = buildAuthHeader(cfg.serverKey);
    const url = `${cfg.baseUrl}${path}`;

    let res;
    try {
      res = await getFetch()(url, {
        method,
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (networkErr) {
      const err = new Error(
        networkErr?.name === 'TimeoutError' || networkErr?.name === 'AbortError'
          ? 'Waktu koneksi ke Midtrans habis (timeout).'
          : `Gagal menghubungi Midtrans: ${networkErr?.message || 'network error'}`
      );
      err.isTimeoutOrNetwork = true;
      err.isAmbiguous = true;
      throw err;
    }

    const text = await res.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { rawText: text };
    }

    return {
      ok: res.ok,
      httpStatus: res.status,
      data: json,
    };
  }

  async function chargeQris({
    orderId,
    grossAmount,
    itemDetails,
    customerDetails,
    expiryMinutes = 15,
    idempotencyKey,
  }) {
    const payload = {
      payment_type: 'qris',
      transaction_details: {
        order_id: String(orderId),
        gross_amount: Math.round(Number(grossAmount)),
      },
      qris: {
        acquirer: 'gopay',
      },
      custom_expiry: {
        order_time: formatWibOrderTime(new Date()),
        expiry_duration: Number(expiryMinutes),
        unit: 'minute',
      },
    };

    if (Array.isArray(itemDetails) && itemDetails.length > 0) {
      payload.item_details = itemDetails;
    }
    if (customerDetails && typeof customerDetails === 'object') {
      payload.customer_details = customerDetails;
    }

    const extraHeaders = {};
    if (typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
      extraHeaders['Idempotency-Key'] = idempotencyKey.trim().slice(0, 46);
    }

    const { ok, httpStatus, data } = await request('POST', '/v2/charge', {
      body: payload,
      headers: extraHeaders,
    });
    const statusCodeNum = Number(data?.status_code || httpStatus);

    if (!ok || !Number.isFinite(statusCodeNum) || statusCodeNum >= 400) {
      const err = new Error(
        data?.status_message || `Gagal membuat transaksi QRIS di Midtrans (status ${statusCodeNum}).`
      );
      err.httpStatus = httpStatus;
      err.midtransStatusCode = statusCodeNum;
      err.midtransData = data;
      if (httpStatus >= 500 || statusCodeNum >= 500) {
        err.isAmbiguous = true;
      }
      throw err;
    }

    const actions = Array.isArray(data.actions) ? data.actions : [];
    const qrAction =
      actions.find((a) => a.name === 'generate-qr-code') ||
      actions.find((a) => a.name === 'generate-qr-code-v2') ||
      null;

    return {
      isPending202: httpStatus === 202 || statusCodeNum === 202,
      statusCode: String(data?.status_code || httpStatus),
      transactionId: data.transaction_id || null,
      orderId: data.order_id || String(orderId),
      grossAmount: Math.round(Number(data.gross_amount ?? grossAmount)),
      transactionStatus: data.transaction_status || 'pending',
      qrString: data.qr_string || null,
      qrUrl: qrAction?.url || null,
      expiryTime: parseMidtransExpiryToDate(data.expiry_time),
      rawResponse: data,
    };
  }

  async function getTransactionStatus(orderId) {
    const { ok, httpStatus, data } = await request(
      'GET',
      `/v2/${encodeURIComponent(String(orderId))}/status`
    );

    if (!ok && httpStatus !== 404) {
      const err = new Error(
        data?.status_message || `Gagal memeriksa status transaksi Midtrans (${httpStatus}).`
      );
      err.httpStatus = httpStatus;
      err.midtransData = data;
      throw err;
    }

    return { httpStatus, data };
  }

  async function cancelTransaction(orderId) {
    return request('POST', `/v2/${encodeURIComponent(String(orderId))}/cancel`);
  }

  function verifySignatureKey({ orderId, statusCode, grossAmount, signatureKey, serverKeyOverride }) {
    if (!orderId || !statusCode || grossAmount === undefined || grossAmount === null || !signatureKey) {
      return false;
    }
    const serverKey = serverKeyOverride ?? getMidtransConfig().serverKey;
    if (!serverKey) return false;

    const rawInput = `${String(orderId)}${String(statusCode)}${String(grossAmount)}${serverKey}`;
    const expectedHash = crypto.createHash('sha512').update(rawInput, 'utf8').digest('hex');

    try {
      const a = Buffer.from(String(signatureKey).toLowerCase(), 'utf8');
      const b = Buffer.from(expectedHash.toLowerCase(), 'utf8');
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  return {
    getMidtransConfig,
    formatWibOrderTime,
    parseMidtransExpiryToDate,
    chargeQris,
    getTransactionStatus,
    cancelTransaction,
    verifySignatureKey,
  };
}

module.exports = {
  ...createMidtransClient(),
  createMidtransClient,
};
