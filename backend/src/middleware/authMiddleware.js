const { verifyJwt } = require('../lib/jwt');

const ADMIN_ROLES = new Set(['superadmin', 'admin', 'kitchen_staff']);

function extractBearerToken(req) {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

function requireCustomerAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi diperlukan. Silakan login terlebih dahulu.',
    });
  }

  const payload = verifyJwt(token);
  if (!payload || !payload.sub || payload.role !== 'customer') {
    return res.status(401).json({
      success: false,
      message: 'Sesi login tidak valid atau telah berakhir. Silakan login ulang.',
    });
  }

  req.user = payload;
  req.customerId = String(payload.sub);
  return next();
}

function requireAdminAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token admin tidak ditemukan.',
    });
  }

  const payload = verifyJwt(token);
  if (!payload || !payload.sub || !ADMIN_ROLES.has(payload.role)) {
    return res.status(401).json({
      success: false,
      message: 'Token admin tidak valid atau sudah kedaluwarsa.',
    });
  }

  req.admin = payload;
  return next();
}

function optionalAuth(req, res, next) {
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyJwt(token);
    if (payload && payload.sub) {
      req.user = payload;
    }
  }
  return next();
}

module.exports = {
  ADMIN_ROLES,
  extractBearerToken,
  requireCustomerAuth,
  requireAdminAuth,
  optionalAuth,
};
