# Mishkat Store - متجر مشكاة

Islamic gifts and accessories online store built with React.js and Node.js.

## 🌟 Features

- Modern responsive UI with Arabic language support
- Product catalog with categories
- Shopping cart functionality
- Admin panel for product management
- Order management system
- Image upload for products
- RESTful API backend

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Material-UI (MUI)
- React Router
- Axios for API calls

**Backend:**
- Node.js
- Express.js
- JWT Authentication
- Multer for file uploads
- JSON file storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/husseinhaidar99/mishkat-store.git
cd mishkat-store
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../islamic-gifts-shop
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The backend will run on `http://localhost:3001`

2. Start the frontend (in a new terminal):
```bash
cd islamic-gifts-shop
npm start
```
The frontend will run on `http://localhost:3000`

### Admin Access
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure

```
mishkat-store/
├── backend/                 # Node.js API server
│   ├── data/               # JSON data files
│   ├── uploads/            # Uploaded images
│   ├── middleware/         # Auth middleware
│   └── index.js           # Main server file
├── islamic-gifts-shop/     # React frontend
│   ├── src/               # Source code
│   └── build/             # Production build
└── docs/                  # Documentation
```

## 🔧 Configuration

Backend configuration is in `backend/config.js`:
- JWT secret key
- Admin credentials
- Server settings

## 📱 API Endpoints

- `GET /api/products` - Get all products
- `GET /api/categories` - Get all categories
- `POST /api/admin/login` - Admin login
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/:id` - Update product (admin)
- `DELETE /api/admin/products/:id` - Delete product (admin)

## 🎨 Features

- **Arabic RTL Support**: Full right-to-left language support
- **Responsive Design**: Works on all device sizes
- **Product Management**: Full CRUD operations for products
- **Category System**: Organize products by categories
- **Image Upload**: Support for product images
- **Order Tracking**: Manage customer orders
- **Admin Dashboard**: Complete admin panel

## 🔐 Security

- JWT token authentication
- Password hashing with bcrypt
- Input validation
- CORS configuration

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Hussein Haidar

---
**متجر مشكاة للهدايا الإسلامية**
