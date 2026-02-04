const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// sales by category, $unwind, $lookup, $group, $sort
exports.salesByCategory = async (req, res, next) => {
  try {
    const pipeline = [
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category._id',
          categoryName: { $first: '$category.name' },
          totalQuantity: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$product.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } }
    ];

    const result = await Order.aggregate(pipeline);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// top selling products
exports.topProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const pipeline = [
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product._id',
          productName: { $first: '$product.name' },
          brand: { $first: '$product.brand' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$product.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ];

    const result = await Order.aggregate(pipeline);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.summary = async (req, res, next) => {
  try {
    const [orderCountByStatus, totalOrders, totalProducts, totalCategories] = await Promise.all([
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Order.countDocuments(),
      Product.countDocuments(),
      require('../models/Category').countDocuments()
    ]);

    const totalCustomers = await require('../models/Customer').countDocuments();

    const totalRevenueResult = await Order.aggregate([
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$products.quantity', '$product.price'] } }
        }
      }
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        orderCountByStatus,
        totalOrders,
        totalProducts,
        totalCategories,
        totalCustomers,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      }
    });
  } catch (err) {
    next(err);
  }
};
