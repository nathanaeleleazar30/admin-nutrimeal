const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.get('/', notificationController.getByCustomer);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/send', notificationController.sendManual);

module.exports = router;
