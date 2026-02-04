const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

exports.getLowStock = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || DEFAULT_LOW_STOCK_THRESHOLD;
    const products = await Product.find({ stock: { $lte: threshold } })
      .populate('categoryId', 'name')
      .sort({ stock: 1 });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.bulkRestock = async (req, res, next) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError('items array required with productId and quantity', 400);
    }

    const bulkOps = items.map((item) => {
      const qty = parseInt(item.quantity) || 0;
      if (qty <= 0) return null;
      return {
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: qty } }
        }
      };
    }).filter(Boolean);

    if (bulkOps.length === 0) {
      throw new AppError('No valid restock items', 400);
    }

    const result = await Product.bulkWrite(bulkOps);
    res.json({
      success: true,
      message: `${result.modifiedCount} product(s) restocked`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    next(err);
  }
};
