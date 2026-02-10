const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Store settings are now saved in the Database per user
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