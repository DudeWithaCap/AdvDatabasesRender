const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email')
      .populate('products.productId', 'name price brand')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    )
      .populate('customerId', 'name email')
      .populate('products.productId', 'name price');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // restore stock using $inc for each product in the order
    const bulkOps = order.products.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: item.quantity } }
      }
    }));

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Order deleted, stock restored' });
  } catch (err) {
    next(err);
  }
};
