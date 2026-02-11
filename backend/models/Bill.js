const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  billNumber: { type: Number, required: true },
  customerName: String,
  customerPhone: String, // Added Phone
  items: [{
    productId: String,
    name: String,
    qty: Number,
    price: Number,
    purchasePrice: Number
  }],
  subtotal: Number,
  tax: Number,
  discount: Number,
  grandTotal: Number,
  paymentMode: { type: String, enum: ['Cash', 'UPI'] },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);