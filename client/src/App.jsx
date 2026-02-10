import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Store, ShoppingCart, Package, Info, 
  Save, Search, BarChart3, CheckCircle, X, Printer, LogOut, User as UserIcon, Lock, Download, Trash2, AlertTriangle, FileText, Smartphone, Mail, Globe
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- UTILS ---
const formatBillNumber = (num) => String(num).padStart(6, '0');

// --- AUTHENTICATION ---
const AuthScreen = ({ setToken }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } else {
        alert("Registration Successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Connection error. Check backend.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5fa] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#e8daef] overflow-hidden">
        <div className="bg-[#4a1d56] p-8 text-center text-white">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-xl p-1">
             <img src="/Anura.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => {e.target.style.display='none'}} />
          </div>
          <h1 className="text-2xl font-bold">Welcome to ANURA</h1>
          <p className="text-white/80 text-sm">Store Management System</p>
        </div>
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#2e0f3e] mb-6 text-center">{isLogin ? 'Login' : 'Create Account'}</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad]" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            <input type="password" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad]" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            <button type="submit" className="w-full bg-[#4a1d56] text-white py-3 rounded-xl font-bold hover:bg-[#2e0f3e] transition-all shadow-md">{isLogin ? 'Sign In' : 'Register'}</button>
          </form>
          <div className="mt-6 text-center"><button onClick={() => setIsLogin(!isLogin)} className="text-sm text-[#8e44ad] hover:underline font-medium">{isLogin ? "New user? Register here" : "Have an account? Login"}</button></div>
        </div>
      </div>
    </div>
  );
};

// --- PRINT TEMPLATES ---

const InvoiceTemplate = ({ bill, storeData }) => {
  if (!bill) return null;
  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-[210mm] mx-auto">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div className="text-xs text-gray-500">{new Date().toLocaleString()}</div>
        <div className="text-xs font-bold text-gray-800">ANURA - Invoice</div>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#2e0f3e] mb-2 capitalize">{storeData.storeName || 'Store Name'}</h1>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Phone: {storeData.phone} {storeData.gst && `| GST: ${storeData.gst}`}</p>
          <p>{storeData.email}</p>
          {storeData.address && <p className="max-w-md mx-auto">{storeData.address}</p>}
        </div>
      </div>
      <div className="flex justify-between items-center mb-6 border-b border-t py-3">
        <span className="font-bold text-lg">Bill No: {formatBillNumber(bill.billNumber || 0)}</span>
        <span className="font-bold">Date: {new Date(bill.date || Date.now()).toLocaleString()}</span>
      </div>
      <table className="w-full text-left text-sm mb-6">
        <thead><tr className="border-b"><th className="pb-2">Item</th><th className="pb-2 text-center">Qty</th><th className="pb-2 text-right">Price</th><th className="pb-2 text-right">Total</th></tr></thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-100"><td className="py-2 capitalize">{item.name}</td><td className="py-2 text-center">{item.qty}</td><td className="py-2 text-right">₹{item.price}</td><td className="py-2 text-right">₹{item.price * item.qty}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-end gap-1 mb-8">
        <div className="flex justify-between w-48"><span>Subtotal:</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between w-48"><span>Tax ({storeData.taxRate}%):</span><span>₹{bill.tax.toFixed(2)}</span></div>
        {bill.discount > 0 && <div className="flex justify-between w-48 text-red-600 font-bold"><span>Discount:</span><span>-₹{bill.discount.toFixed(2)}</span></div>}
        <div className="flex justify-between w-48 font-bold text-lg mt-2 pt-2 border-t"><span>Grand Total:</span><span>₹{bill.grandTotal.toFixed(2)}</span></div>
        <div className="text-sm text-gray-800 mt-2 font-bold border px-3 py-1 rounded">Payment Method: Paid via {bill.paymentMode}</div>
      </div>
      <div className="text-center mt-12 border-t pt-4"><p className="font-medium text-lg mb-2">Thank you for your business!</p><p className="text-xs text-gray-400">Generated by ANURA</p></div>
    </div>
  );
};

const ReportTemplate = ({ bills, storeData }) => {
  return (
    <div className="hidden print:block p-8 bg-white text-black">
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-[#2e0f3e] mb-1">Sales Report</h1>
        <h2 className="text-lg font-medium text-gray-600 capitalize">{storeData.storeName}</h2>
        <p className="text-xs text-gray-500 mt-2">Generated: {new Date().toLocaleString()}</p>
      </div>
      
      <table className="w-full text-left text-xs mb-6 border-collapse">
        <thead>
          <tr className="border-b border-black">
            <th className="pb-2">Bill No</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Items</th>
            <th className="pb-2 text-right">Revenue</th>
            <th className="pb-2 text-right">Profit</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => {
            const cost = b.items.reduce((acc, item) => acc + ((item.purchasePrice || 0) * item.qty), 0);
            const profit = b.grandTotal - (b.tax || 0) - cost;
            const itemsList = b.items.map(i => `${i.name} (${i.qty})`).join(', ');
            return (
              <tr key={b._id} className="border-b border-gray-200">
                <td className="py-2 font-mono">{formatBillNumber(b.billNumber)}</td>
                <td className="py-2">{new Date(b.date).toLocaleDateString()}</td>
                <td className="py-2 truncate max-w-xs">{itemsList}</td>
                <td className="py-2 text-right">₹{b.grandTotal.toFixed(2)}</td>
                <td className="py-2 text-right">₹{profit.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="text-right text-sm font-bold border-t pt-2">
        <p>Total Orders: {bills.length}</p>
        <p>Total Revenue: ₹{bills.reduce((a,b)=>a+(b.grandTotal||0),0).toFixed(2)}</p>
      </div>
    </div>
  );
};

// --- APP SECTIONS ---

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => (
  <div className="w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-10 shadow-lg print:hidden">
    <div className="p-6 flex flex-col items-center border-b bg-[#fcfaff]">
      <div className="w-20 h-20 mb-3 bg-white rounded-xl p-1 border border-gray-100"><img src="/Anura.png" alt="Logo" className="w-full h-full object-contain" onError={(e)=>{e.target.style.display='none'}}/></div>
      <h1 className="font-bold text-xl text-[#2e0f3e]">ANURA</h1>
      <p className="text-xs text-[#8e44ad] font-medium mt-1">Reliable Accounting</p>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {[
        { id: 'setup', label: 'Store Setup', icon: Store },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'billing', label: 'Billing', icon: ShoppingCart },
        { id: 'reports', label: 'Sales Report', icon: BarChart3 },
        { id: 'about', label: 'About', icon: Info },
      ].map((item) => (
        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#4a1d56] text-white shadow-md' : 'text-gray-500 hover:bg-[#f4ecf7] hover:text-[#4a1d56]'}`}>
          <item.icon size={20} />{item.label}
        </button>
      ))}
    </nav>
    <div className="p-4 border-t"><button onClick={handleLogout} className="w-full flex items-center gap-2 justify-center text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors font-medium"><LogOut size={18} /> Logout</button></div>
  </div>
);

const StoreSetup = ({ storeData, setStoreData, token, fetchData }) => {
  const [password, setPassword] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleChange = (e) => setStoreData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    try { await axios.put(`${API_URL}/store-config`, storeData, { headers: { Authorization: `Bearer ${token}` } }); alert("Saved!"); } catch { alert("Error"); }
  };

  const handleClearData = async () => {
    if (!password) return alert("Enter password to confirm");
    try {
      await axios.delete(`${API_URL}/sales-data`, { headers: { Authorization: `Bearer ${token}` }, data: { password } });
      alert("Success! Sales history cleared and Bill Number reset to 000001.");
      setPassword(''); setShowClearConfirm(false);
      fetchData(); 
    } catch (err) { alert(err.response?.data?.error || "Error clearing data"); }
  };

  return (
    <div className="max-w-4xl mx-auto print:hidden space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8daef] p-8">
        <h2 className="text-2xl font-bold text-[#2e0f3e] mb-6 flex items-center gap-2"><Store className="text-[#8e44ad]" /> Store Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1"><label className="text-sm font-bold text-[#4a1d56]">Store Name</label><input name="storeName" value={storeData.storeName} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#8e44ad]" /></div>
          <div className="space-y-1"><label className="text-sm font-bold text-[#4a1d56]">Phone</label><input name="phone" value={storeData.phone} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#8e44ad]" /></div>
          <div className="space-y-1"><label className="text-sm font-bold text-[#4a1d56]">Email</label><input name="email" value={storeData.email} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#8e44ad]" /></div>
          <div className="space-y-1"><label className="text-sm font-bold text-[#4a1d56]">GST Number</label><input name="gst" value={storeData.gst} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#8e44ad]" /></div>
          <div className="space-y-1"><label className="text-sm font-bold text-[#4a1d56]">Tax Rate (%)</label><input type="number" name="taxRate" value={storeData.taxRate} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#8e44ad]" /></div>
          <div className="space-y-1 md:col-span-2"><label className="text-sm font-bold text-[#4a1d56]">Address</label><input name="address" value={storeData.address} onChange={handleChange} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#8e44ad]" /></div>
        </div>
        <div className="mt-8"><button onClick={handleSave} className="bg-[#4a1d56] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2e0f3e] transition-colors"><Save size={20} /> Save Settings</button></div>
      </div>

      <div className="bg-red-50 rounded-2xl border border-red-200 p-8">
        <h3 className="text-red-700 font-bold text-lg flex items-center gap-2 mb-2"><AlertTriangle size={20}/> Danger Zone</h3>
        <p className="text-red-600 text-sm mb-4">Clear all sales history and reset Bill Number to 000001. This action cannot be undone.</p>
        
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)} className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors">Clear All Sales Data</button>
        ) : (
          <div className="flex gap-3 items-center">
            <input type="password" placeholder="Confirm Password" className="p-2 border border-red-300 rounded-lg outline-none text-sm w-48 focus:border-red-500" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleClearData} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700">Confirm Delete</button>
            <button onClick={() => setShowClearConfirm(false)} className="text-gray-500 text-sm underline hover:text-gray-700">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Inventory = ({ products, refreshProducts, token }) => {
  const [newProduct, setNewProduct] = useState({ id: '', name: '', category: 'General', purchasePrice: '', sellingPrice: '', qty: '', minStock: '5' });
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.sellingPrice) return alert("Details required");
    try {
      const payload = { ...newProduct, barcode: newProduct.id || Math.random().toString(36).substr(2, 9), qty: parseInt(newProduct.qty), purchasePrice: parseFloat(newProduct.purchasePrice), sellingPrice: parseFloat(newProduct.sellingPrice) };
      await axios.post(`${API_URL}/products`, payload, { headers: { Authorization: `Bearer ${token}` } });
      refreshProducts(); setNewProduct({ id: '', name: '', category: 'General', purchasePrice: '', sellingPrice: '', qty: '', minStock: '5' });
      alert("Stock Updated Successfully!");
    } catch { alert("Error saving product"); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      refreshProducts();
      alert("Product deleted!");
    } catch (err) { alert("Error deleting product"); }
  };

  return (
    <div className="space-y-6 print:hidden">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8daef] p-6">
        <h3 className="text-lg font-bold text-[#2e0f3e] mb-4 border-b pb-2">Add Stock</h3>
        <p className="text-xs text-gray-500 mb-4">Adding a product with an existing barcode will increase its stock quantity.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1"><label className="text-xs font-bold text-[#4a1d56]">Barcode</label><input value={newProduct.id} onChange={e => setNewProduct({...newProduct, id: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8e44ad] outline-none" placeholder="Scan..." /></div>
          <div className="md:col-span-2"><label className="text-xs font-bold text-[#4a1d56]">Product Name</label><input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8e44ad] outline-none" placeholder="Enter name" /></div>
          <div><label className="text-xs font-bold text-[#4a1d56]">Category</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 border rounded bg-white outline-none">{["General", "Electronics", "Groceries", "Snacks"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="text-xs font-bold text-[#4a1d56]">Purchase Price</label><input type="number" value={newProduct.purchasePrice} onChange={e => setNewProduct({...newProduct, purchasePrice: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8e44ad] outline-none" placeholder="0.00" /></div>
          <div><label className="text-xs font-bold text-[#4a1d56]">Selling Price</label><input type="number" value={newProduct.sellingPrice} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8e44ad] outline-none" placeholder="0.00" /></div>
          <div><label className="text-xs font-bold text-[#4a1d56]">Quantity</label><input type="number" value={newProduct.qty} onChange={e => setNewProduct({...newProduct, qty: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#8e44ad] outline-none" placeholder="0" /></div>
        </div>
        <button onClick={handleAddProduct} className="mt-4 bg-[#8e44ad] text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:bg-[#4a1d56] transition-colors">+ Add to Inventory</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8daef] p-6">
        <h3 className="text-lg font-bold text-[#2e0f3e] mb-4">Inventory</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#f4ecf7] text-[#4a1d56] uppercase">
              <th className="p-3">Barcode</th>
              <th className="p-3">Name</th>
              <th className="p-3">Qty</th>
              <th className="p-3 text-right">Cost</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>{products.map(p => (
            <tr key={p._id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-mono text-gray-500">{p.barcode}</td>
              <td className="p-3 font-medium">{p.name}</td>
              <td className={`p-3 font-bold ${p.qty<5?'text-red-500':'text-gray-700'}`}>{p.qty}</td>
              <td className="p-3 text-right text-gray-500">₹{p.purchasePrice}</td>
              <td className="p-3 text-right font-bold text-[#4a1d56]">₹{p.sellingPrice}</td>
              <td className="p-3 text-center">
                <button onClick={() => handleDeleteProduct(p._id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Billing = ({ products, refreshProducts, storeData, setPrintMode, setPrintData, token }) => {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');

  const addToCart = (p) => {
    const ex = cart.find(i => i._id === p._id);
    setCart(ex ? cart.map(i => i._id === p._id ? {...i, qty: i.qty+1} : i) : [...cart, {...p, qty:1}]);
  };
  
  const handleCheckout = async () => {
    if (!cart.length) return alert("Empty Cart");
    const subtotal = cart.reduce((acc, i) => acc + (i.sellingPrice * i.qty), 0);
    const tax = (subtotal * (parseFloat(storeData.taxRate)||0))/100;
    const total = subtotal + tax - parseFloat(discount||0);
    const payload = {
      customerName: customerName || 'Walk-in',
      items: cart.map(c => ({ productId: c.barcode, name: c.name, qty: c.qty, price: c.sellingPrice })),
      subtotal, tax, discount: parseFloat(discount), grandTotal: total, paymentMode
    };

    try {
      const res = await axios.post(`${API_URL}/bills`, payload, { headers: { Authorization: `Bearer ${token}` } });
      refreshProducts(); setCart([]); setCustomerName(''); setDiscount(0);
      setPrintData(res.data);
      setPrintMode('invoice');
      setTimeout(() => window.print(), 500);
    } catch { alert("Error generating bill"); }
  };
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)] print:hidden">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e8daef]">
            <div className="relative">
                <Search className="absolute left-3 top-3.5 text-[#8e44ad]" size={20} />
                <input className="w-full pl-10 p-3 bg-[#faf5fc] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#8e44ad] transition-all" placeholder="Scan barcode or search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 overflow-y-auto max-h-48 p-1">
                {filtered.map(p => <button key={p._id} onClick={() => addToCart(p)} className="text-left p-3 rounded-xl border border-gray-100 hover:border-[#8e44ad] hover:bg-[#faf5fc] group"><div className="font-bold text-gray-700 group-hover:text-[#4a1d56] truncate">{p.name}</div><div className="text-xs text-gray-400 group-hover:text-[#8e44ad] font-bold">₹{p.sellingPrice}</div></button>)}
            </div>
        </div>
        <div className="bg-white flex-1 rounded-2xl shadow-sm border border-[#e8daef] overflow-auto p-0 flex flex-col">
            <div className="bg-[#4a1d56] text-white p-3 text-sm font-bold grid grid-cols-4 rounded-t-2xl">
                <span>Product</span><span className="text-center">Qty</span><span className="text-right">Total</span><span className="text-center">Action</span>
            </div>
            <div className="flex-1 overflow-y-auto">
                {cart.map(i => (
                    <div key={i._id} className="grid grid-cols-4 p-3 border-b items-center text-sm hover:bg-gray-50">
                        <span className="font-medium">{i.name}</span>
                        <div className="flex justify-center items-center gap-2">
                            <button onClick={()=>setCart(cart.map(c=>c._id===i._id?{...c,qty:Math.max(1,c.qty-1)}:c))} className="w-6 h-6 bg-gray-200 rounded text-gray-600 font-bold">-</button>
                            <span>{i.qty}</span>
                            <button onClick={()=>setCart(cart.map(c=>c._id===i._id?{...c,qty:c.qty+1}:c))} className="w-6 h-6 bg-gray-200 rounded text-gray-600 font-bold">+</button>
                        </div>
                        <span className="text-right font-bold text-[#4a1d56]">₹{i.sellingPrice*i.qty}</span>
                        <button onClick={()=>setCart(cart.filter(c=>c._id!==i._id))} className="text-red-400 hover:text-red-600 flex justify-center"><X size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
      </div>
      <div className="bg-[#4a1d56] text-white rounded-2xl shadow-lg p-6 flex flex-col">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Printer size={20}/> Checkout</h3>
        <input className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white mb-4 placeholder-white/50 outline-none focus:bg-white/20" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        <div className="space-y-3 mb-6">
             <div className="flex justify-between text-sm text-white/80"><span>Subtotal</span><span>₹{cart.reduce((a,i)=>a+i.sellingPrice*i.qty,0).toFixed(2)}</span></div>
             <div className="flex justify-between text-sm text-white/80"><span>Tax ({storeData.taxRate}%)</span><span>₹{((cart.reduce((a,i)=>a+i.sellingPrice*i.qty,0) * (parseFloat(storeData.taxRate)||0))/100).toFixed(2)}</span></div>
             <div className="flex justify-between items-center text-sm text-white/80"><span>Discount (₹)</span><input type="number" className="w-24 p-1 bg-white/10 border border-white/30 rounded text-right text-white outline-none focus:bg-white/20" value={discount} onChange={e => setDiscount(e.target.value)} /></div>
             <div className="pt-3 border-t border-white/20 flex justify-between items-end"><span className="font-bold">Total</span><span className="text-3xl font-bold text-[#e0b0ff]">₹{(cart.reduce((a,c)=>a+c.sellingPrice*c.qty,0) * (1+(parseFloat(storeData.taxRate)||0)/100) - discount).toFixed(2)}</span></div>
        </div>
        <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPaymentMode('Cash')} className={`p-3 rounded-xl border text-center transition-all ${paymentMode === 'Cash' ? 'bg-white text-[#4a1d56] font-bold' : 'border-white/20 text-white/70 hover:bg-white/10'}`}>Cash</button>
              <button onClick={() => setPaymentMode('UPI')} className={`p-3 rounded-xl border text-center transition-all ${paymentMode === 'UPI' ? 'bg-white text-[#4a1d56] font-bold' : 'border-white/20 text-white/70 hover:bg-white/10'}`}>UPI</button>
            </div>
        </div>
        <button onClick={handleCheckout} className="w-full mt-auto bg-[#8e44ad] text-white py-4 rounded-xl font-bold hover:bg-[#9b59b6] shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all"><CheckCircle size={20}/> Complete & Print</button>
      </div>
    </div>
  );
};

const SalesReport = ({ bills, storeData, setPrintMode, setPrintData }) => {
  const handlePrintReport = () => {
    setPrintMode('report');
    setTimeout(() => window.print(), 300);
  };

  const handlePrintBill = (bill) => {
    setPrintData(bill);
    setPrintMode('invoice');
    setTimeout(() => window.print(), 300);
  }

  const totalRev = bills.reduce((a,b)=>a+(b.grandTotal||0),0);
  const totalProfit = bills.reduce((accBill, bill) => {
    const billCost = bill.items.reduce((accItem, item) => accItem + ((item.purchasePrice || 0) * item.qty), 0);
    return accBill + (bill.grandTotal - (bill.tax || 0) - billCost);
  }, 0);

  return (
    <div className="space-y-6 print:hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2e0f3e]">Sales Dashboard</h2>
        <button onClick={handlePrintReport} className="bg-[#4a1d56] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#2e0f3e]"><Printer size={16}/> Print / Save Report</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e8daef] text-center shadow-sm"><div className="text-4xl font-bold text-[#4a1d56]">₹{totalRev.toFixed(2)}</div><div className="text-xs font-bold uppercase text-[#8e44ad] tracking-widest mt-1">Total Revenue</div></div>
          <div className="bg-white p-6 rounded-2xl border border-[#e8daef] text-center shadow-sm"><div className="text-4xl font-bold text-green-600">₹{totalProfit.toFixed(2)}</div><div className="text-xs font-bold uppercase text-green-700 tracking-widest mt-1">Total Profit</div></div>
          <div className="bg-white p-6 rounded-2xl border border-[#e8daef] text-center shadow-sm"><div className="text-4xl font-bold text-[#8e44ad]">{bills.length}</div><div className="text-xs font-bold uppercase text-[#4a1d56] tracking-widest mt-1">Orders</div></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8daef] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f4ecf7] text-[#4a1d56] font-bold"><tr><th className="p-4">Bill #</th><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Items Sold</th><th className="p-4">Paid Via</th><th className="p-4 text-right">Amount</th><th className="p-4 text-center">Action</th></tr></thead>
          <tbody>{bills.map(b => (
            <tr key={b._id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-mono text-gray-500">{formatBillNumber(b.billNumber)}</td>
              <td className="p-4">{new Date(b.date).toLocaleDateString()}</td>
              <td className="p-4 font-medium">{b.customerName}</td>
              <td className="p-4 text-gray-600 text-xs max-w-xs truncate">{b.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</td>
              <td className="p-4"><span className="px-2 py-1 bg-purple-50 text-[#8e44ad] rounded text-xs border border-purple-100 font-bold">{b.paymentMode}</span></td>
              <td className="p-4 text-right font-bold text-[#4a1d56]">₹{b.grandTotal.toFixed(2)}</td>
              <td className="p-4 text-center"><button onClick={() => handlePrintBill(b)} className="text-[#4a1d56] hover:bg-purple-50 p-2 rounded-full transition-colors"><Download size={16}/></button></td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const About = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 print:hidden">
    <div className="bg-white rounded-2xl shadow-xl border border-[#e8daef] overflow-hidden">
      <div className="bg-[#4a1d56] p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 rounded-full blur-3xl transform scale-150"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-2xl p-2 shadow-lg"><img src="/Anura.png" alt="Logo" className="w-full h-full object-contain"/></div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">ANURA</h1>
          <p className="text-purple-200 font-medium text-lg">Store Management System</p>
          <div className="inline-block mt-4 px-4 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/20">Version 2.4.0</div>
        </div>
      </div>
      
      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-50 text-[#4a1d56] rounded-xl flex items-center justify-center mx-auto mb-3"><LayoutDashboard/></div>
            <h3 className="font-bold text-gray-800">Inventory Control</h3>
            <p className="text-sm text-gray-500 mt-1">Real-time stock tracking and low inventory alerts.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-50 text-[#4a1d56] rounded-xl flex items-center justify-center mx-auto mb-3"><FileText/></div>
            <h3 className="font-bold text-gray-800">Smart Invoicing</h3>
            <p className="text-sm text-gray-500 mt-1">GST-compliant billing with thermal print support.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-50 text-[#4a1d56] rounded-xl flex items-center justify-center mx-auto mb-3"><BarChart3/></div>
            <h3 className="font-bold text-gray-800">Profit Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">Detailed revenue and profit reports for growth.</p>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-center font-bold text-[#4a1d56] uppercase tracking-widest text-sm mb-6">Developer Information</h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-gray-600 text-sm">
            <div className="flex items-center gap-2"><UserIcon size={16} className="text-[#8e44ad]"/> <span>Aaryasingh Thakur</span></div>
            <div className="flex items-center gap-2"><Mail size={16} className="text-[#8e44ad]"/> <span>aarysinghttc@gmail.com</span></div>
            <div className="flex items-center gap-2"><Globe size={16} className="text-[#8e44ad]"/> <span>www.aaryathakur.com</span></div>
          </div>
          <div className="text-center mt-8 text-xs text-gray-400">
            <p>Developed for Premshankar Singh Thakur & Company.</p>
            <p>© 2025 Aaryasingh Thakur. All rights reserved. Unauthorized reproduction is prohibited.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('billing');
  const [storeData, setStoreData] = useState({ storeName: '', phone: '', email: '', gst: '', taxRate: '18', address: '' });
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]); 
  const [printData, setPrintData] = useState(null);
  const [printMode, setPrintMode] = useState('invoice'); // 'invoice' or 'report'

  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pRes, bRes, sRes] = await Promise.all([
        axios.get(`${API_URL}/products`, { headers }),
        axios.get(`${API_URL}/bills`, { headers }),
        axios.get(`${API_URL}/store-config`, { headers })
      ]);
      setProducts(pRes.data);
      setBills(bRes.data);
      if (sRes.data) setStoreData(sRes.data);
    } catch (e) { console.error("Fetch error", e); }
  };

  useEffect(() => { fetchData(); }, [token]);
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  if (!token) return <AuthScreen setToken={setToken} />;

  return (
    <div className="flex min-h-screen bg-[#f8f5fa] text-gray-900 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto print:hidden">
        <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#2e0f3e] capitalize">{activeTab}</h2>
              <p className="text-[#8e44ad] text-sm opacity-80">Manage your business efficiently</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#27ae60] bg-[#eafaf1] px-4 py-2 rounded-full border border-[#d5f5e3] shadow-sm">
                <div className="w-2 h-2 bg-[#27ae60] rounded-full animate-pulse"></div>
                System Online
            </div>
        </header>
        {activeTab === 'setup' && <StoreSetup storeData={storeData} setStoreData={setStoreData} token={token} fetchData={fetchData} />}
        {activeTab === 'inventory' && <Inventory products={products} refreshProducts={fetchData} token={token} />}
        {activeTab === 'billing' && <Billing products={products} refreshProducts={fetchData} storeData={storeData} setPrintData={setPrintData} setPrintMode={setPrintMode} token={token} />}
        {activeTab === 'reports' && <SalesReport bills={bills} storeData={storeData} setPrintMode={setPrintMode} setPrintData={setPrintData} />}
        {activeTab === 'about' && <About />}
      </main>
      
      {/* PRINT CONTAINERS */}
      {printMode === 'invoice' && <InvoiceTemplate bill={printData} storeData={storeData} />}
      {printMode === 'report' && <ReportTemplate bills={bills} storeData={storeData} />}
    </div>
  );
}