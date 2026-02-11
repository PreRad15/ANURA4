const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Bill = require('./models/Bill');

const app = express();

// --- CORS CONFIGURATION (THE FIX) ---
// This explicitly allows your local computer AND your Vercel website
app.use(cors({
  origin: [
    "http://localhost:5173",       // Local Development
    "https://anura-4.vercel.app",  // Production Frontend
    "https://anura-sms.vercel.app" // Alternate Production domain
  ],
  credentials: true
}));

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

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return true; 
  }
  
  try {
    await transporter.sendMail({
      from: `"Anura SMS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'ANURA Verification Code',
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`
    });
    return true;
  } catch (err) {
    console.error("Email Error:", err);
    return false;
  }
};

// --- AUTH ROUTES ---

// 1. Register (Step 1: Send OTP)
app.post('/api/auth/initiate-register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existing && existing.isVerified) return res.status(400).json({ error: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const expires = Date.now() + 300000; // 5 mins

    if (existing) {
      existing.otp = otp;
      existing.otpExpires = expires;
      existing.password = hashedPassword;
      await existing.save();
    } else {
      await new User({ username, email, password: hashedPassword, otp, otpExpires: expires }).save();
    }

    await sendOTP(email, otp);
    res.json({ message: 'OTP sent' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Verify OTP (Step 2)
app.post('/api/auth/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, storeConfig: user.storeConfig, email: user.email, username: user.username });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (!user.isVerified) return res.status(400).json({ error: 'Account not verified' });
    
    if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, storeConfig: user.storeConfig, email: user.email, username: user.username });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- APP ROUTES ---

app.get('/api/store-config', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user.storeConfig);
});

app.put('/api/store-config', authenticateToken, async (req, res) => {
  await User.findByIdAndUpdate(req.user.userId, { storeConfig: req.body });
  res.json({ message: 'Saved' });
});

// Products
app.get('/api/products', authenticateToken, async (req, res) => {
  res.json(await Product.find({ userId: req.user.userId }));
});

// SMART ADD PRODUCT (Merges Stock)
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { barcode, qty, expiryDate, ...data } = req.body;
    let product = await Product.findOne({ barcode, userId: req.user.userId });

    const validExpiry = expiryDate ? new Date(expiryDate) : null;

    if (product) {
      product.qty += parseInt(qty) || 0;
      Object.assign(product, data);
      if (validExpiry) product.expiryDate = validExpiry;
      await product.save();
      res.json(product);
    } else {
      const newProduct = new Product({ 
        barcode, 
        qty: parseInt(qty) || 0, 
        userId: req.user.userId, 
        expiryDate: validExpiry,
        ...data 
      });
      await newProduct.save();
      res.json(newProduct);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  await Product.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  res.json({ message: 'Deleted' });
});

// Bills
app.get('/api/bills', authenticateToken, async (req, res) => {
  res.json(await Bill.find({ userId: req.user.userId }).sort({ billNumber: -1 }));
});

app.post('/api/bills', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const last = await Bill.findOne({ userId: req.user.userId }).sort({ billNumber: -1 }).session(session);
    const nextNum = (last?.billNumber || 0) + 1;

    const items = [];
    for (const i of req.body.items) {
      const p = await Product.findOne({ barcode: i.productId, userId: req.user.userId }).session(session);
      if (p) {
        await Product.findByIdAndUpdate(p._id, { $inc: { qty: -i.qty } }, { session });
        items.push({ ...i, purchasePrice: p.purchasePrice });
      } else {
        items.push({ ...i, purchasePrice: 0 });
      }
    }

    const bill = new Bill({ ...req.body, userId: req.user.userId, billNumber: nextNum, items });
    await bill.save({ session });
    await session.commitTransaction();
    res.json(bill);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// Clear Data
app.delete('/api/sales-data', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!(await bcrypt.compare(req.body.password, user.password))) return res.status(403).json({ error: 'Wrong password' });
  await Bill.deleteMany({ userId: req.user.userId });
  res.json({ message: 'Cleared' });
});

mongoose.connect(process.env.MONGO_URI).then(()=>console.log("MongoDB Connected")).catch(e=>console.log(e));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));