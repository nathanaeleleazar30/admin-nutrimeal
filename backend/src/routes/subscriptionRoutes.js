const express = require('express');
const router = express.Router();
const subscriptionController = require('../controller/subscriptionController');

router.get('/', subscriptionController.getAll);
router.get('/:id', subscriptionController.getById);
router.post('/', subscriptionController.create);
router.patch('/:id/status', subscriptionController.updateStatus);
router.delete('/:id', subscriptionController.delete);

module.exports = router;
