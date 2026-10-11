const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/login', authController.login);
router.get('/me', authController.getMe);
router.post('/google', authController.googleAuth);
router.get('/customer-me', authController.getCustomerMe);
router.post('/register', authController.registerAdmin);
router.post('/customer-register', authController.registerCustomer);

module.exports = router;
