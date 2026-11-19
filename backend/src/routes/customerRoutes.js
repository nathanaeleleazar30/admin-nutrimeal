const express = require('express');
const router = express.Router();
const customerController = require('../controller/customerController');

router.get('/', customerController.getAll);
router.post('/fcm-token', customerController.updateFcmToken);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

module.exports = router;
