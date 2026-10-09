const express = require('express');
const router = express.Router();
const mealController = require('../controller/mealController');

// Routing hanya memetakan URL ke fungsi controller
router.get('/', mealController.getAll);
router.get('/:id', mealController.getById);
router.post('/', mealController.create);
router.put('/:id', mealController.update);
router.delete('/:id', mealController.delete);

module.exports = router;
