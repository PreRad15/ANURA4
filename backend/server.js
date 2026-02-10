const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Bill = require('./models/Bill');

const app = express();
app.use(cors({origin: "https://anura-4.vercel.app"}));
app.use(express.json());

const JWT_SECRET = 'anura_super_secret_key_2026';

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, storeConfig: user.storeConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATA ROUTES ---

// Store Config
app.get('/api/store-config', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user.storeConfig);
});

app.put('/api/store-config', authenticateToken, async (req, res) => {
  await User.findByIdAndUpdate(req.user.userId, { storeConfig: req.body });
  res.json({ message: 'Store settings saved' });
});

// Products
app.get('/api/products', authenticateToken, async (req, res) => {
  const products = await Product.find({ userId: req.user.userId });
  res.json(products);
});

// NEW: Smart Add Product (Increments stock if exists)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { barcode, qty, ...otherData } = req.body;
    
    // Check if product exists for this user
    let product = await Product.findOne({ barcode, userId: req.user.userId });

    if (product) {
      // Update existing product: Add to stock, update details
      product.qty += parseInt(qty) || 0;
      product.name = otherData.name;
      product.category = otherData.category;
      product.purchasePrice = otherData.purchasePrice;
      product.sellingPrice = otherData.sellingPrice;
      product.minStock = otherData.minStock;
      await product.save();
      res.json(product);
    } else {
      // Create new product
      const newProduct = new Product({ 
        barcode, 
        qty: parseInt(qty) || 0, 
        userId: req.user.userId, 
        ...otherData 
      });
      await newProduct.save();
      res.json(newProduct);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bills (With Auto-Increment & Profit Tracking)
app.get('/api/bills', authenticateToken, async (req, res) => {
  const bills = await Bill.find({ userId: req.user.userId }).sort({ billNumber: -1 });
  res.json(bills);
});

app.post('/api/bills', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const lastBill = await Bill.findOne({ userId: req.user.userId }).sort({ billNumber: -1 }).session(session);
    const nextBillNum = (lastBill && lastBill.billNumber) ? lastBill.billNumber + 1 : 1;

    const enrichedItems = [];
    for (const item of req.body.items) {
      const product = await Product.findOne({ barcode: item.productId, userId: req.user.userId }).session(session);
      if (!product) throw new Error(`Product ${item.name} not found`);
      
      await Product.findOneAndUpdate(
        { _id: product._id },
        { $inc: { qty: -item.qty } },
        { session }
      );

      enrichedItems.push({
        ...item,
        purchasePrice: product.purchasePrice // Capture cost for profit report
      });
    }

    const newBill = new Bill({
      ...req.body,
      userId: req.user.userId,
      billNumber: nextBillNum,
      items: enrichedItems
    });
    
    await newBill.save({ session });
    await session.commitTransaction();
    res.json(newBill);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// DANGER ZONE: Clear Data Route
app.delete('/api/sales-data', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.userId);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ error: 'Incorrect password' });

    await Bill.deleteMany({ userId: req.user.userId });
    res.json({ message: 'All sales data cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));