const express = require('express');
const router = express.Router();
const aiPlannerController = require('../controller/aiPlannerController');

// POST /api/ai-planner/generate
router.post('/generate', aiPlannerController.generate);

module.exports = router;
