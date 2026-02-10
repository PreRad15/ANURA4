# ANURA SMS – Store Management System

**A New User-friendly Reliable Accounting System**

ANURA SMS is a comprehensive full-stack web application designed to digitize retail operations.  
It replaces manual ledgers with a secure, automated system for inventory tracking, sequential invoicing, and real-time profit analysis.

---

## 🌟 Features

### 🔐 Secure Authentication
- User registration and login system
- JWT-based authentication
- Data is private and isolated per user

### 📦 Smart Inventory
- Real-time stock tracking
- Adding existing products automatically increments stock quantity

### 🧾 Point of Sale (POS)
- Fast billing interface
- Barcode scanning support
- Auto-tax calculation
- Discount management

### 📄 Professional Invoicing
- Thermal-printer friendly invoices
- Auto-incrementing bill numbers (e.g., `000001`)

### 📊 Insightful Reporting
- Detailed sales reports
- PDF export
- Profit and revenue analysis

### ⚠️ Data Management (Danger Zone)
- Secure reset of sales data and bill counters
- Password re-authentication required

---

## 📖 Project Story (STAR Method)

### S – Situation (The Challenge)
Small retail businesses often rely on notebooks and calculators for inventory and billing.  
This leads to errors, lack of insights, and wasted time. Existing software solutions are often too complex, expensive, or hardware-dependent.

### T – Task (The Objective)
To build a lightweight, web-based Store Management System that is:
- **Comprehensive** – inventory to invoicing
- **Secure** – private data per shop owner
- **Intelligent** – auto taxes, discounts, bill sequencing
- **Insightful** – PDF reports and profit analysis

### A – Action (The Implementation)
Built a full-stack solution using the **MERN Stack**:

**Frontend**
- React.js with Tailwind CSS
- Responsive POS interface
- Barcode/manual product search
- Dynamic cart management

**Backend**
- Node.js + Express REST API
- Auto-incrementing invoice logic
- Profit tracking using purchase price at sale time
- JWT authentication & Bcrypt hashing
- Secure “Danger Zone” for sensitive actions

**Reporting**
- Client-side PDF generation using `jsPDF`
- Printable thermal-style invoices

### R – Result (The Outcome)
ANURA SMS delivers a cloud-hosted SaaS solution that transforms retail operations:

- ⚡ Faster checkout
- 📊 Clear daily revenue & profit
- 🧾 Professional customer invoices
- 📦 Better inventory control
- 🔐 Secure and reliable data handling

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- Lucide Icons
- Axios

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB Atlas (Cloud)

**Authentication**
- JSON Web Tokens (JWT)
- Bcrypt

**Tools**
- Vite
- jsPDF

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB Atlas account

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/anura-sms.git
cd anura-sms


# ================================
# 2. Backend Setup
# ================================

cd backend
npm install

# Create a .env file in the backend folder
# Add the following variables inside it

PORT=
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Start the backend server
node server.js


# ================================
# 3. Frontend Setup
# ================================

# Open a new terminal window
cd client
npm install
npm run dev
```

**📝 Usage Guide**
- Register: Create a new account to access your private dashboard.
- Store Setup: Go to "Store Setup" to configure your shop name, address, GST, and tax rates.
- Inventory: Add products. If a barcode already exists, the stock will automatically increment.
- Billing: Add items to the cart, apply discounts, select payment mode (Cash/UPI), and print the invoice.
- Reports: View detailed sales history, analyze profit margins, and download PDF reports.


**🛡️ License**
- This project is licensed under the MIT License.

**👨‍💻 Developer Information**
- Developed by Aaryasingh Thakur
- © 2026 Aaryaingh Thakur. All rights reserved.

---