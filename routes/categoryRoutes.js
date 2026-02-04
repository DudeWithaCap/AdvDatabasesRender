const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.get('/', auth, requireRole(['Admin', 'Moderator']), categoryController.getCategories);

module.exports = router;
