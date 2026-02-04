const Product = require('../models/Product');
const AppError = require('../utils/AppError');

exports.createProduct = async (req, res, next) => {
  try {
    const { name, categoryId, brand, price, stock, specs = {} } = req.body;

    if (!name || !categoryId) {
      throw new AppError('name and categoryId are required', 400);
    }
    if (price == null || typeof price !== 'number' || price < 0) {
      throw new AppError('Invalid price', 400);
    }
    if (stock == null || typeof stock !== 'number' || stock < 0) {
      throw new AppError('Invalid stock', 400);
    }

    const product = await Product.create({
      name: name.trim(),
      categoryId,
      brand: brand || '',
      price,
      stock,
      specs: {
        cpu: specs.cpu || '',
        ram: specs.ram || '',
        storage: specs.storage || ''
      }
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { price, stock } = req.body;
    const updates = {};

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        throw new AppError('Invalid price', 400);
      }
      updates.price = price;
    }

    if (stock !== undefined) {
      if (typeof stock !== 'number' || stock < 0) {
        throw new AppError('Stock cannot go below 0', 400);
      }
      updates.stock = stock;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
