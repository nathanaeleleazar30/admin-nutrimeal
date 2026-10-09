const express = require('express');
const router = express.Router();
const voucherController = require('../controller/voucherController');

router.get('/', voucherController.getAll);
router.get('/:id', voucherController.getById);
router.post('/', voucherController.create);
router.put('/:id', voucherController.update);
router.patch('/:id/toggle', voucherController.toggleStatus);
router.delete('/:id', voucherController.delete);

module.exports = router;
