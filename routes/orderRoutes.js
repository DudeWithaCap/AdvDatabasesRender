const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const adminOrMod = requireRole(['Admin', 'Moderator']);
router.get('/', auth, adminOrMod, orderController.getOrders);
router.put('/:id/status', auth, adminOrMod, orderController.updateOrderStatus);
router.delete('/:id', auth, adminOrMod, orderController.deleteOrder);

module.exports = router;
