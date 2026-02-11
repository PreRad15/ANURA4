const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  barcode: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  qty: { type: Number, default: 0 },
  minStock: { type: Number, default: 5 },
  expiryDate: { type: Date } // Optional Expiry Date
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);