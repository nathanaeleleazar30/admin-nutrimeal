const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.patch('/:id/status', orderController.updateStatus);
router.put('/:id', orderController.update);
router.delete('/:id', orderController.delete);

module.exports = router;
