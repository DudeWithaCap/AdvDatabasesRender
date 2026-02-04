const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const adminOrMod = requireRole(['Admin', 'Moderator']);
router.get('/low-stock', auth, adminOrMod, inventoryController.getLowStock);
router.put('/bulk-restock', auth, adminOrMod, inventoryController.bulkRestock);

module.exports = router;
