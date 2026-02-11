import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Store, ShoppingCart, Package, Info, 
  Save, Search, BarChart3, CheckCircle, X, Printer, LogOut, User as UserIcon, Lock, 
  Download, Trash2, AlertTriangle, Menu, MapPin, Globe, Moon, Sun, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';

// --- CONFIGURATION ---
// Using Render backend. Uncomment import.meta... for Vercel production if needed.
const API_URL = 'https://anura-sms.onrender.com/api';
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- TRANSLATIONS ---
const t = {
  en: {
    billing: "Billing", inventory: "Inventory", reports: "Sales Report", setup: "Store Setup", user: "User Profile", about: "About",
    scan: "Scan Barcode...", search: "Search Product...", category: "Category", 
    addProd: "Add Product", prodName: "Product Name", cost: "Cost Price", sell: "Selling Price", qty: "Quantity", expiry: "Expiry Date",
    custName: "Customer Name", custPhone: "Customer Phone", total: "Total", print: "Complete & Print",
    rev: "Total Revenue", prof: "Total Profit", orders: "Orders",
    welcome: "Welcome to ANURA", signin: "Sign In", register: "Register", otp: "Enter OTP", verify: "Verify",
    danger: "Danger Zone", clear: "Clear Data", logout: "Logout"
  },
  hi: {
    billing: "बिलिंग", inventory: "इन्वेंटरी", reports: "बिक्री रिपोर्ट", setup: "दुकान सेटअप", user: "प्रोफ़ाइल", about: "परिचय",
    scan: "बारकोड स्कैन...", search: "खोजें...", category: "श्रेणी",
    addProd: "उत्पाद जोड़ें", prodName: "उत्पाद का नाम", cost: "लागत", sell: "विक्रय मूल्य", qty: "मात्रा", expiry: "समाप्ति तिथि",
    custName: "ग्राहक का नाम", custPhone: "ग्राहक फोन", total: "कुल", print: "प्रिंट करें",
    rev: "कुल राजस्व", prof: "कुल लाभ", orders: "आर्डर",
    welcome: "अनुरा में स्वागत है", signin: "लॉग इन", register: "रजिस्टर", otp: "ओटीपी", verify: "सत्यापित",
    danger: "खतरा क्षेत्र", clear: "डेटा साफ़ करें", logout: "लॉग आउट"
  },
  de: {
    billing: "Abrechnung", inventory: "Inventar", reports: "Berichte", setup: "Einstellungen", user: "Profil", about: "Über",
    scan: "Scannen...", search: "Suchen...", category: "Kategorie",
    addProd: "Produkt hinzufügen", prodName: "Produktname", cost: "Einkaufspreis", sell: "Verkaufspreis", qty: "Menge", expiry: "Verfallsdatum",
    custName: "Kundenname", custPhone: "Telefon", total: "Gesamt", print: "Drucken",
    rev: "Einnahmen", prof: "Gewinn", orders: "Bestellungen",
    welcome: "Willkommen", signin: "Anmelden", register: "Registrieren", otp: "OTP", verify: "Prüfen",
    danger: "Gefahrenzone", clear: "Daten löschen", logout: "Abmelden"
  }
};

// --- UTILS ---
const formatBillNumber = (num) => String(num).padStart(6, '0');

// --- AUTH SCREEN ---
const AuthScreen = ({ setToken, setUserData }) => {
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', email: '', otp: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/login`, form);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUserData({ email: res.data.email, username: res.data.username });
      } else {
        await axios.post(`${API_URL}/auth/initiate-register`, form);
        setStep(2);
      }
    } catch (err) { setError(err.response?.data?.error || 'Connection Error. Is Backend Running?'); }
  };

  const verify = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/verify-register`, form);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUserData({ email: res.data.email, username: res.data.username });
    } catch (err) { setError(err.response?.data?.error || 'Verification Failed'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">ANURA</h1>
          <p className="text-gray-500">Store Management System</p>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={submit} className="space-y-4">
            {!isLogin && <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad]" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />}
            <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad]" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} required />
            <input type="password" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad]" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
            <button className="w-full bg-[#4a1d56] text-white p-3 rounded-xl font-bold hover:bg-[#2e0f3e] transition-all shadow-lg">{isLogin ? t.en.signin : 'Get OTP'}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <p className="text-center text-sm">OTP sent to {form.email}</p>
            <input className="w-full p-3 border rounded-xl text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-[#8e44ad]" placeholder="000000" value={form.otp} onChange={e=>setForm({...form, otp:e.target.value})} required />
            <button className="w-full bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg">{t.en.verify}</button>
          </form>
        )}
        {step === 1 && <div className="mt-6 text-center"><button onClick={()=>setIsLogin(!isLogin)} className="text-sm text-[#8e44ad] hover:underline font-medium">{isLogin ? "New User? Register" : "Have Account? Login"}</button></div>}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS (Moved outside App to prevent re-renders) ---

const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, lang, setLang, handleLogout }) => (
  <div className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white dark:bg-gray-800 border-r flex flex-col fixed h-full z-20 print:hidden shadow-lg`}>
    <div className="p-6 border-b flex flex-col items-center justify-center bg-[#fcfaff] dark:bg-gray-800">
      {sidebarOpen ? (
        <>
          <div className="w-16 h-16 mb-2 bg-white rounded-xl p-1 border border-[#e8daef]"><img src="/Anura.png" alt="Logo" className="w-full h-full object-contain" onError={(e)=>{e.target.style.display='none'}}/></div>
          <h1 className="font-bold text-xl text-[#2e0f3e] dark:text-white">ANURA</h1>
          <p className="text-xs text-[#8e44ad]">Reliable Accounting</p>
        </>
      ) : (
        <div className="w-10 h-10 bg-[#4a1d56] rounded-xl text-white flex items-center justify-center font-bold text-lg">A</div>
      )}
    </div>
    <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
      {['billing', 'inventory', 'reports', 'user', 'setup', 'about'].map(id => (
        <button key={id} onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${activeTab === id ? 'bg-[#4a1d56] text-white shadow-md shadow-purple-200' : 'text-gray-500 hover:bg-[#f4ecf7] hover:text-[#4a1d56] dark:text-gray-300 dark:hover:bg-gray-700'}`}>
          {id === 'billing' && <ShoppingCart size={22}/>}
          {id === 'inventory' && <Package size={22}/>}
          {id === 'reports' && <BarChart3 size={22}/>}
          {id === 'user' && <UserIcon size={22}/>}
          {id === 'setup' && <Store size={22}/>}
          {id === 'about' && <Info size={22}/>}
          {sidebarOpen && <span className="font-medium capitalize">{t[lang][id]}</span>}
        </button>
      ))}
    </nav>
    {sidebarOpen && (
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
        <select value={lang} onChange={e=>setLang(e.target.value)} className="w-full p-2 mb-3 border rounded-lg text-sm dark:bg-gray-700 dark:text-white outline-none">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="de">German</option>
        </select>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 justify-center p-2 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"><LogOut size={16}/> {t[lang].logout}</button>
      </div>
    )}
  </div>
);

const Billing = ({ products, refresh, storeData, setPrintData, setPrintMode, token, lang }) => {
  const [cart, setCart] = useState([]);
  const [term, setTerm] = useState('');
  const [cat, setCat] = useState('All');
  const [cust, setCust] = useState({ name: '', phone: '' });
  const [disc, setDisc] = useState(0); 
  const [mode, setMode] = useState('Cash');

  useEffect(() => {
      const match = products.find(p => p.barcode === term);
      if (match) {
          setCart(prev => {
              const exist = prev.find(i => i._id === match._id);
              return exist ? prev.map(i => i._id === match._id ? {...i, qty: i.qty + 1} : i) : [...prev, {...match, qty: 1}];
          });
          setTerm('');
      }
  }, [term]);

  const addToCart = (p) => {
    setCart(prev => {
      const exist = prev.find(i => i._id === p._id);
      return exist ? prev.map(i => i._id === p._id ? {...i, qty: i.qty + 1} : i) : [...prev, {...p, qty: 1}];
    });
  };

  const checkout = async () => {
      if(!cart.length) return alert("Cart is empty!");
      const sub = cart.reduce((a,i)=>a+i.sellingPrice*i.qty,0);
      const tax = (sub * (parseFloat(storeData.taxRate)||0))/100;
      const total = sub + tax - parseFloat(disc);
      const payload = {
          customerName: cust.name || 'Walk-in', customerPhone: cust.phone,
          items: cart.map(i=>({productId:i.barcode, name:i.name, qty:i.qty, price:i.sellingPrice})),
          subtotal: sub, tax, discount: disc, grandTotal: total, paymentMode: mode
      };
      try {
        const res = await axios.post(`${API_URL}/bills`, payload, { headers: { Authorization: `Bearer ${token}` } });
        refresh(); setCart([]); setCust({name:'', phone:''}); setDisc(0);
        document.title = `Bill-${String(res.data.billNumber).padStart(6,'0')}`;
        setPrintData(res.data);
        setPrintMode('invoice');
        setTimeout(() => { window.print(); document.title = "ANURA SMS"; }, 500);
      } catch (e) {
        alert("Error creating bill. Check backend.");
      }
  };

  const filtered = products.filter(p => (cat === 'All' || p.category === cat) && (p.name.toLowerCase().includes(term.toLowerCase()) || p.barcode.includes(term)));
  const categories = ['All', ...new Set(products.map(p=>p.category))];

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-[#e8daef] flex gap-3">
                  <div className="relative flex-1">
                      <Search className="absolute left-3 top-3.5 text-[#8e44ad]" size={20} />
                      <input autoFocus value={term} onChange={e=>setTerm(e.target.value)} placeholder={t[lang].scan} className="w-full pl-10 p-3 bg-[#faf5fc] border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#8e44ad] transition-all dark:bg-gray-700 dark:text-white" />
                  </div>
                  <select value={cat} onChange={e=>setCat(e.target.value)} className="p-3 border border-transparent bg-[#faf5fc] rounded-xl outline-none focus:bg-white focus:border-[#8e44ad] dark:bg-gray-700 dark:text-white">{categories.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-48 p-1">
                  {filtered.map(p=><button key={p._id} onClick={()=>addToCart(p)} className="p-3 border border-gray-100 rounded-xl bg-white hover:border-[#8e44ad] hover:bg-[#faf5fc] group text-left transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700"><div className="font-bold text-gray-700 group-hover:text-[#4a1d56] truncate dark:text-gray-200">{p.name}</div><div className="text-xs text-gray-400 font-bold dark:text-gray-500">₹{p.sellingPrice}</div></button>)}
              </div>
              <div className="bg-white dark:bg-gray-800 flex-1 rounded-2xl shadow-sm border border-[#e8daef] overflow-hidden flex flex-col">
                  <div className="bg-[#4a1d56] text-white p-4 text-sm font-bold grid grid-cols-4"><span>Product</span><span className="text-center">Qty</span><span className="text-right">Total</span><span className="text-center">Action</span></div>
                  <div className="flex-1 overflow-y-auto p-2">
                      {cart.map(i=><div key={i._id} className="grid grid-cols-4 p-3 border-b items-center text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"><span className="font-medium">{i.name}</span><div className="flex justify-center items-center gap-2"><button onClick={()=>setCart(cart.map(c=>c._id===i._id?{...c,qty:Math.max(1,c.qty-1)}:c))} className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200">-</button><span>{i.qty}</span><button onClick={()=>setCart(cart.map(c=>c._id===i._id?{...c,qty:c.qty+1}:c))} className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200">+</button></div><span className="text-right font-bold text-[#4a1d56] dark:text-purple-400">₹{i.sellingPrice*i.qty}</span><button onClick={()=>setCart(cart.filter(c=>c._id!==i._id))} className="text-gray-400 hover:text-red-500 flex justify-center"><X size={18}/></button></div>)}
                  </div>
              </div>
          </div>
          <div className="bg-[#4a1d56] text-white rounded-2xl shadow-lg p-6 flex flex-col">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Printer size={20}/> Checkout</h3>
              <input placeholder={t[lang].custName} value={cust.name} onChange={e=>setCust({...cust, name:e.target.value})} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white mb-3 placeholder-white/50 outline-none focus:bg-white/20" />
              <input placeholder={t[lang].custPhone} value={cust.phone} onChange={e=>setCust({...cust, phone:e.target.value})} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white mb-6 placeholder-white/50 outline-none focus:bg-white/20" />
              
              <div className="space-y-3 mb-6 bg-black/20 p-4 rounded-xl">
                   <div className="flex justify-between text-sm text-white/80"><span>Subtotal</span><span>₹{cart.reduce((a,i)=>a+i.sellingPrice*i.qty,0).toFixed(2)}</span></div>
                   <div className="flex justify-between text-sm text-white/80"><span>Tax ({storeData.taxRate}%)</span><span>₹{((cart.reduce((a,i)=>a+i.sellingPrice*i.qty,0) * (parseFloat(storeData.taxRate)||0))/100).toFixed(2)}</span></div>
                   <div className="flex justify-between items-center text-sm text-white/80"><span>Discount (₹)</span><input type="number" className="w-20 p-1 bg-transparent border-b border-white/30 text-right text-white outline-none" value={disc} onChange={e => setDisc(e.target.value)} /></div> 
                   {/* FIXED: Replaced 'discount' with 'disc' in total calculation */}
                   <div className="pt-3 border-t border-white/20 flex justify-between items-end"><span className="font-bold">Total</span><span className="text-3xl font-bold text-[#e0b0ff]">₹{(cart.reduce((a,c)=>a+c.sellingPrice*c.qty,0) * (1+(parseFloat(storeData.taxRate)||0)/100) - disc).toFixed(2)}</span></div> 
              </div>
              
              <div className="mb-6 grid grid-cols-2 gap-3">
                  <button onClick={()=>setMode('Cash')} className={`p-3 rounded-xl border text-center transition-all ${mode==='Cash'?'bg-white text-[#4a1d56] font-bold':'border-white/20 text-white/70 hover:bg-white/10'}`}>Cash</button>
                  <button onClick={()=>setMode('UPI')} className={`p-3 rounded-xl border text-center transition-all ${mode==='UPI'?'bg-white text-[#4a1d56] font-bold':'border-white/20 text-white/70 hover:bg-white/10'}`}>UPI</button>
              </div>
              <button onClick={checkout} className="w-full mt-auto bg-[#8e44ad] text-white py-4 rounded-xl font-bold hover:bg-[#9b59b6] shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all"><CheckCircle size={20}/> {t[lang].print}</button>
          </div>
      </div>
  );
};

const Inventory = ({ products, refresh, token, lang }) => {
  const [form, setForm] = useState({ id: '', name: '', category: 'General', purchasePrice: '', sellingPrice: '', qty: '', expiryDate: '' });
  
  const add = async () => {
      const payload = { ...form, barcode: form.id || Math.random().toString().slice(2,8), expiryDate: form.expiryDate || null };
      try { await axios.post(`${API_URL}/products`, payload, { headers: { Authorization: `Bearer ${token}` } }); refresh(); alert("Saved!"); } catch(e) { alert("Error"); }
  };

  return (
      <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-[#e8daef]">
              <h3 className="text-lg font-bold text-[#2e0f3e] mb-4 border-b pb-2 dark:text-white">{t[lang].addProd}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input value={form.id} onChange={e=>setForm({...form, id:e.target.value})} placeholder="Barcode" className="p-3 border rounded-xl dark:bg-gray-700 dark:text-white" />
                  <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder={t[lang].prodName} className="p-3 border rounded-xl dark:bg-gray-700 dark:text-white md:col-span-2" />
                  <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="p-3 border rounded-xl bg-white dark:bg-gray-700 dark:text-white">{["General", "Groceries", "Pharma", "Electronics"].map(c=><option key={c} value={c}>{c}</option>)}</select>
                  <input type="number" value={form.purchasePrice} onChange={e=>setForm({...form, purchasePrice:e.target.value})} placeholder={t[lang].cost} className="p-3 border rounded-xl dark:bg-gray-700 dark:text-white" />
                  <input type="number" value={form.sellingPrice} onChange={e=>setForm({...form, sellingPrice:e.target.value})} placeholder={t[lang].sell} className="p-3 border rounded-xl dark:bg-gray-700 dark:text-white" />
                  <input type="number" value={form.qty} onChange={e=>setForm({...form, qty:e.target.value})} placeholder={t[lang].qty} className="p-3 border rounded-xl dark:bg-gray-700 dark:text-white" />
                  <input type="date" value={form.expiryDate} onChange={e=>setForm({...form, expiryDate:e.target.value})} className="p-3 border rounded-xl dark:bg-gray-700 dark:text-white" />
              </div>
              <button onClick={add} className="mt-4 bg-[#8e44ad] text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-[#4a1d56] transition-colors">{t[lang].addProd}</button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-[#e8daef] overflow-hidden">
              <table className="w-full text-left text-sm dark:text-white">
                  <thead className="bg-[#f4ecf7] text-[#4a1d56] font-bold dark:bg-gray-900 dark:text-purple-400"><tr><th className="p-4">Item</th><th className="p-4">Expiry</th><th className="p-4">Qty</th><th className="p-4">Action</th></tr></thead>
                  <tbody>{products.map(p => {
                      const isExpiring = p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 7*86400000);
                      return (
                          <tr key={p._id} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                              <td className="p-4 font-medium">{p.name} <br/><span className="text-xs text-gray-500 font-mono">{p.barcode}</span></td>
                              <td className={`p-4 ${isExpiring ? 'text-red-500 font-bold' : ''}`}>{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '-'} {isExpiring && '⚠️'}</td>
                              <td className="p-4">{p.qty}</td>
                              <td className="p-4"><button onClick={async ()=>{if(confirm('Delete?')) { await axios.delete(`${API_URL}/products/${p._id}`, {headers:{Authorization:`Bearer ${token}`}}); refresh(); }}}><Trash2 size={18} className="text-red-400 hover:text-red-600 transition-colors"/></button></td>
                          </tr>
                      )
                  })}</tbody>
              </table>
          </div>
      </div>
  );
};

const Reports = ({ bills, lang, setPrintData, setPrintMode }) => {
  const totalRev = bills.reduce((a,b)=>a+(b.grandTotal||0),0);
  const totalProfit = bills.reduce((acc, b) => {
      const cost = b.items.reduce((ac, i) => ac + ((i.purchasePrice || 0) * i.qty), 0);
      return acc + (b.grandTotal - (b.tax || 0) - cost);
  }, 0);

  return (
  <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-[#e8daef] text-center shadow-sm"><div className="text-4xl font-bold text-[#4a1d56] dark:text-purple-400">₹{totalRev.toFixed(2)}</div><div className="text-xs font-bold uppercase text-[#8e44ad] tracking-widest mt-1">{t[lang].rev}</div></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-[#e8daef] text-center shadow-sm"><div className="text-4xl font-bold text-green-600">₹{totalProfit.toFixed(2)}</div><div className="text-xs font-bold uppercase text-green-700 tracking-widest mt-1">{t[lang].prof}</div></div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-[#e8daef] text-center shadow-sm"><div className="text-4xl font-bold text-[#8e44ad] dark:text-purple-300">{bills.length}</div><div className="text-xs font-bold uppercase text-[#4a1d56] tracking-widest mt-1">{t[lang].orders}</div></div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-[#e8daef] overflow-hidden">
          <table className="w-full text-left text-sm dark:text-white">
              <thead className="bg-[#f4ecf7] text-[#4a1d56] font-bold dark:bg-gray-900 dark:text-purple-400"><tr><th className="p-4">Bill #</th><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4 text-right">Amount</th><th className="p-4 text-center">Action</th></tr></thead>
              <tbody>{bills.map(b => (
                  <tr key={b._id} className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                      <td className="p-4 font-mono text-gray-500">{String(b.billNumber).padStart(6,'0')}</td>
                      <td className="p-4">{new Date(b.date).toLocaleDateString()}</td>
                      <td className="p-4 font-medium">{b.customerName}<br/><span className="text-xs text-gray-500">{b.customerPhone}</span></td>
                      <td className="p-4 text-xs max-w-xs truncate text-gray-600 dark:text-gray-400">{b.items.map(i=>i.name).join(', ')}</td>
                      <td className="p-4 text-right font-bold text-[#4a1d56] dark:text-purple-400">₹{b.grandTotal.toFixed(2)}</td>
                      <td className="p-4 text-center"><button onClick={()=>{setPrintData(b); setPrintMode('invoice'); setTimeout(()=>window.print(), 500)}} className="text-[#8e44ad] hover:bg-purple-50 p-2 rounded-full"><Printer size={18}/></button></td>
                  </tr>
              ))}</tbody>
          </table>
      </div>
  </div>
  );
};

const StoreSettings = ({ storeData, setStoreData, token, lang, refresh }) => {
  const [pwd, setPwd] = useState('');
  const save = async () => { try { await axios.put(`${API_URL}/store-config`, storeData, {headers:{Authorization:`Bearer ${token}`}}); alert("Saved"); } catch { alert("Error"); } };
  const clear = async () => {
      if(!pwd) return alert("Enter password");
      try { await axios.delete(`${API_URL}/sales-data`, {headers:{Authorization:`Bearer ${token}`}, data:{password:pwd}}); refresh(); alert("Cleared!"); } catch { alert("Incorrect Password"); }
  };
  return (
      <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-[#e8daef] space-y-6">
              <h3 className="font-bold text-xl text-[#2e0f3e] dark:text-white flex items-center gap-2"><Store/> {t[lang].setup}</h3>
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1"><label className="text-xs font-bold text-[#4a1d56] dark:text-purple-300">Store Name</label><input value={storeData.storeName} onChange={e=>setStoreData({...storeData, storeName:e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad] dark:bg-gray-700 dark:text-white" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-[#4a1d56] dark:text-purple-300">Phone</label><input value={storeData.phone} onChange={e=>setStoreData({...storeData, phone:e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad] dark:bg-gray-700 dark:text-white" /></div>
                  <div className="space-y-1 col-span-2"><label className="text-xs font-bold text-[#4a1d56] dark:text-purple-300">Address</label><input value={storeData.address} onChange={e=>setStoreData({...storeData, address:e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad] dark:bg-gray-700 dark:text-white" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-[#4a1d56] dark:text-purple-300">GST Number</label><input value={storeData.gst} onChange={e=>setStoreData({...storeData, gst:e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad] dark:bg-gray-700 dark:text-white" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-[#4a1d56] dark:text-purple-300">Tax Rate (%)</label><input value={storeData.taxRate} onChange={e=>setStoreData({...storeData, taxRate:e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#8e44ad] dark:bg-gray-700 dark:text-white" /></div>
              </div>
              <button onClick={save} className="bg-[#4a1d56] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2e0f3e] transition-colors"><Save size={20}/> {t[lang].save}</button>
          </div>
          <div className="bg-red-50 p-8 rounded-2xl border border-red-200">
              <h3 className="text-red-700 font-bold mb-2 flex items-center gap-2"><AlertTriangle/> {t[lang].danger}</h3>
              <p className="text-red-600 text-sm mb-4">Clear all sales history. This action cannot be undone.</p>
              <div className="flex gap-3">
                  <input type="password" placeholder="Confirm Password" value={pwd} onChange={e=>setPwd(e.target.value)} className="p-3 border border-red-300 rounded-xl outline-none focus:border-red-500 w-64" />
                  <button onClick={clear} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700">{t[lang].clear}</button>
              </div>
          </div>
      </div>
  );
};

const UserProfile = ({ userData, lang }) => (
    <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-[#2e0f3e] dark:text-white">{t[lang].user}</h2>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-[#e8daef] max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-700">
                    {/* SAFE ACCESS TO USERNAME */}
                    {userData.username ? userData.username[0].toUpperCase() : 'U'}
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Logged in as</p>
                    <p className="text-2xl font-bold text-[#2e0f3e] dark:text-white">{userData.username}</p>
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-300">Email Address</p>
                <p className="text-lg font-medium text-[#8e44ad] dark:text-purple-300">{userData.email}</p>
            </div>
        </div>
    </div>
);

const AboutPage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
      <div className="relative">
          <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full"></div>
          <div className="w-40 h-40 bg-white rounded-3xl p-4 shadow-2xl relative z-10 flex items-center justify-center border border-[#e8daef]"><img src="/Anura.png" className="w-full h-full object-contain" onError={(e)=>{e.target.style.display='none'}}/></div>
      </div>
      <div>
          <h1 className="text-6xl font-bold text-[#4a1d56] tracking-tight mb-2 dark:text-white">ANURA SMS</h1>
          <p className="text-xl text-gray-500 font-medium">Enterprise Edition v2.6</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-[#e8daef] max-w-lg w-full transform hover:scale-105 transition-all">
          <p className="font-bold text-gray-800 dark:text-white text-lg">Developed by Aaryasingh Thakur </p>
          <p className="font-bold text-gray-800 dark:text-white text-lg"></p>
          <p className="font-bold text-gray-800 dark:text-white text-lg"></p>
          <p className="text-sm text-gray-500 mt-2">Developed For Premshankarsingh Thakur & Company</p>
          <p className="text-sm text-gray-500 mt-2">aaryasinghttc@gmail.com  Aaryasingh Thakur  +91-9209273910.</p>
          <p className="text-sm text-gray-500 mt-2">© 2026 All Rights Reserved.</p>
          <div className="flex justify-center gap-4 mt-6">
              <Globe size={20} className="text-[#8e44ad]"/>
              <UserIcon size={20} className="text-[#8e44ad]"/>
              <Info size={20} className="text-[#8e44ad]"/>
          </div>
      </div>
  </div>
);

// --- INVOICE TEMPLATE ---
const InvoiceTemplate = ({ bill, storeData }) => {
  if (!bill) return null;
  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-[210mm] mx-auto font-sans">
        <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-4xl font-bold uppercase tracking-wider text-black mb-2">{storeData.storeName}</h1>
            <p className="text-sm">{storeData.address}</p>
            <p className="text-sm">Phone: {storeData.phone}</p>
        </div>
        <div className="flex justify-between text-sm mb-6 border-b pb-4">
            <div>
                <p className="font-bold text-lg">Bill No: {formatBillNumber(bill.billNumber)}</p>
                <p>Date: {new Date(bill.date).toLocaleString()}</p>
            </div>
            <div className="text-right">
                <p className="font-bold">Customer: {bill.customerName}</p>
                <p>Phone: {bill.customerPhone}</p>
            </div>
        </div>
        <table className="w-full text-sm mb-6 border-collapse">
            <thead className="border-b-2 border-black">
                <tr><th className="py-2 text-left">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Amount</th></tr>
            </thead>
            <tbody>
                {bill.items.map((i,x)=>(
                    <tr key={x} className="border-b border-gray-300">
                        <td className="py-2 capitalize">{i.name}</td>
                        <td className="py-2 text-center">{i.qty}</td>
                        <td className="py-2 text-right">₹{i.price}</td>
                        <td className="py-2 text-right">₹{i.price*i.qty}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="flex justify-end">
            <div className="w-64 text-right space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{bill.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>₹{bill.tax.toFixed(2)}</span></div>
                {bill.discount > 0 && <div className="flex justify-between text-black font-bold"><span>Discount:</span><span>-₹{bill.discount.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-xl border-t border-black pt-2 mt-2"><span>Total:</span><span>₹{bill.grandTotal.toFixed(2)}</span></div>
                <div className="text-xs mt-2 uppercase tracking-widest border p-1 text-center">Paid via {bill.paymentMode}</div>
            </div>
        </div>
        <div className="text-center mt-12 text-xs border-t pt-4">Thank you for your business! <br/> Generated by ANURA SMS</div>
    </div>
  );
};

const ReportTemplate = ({ bills, storeData }) => (
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
          <th className="pb-2">Customer</th>
          <th className="pb-2">Mode</th>
          <th className="pb-2 text-right">Revenue</th>
          <th className="pb-2 text-right">Profit</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((b) => {
          const cost = b.items.reduce((acc, item) => acc + ((item.purchasePrice || 0) * item.qty), 0);
          const profit = b.grandTotal - (b.tax || 0) - cost;
          return (
            <tr key={b._id} className="border-b border-gray-200">
              <td className="py-2 font-mono">{formatBillNumber(b.billNumber)}</td>
              <td className="py-2">{new Date(b.date).toLocaleDateString()}</td>
              <td className="py-2">{b.customerName}</td>
              <td className="py-2">{b.paymentMode}</td>
              <td className="py-2 text-right">₹{b.grandTotal.toFixed(2)}</td>
              <td className="py-2 text-right">₹{profit.toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState({ email: '', username: '' });
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('billing');
  
  // Data State
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [storeData, setStoreData] = useState({ storeName: '', phone: '', address: '', gst: '', taxRate: '18' });
  const [printData, setPrintData] = useState(null);
  const [printMode, setPrintMode] = useState('');
  
  // Clock & Location State
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('Locating...');

  // Update time every second
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  // Fetch Location on Load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || "Unknown";
          const country = data.address.country || "";
          setLocation(`${city}, ${country}`);
        } catch (error) {
          console.error("Error fetching location:", error);
          setLocation("Location Unavailable");
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        setLocation("Location Denied");
      });
    } else {
      setLocation("GPS Not Supported");
    }
  }, []);

  // Fetch Data
  const refresh = async () => {
    if(!token) return;
    try {
      const h = { headers: { Authorization: `Bearer ${token}` } };
      // First get config to ensure we have tax rates etc.
      const s = await axios.get(`${API_URL}/store-config`, h);
      if(s.data) setStoreData(s.data);

      const [p, b] = await Promise.all([
        axios.get(`${API_URL}/products`, h),
        axios.get(`${API_URL}/bills`, h)
      ]);
      setProducts(p.data);
      setBills(b.data);
      
      // Also set userdata if available
      const userRes = await axios.get(`${API_URL}/store-config`, h); // Re-using store config endpoint for basic auth check
      // For a real app, you'd have a specific /me endpoint, but we can rely on the login response mostly.
      
    } catch(e) { 
      if(e.response?.status === 403) { localStorage.removeItem('token'); setToken(null); }
    }
  };
  
  useEffect(() => { refresh(); }, [token]);

  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  if (!token) return <AuthScreen setToken={setToken} setUserData={setUserData} />;

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-[#f8f5fa] text-gray-900'}`}>
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          lang={lang} 
          setLang={setLang} 
          handleLogout={handleLogout} 
        />
        <main className={`flex-1 flex flex-col h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} print:ml-0`}>
            {/* Header */}
            <header className="h-20 bg-white dark:bg-gray-800 border-b flex items-center justify-between px-8 shadow-sm print:hidden z-10">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 text-[#4a1d56] dark:text-white">{sidebarOpen ? <ChevronLeft size={24}/> : <ChevronRight size={24}/>}</button>
                <div className="flex items-center gap-6">
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">{theme === 'dark' ? <Sun className="text-yellow-400"/> : <Moon className="text-[#4a1d56]"/>}</button>
                    <div className="flex items-center gap-2 text-sm font-bold text-[#4a1d56] bg-purple-50 px-4 py-2 rounded-full border border-purple-100 dark:bg-gray-700 dark:text-purple-300 dark:border-gray-600">
                        <MapPin size={16}/> {location}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 print:hidden">
                {activeTab === 'billing' && <Billing products={products} refresh={refresh} storeData={storeData} setPrintData={setPrintData} setPrintMode={setPrintMode} token={token} lang={lang} />}
                {activeTab === 'inventory' && <Inventory products={products} refresh={refresh} token={token} lang={lang} />}
                {activeTab === 'reports' && <Reports bills={bills} lang={lang} setPrintData={setPrintData} setPrintMode={setPrintMode} />}
                {activeTab === 'setup' && <StoreSettings storeData={storeData} setStoreData={setStoreData} token={token} lang={lang} refresh={refresh} />}
                {activeTab === 'about' && <AboutPage />}
                {activeTab === 'user' && <UserProfile userData={userData} lang={lang} />}
            </div>

            {/* Footer */}
            <footer className="h-10 bg-white dark:bg-gray-800 border-t flex items-center justify-between px-8 text-xs text-gray-500 font-medium print:hidden">
                <div className="flex items-center gap-2"><Calendar size={14} className="text-[#8e44ad]"/> {time.toLocaleString()}</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> System Online</div>
            </footer>
        </main>

        {/* Hidden Invoice / Report - Rendered only when printing */}
        {printMode === 'invoice' && <InvoiceTemplate bill={printData} storeData={storeData} />}
        {printMode === 'report' && <ReportTemplate bills={bills} storeData={storeData} />}
    </div>
  );
}