const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  specs: {
    cpu: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ categoryId: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
