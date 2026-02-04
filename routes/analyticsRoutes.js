const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/sales-by-category', auth, analyticsController.salesByCategory);
router.get('/top-products', auth, analyticsController.topProducts);
router.get('/summary', auth, analyticsController.summary);

module.exports = router;
