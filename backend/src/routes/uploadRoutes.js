const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 20);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `meal-${cleanName || 'img'}-${uniqueSuffix}${ext || '.jpg'}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpe?g|png|webp|gif|svg)$/i;
  const isImageMime = file.mimetype.startsWith('image/');

  if (isImageMime || allowedExts.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPG, PNG, WEBP, GIF, SVG) yang diperbolehkan!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Gagal mengunggah file gambar.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file gambar yang dipilih.',
      });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    res.status(200).json({
      success: true,
      message: 'Gambar berhasil diunggah.',
      imageUrl: relativeUrl,
      fullUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  });
});

module.exports = router;
