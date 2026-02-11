const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false },
  storeConfig: {
    storeName: { type: String, default: 'My Store' },
    phone: String,
    email: String,
    gst: String,
    taxRate: { type: String, default: '18' },
    address: String
  }
});

module.exports = mongoose.model('User', userSchema);