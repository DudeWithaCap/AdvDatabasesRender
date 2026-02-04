const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const adminOrMod = requireRole(['Admin', 'Moderator']);
router.post('/', auth, adminOrMod, productController.createProduct);
router.get('/', auth, adminOrMod, productController.getProducts);
router.get('/:id', auth, adminOrMod, productController.getProductById);
router.put('/:id', auth, adminOrMod, productController.updateProduct);
router.delete('/:id', auth, adminOrMod, productController.deleteProduct);

module.exports = router;
