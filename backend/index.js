const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD } = require('./config');
const authMiddleware = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3001;

// تكوين المسارات للملفات
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// إنشاء مجلد البيانات إذا لم يكن موجوداً
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// إنشاء مجلدات التحميل
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// إنشاء مجلد المنتجات
const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// دوال حفظ واسترجاع البيانات
const saveData = (file, data) => {
  try {
    // إنشاء مجلد البيانات إذا لم يكن موجوداً
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // كتابة البيانات مع تأكيد العملية
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Data saved successfully to ${file}`);
  } catch (error) {
    console.error(`❌ Error saving data to ${file}:`, error);
  }
};

const loadData = (file, defaultData) => {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      const parsedData = JSON.parse(data);
      console.log(`✅ Data loaded successfully from ${file}`);
      return parsedData;
    }
    console.log(`⚠️ File ${file} doesn't exist, creating with default data`);
    saveData(file, defaultData);
    return defaultData;
  } catch (error) {
    console.error(`❌ Error loading data from ${file}:`, error);
    console.log(`Creating new file with default data`);
    saveData(file, defaultData);
    return defaultData;
  }
};

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mshkat-frontend.onrender.com', 'https://mshkat-frontend.vercel.app', 'https://mshkat-stor.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('خطأ: يسمح فقط بملفات الصور!');
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Simple in-memory storage for products (replace with a database in production)
let products = loadData(PRODUCTS_FILE, []);

// تخزين الفئات (استبدل لاحقاً بقاعدة بيانات)
let categories = loadData(CATEGORIES_FILE, []);

// تخزين الطلبات
let orders = loadData(ORDERS_FILE, []);

// إضافة متغير لحفظ إعدادات الموقع
let siteSettings = loadData(SETTINGS_FILE, {
  about: {
    title: 'من نحن',
    content: 'مرحباً بكم في مشكاة، وجهتكم الأولى للهدايا الإسلامية المميزة والفريدة.',
    features: [
      'المصاحف الشريفة بمختلف الأحجام والتصاميم',
      'سجادات الصلاة المصنوعة يدوياً',
      'المسابح التقليدية والحديثة',
      'الكتب والمراجع الإسلامية'
    ]
  },
  contact: {
    email: 'info@islamic-gifts.com',
    phone: '+966-XX-XXXXXXX',
    address: ''
  },
  footer: {
    description: 'نقدم أفضل الهدايا الإسلامية بجودة عالية وأسعار مناسبة'
  }
});

// دالة لحفظ نسخة احتياطية دورية من البيانات
const backupData = () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'data', 'backups');
    
    // إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // حفظ نسخة احتياطية من جميع البيانات
    const backupData = {
      products,
      categories,
      settings: siteSettings,
      timestamp: new Date().toISOString()
    };
    
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`💾 Backup created: ${backupFile}`);
    
    // حذف النسخ الاحتياطية القديمة (الاحتفاظ بآخر 5 نسخ فقط)
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 5) {
      const filesToDelete = backupFiles.slice(5);
      filesToDelete.forEach(file => {
        const filePath = path.join(backupDir, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Old backup deleted: ${file}`);
      });
    }
  } catch (error) {
    console.error('❌ Error creating backup:', error);
  }
};

// حفظ نسخة احتياطية كل 30 دقيقة
setInterval(backupData, 30 * 60 * 1000);

// حفظ نسخة احتياطية عند بدء التشغيل
setTimeout(backupData, 5000);

// API Routes
// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get a single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'المنتج غير موجود' });
  }
  res.json(product);
});

// Create a new product
app.post('/api/products', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    
    if (!name || !price || !description || !category) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }    const newProduct = {
      id: Date.now().toString(),
      name,
      price: parseFloat(price),
      description,
      category,
      image: req.file ? `/uploads/products/${req.file.filename}` : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    products.push(newProduct);
    
    // حفظ البيانات فوراً مع التحقق من النجاح
    saveData(PRODUCTS_FILE, products);
    console.log(`✅ Product added: ${newProduct.name} (ID: ${newProduct.id})`);
    
    res.status(201).json({ 
      ...newProduct, 
      message: 'تم إضافة المنتج بنجاح',
      success: true 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج' });
  }
});

// Update a product
app.put('/api/products/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    const updatedProduct = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      price: parseFloat(price) || products[productIndex].price,
      description: description || products[productIndex].description,
      category: category || products[productIndex].category,
      updatedAt: new Date()
    };    if (req.file) {
      // Delete old image if exists
      if (products[productIndex].image) {
        const oldImagePath = path.join(__dirname, products[productIndex].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updatedProduct.image = `/uploads/products/${req.file.filename}`;
    }

    products[productIndex] = updatedProduct;
    saveData(PRODUCTS_FILE, products);
    console.log(`✅ Product updated: ${updatedProduct.name} (ID: ${updatedProduct.id})`);
    
    res.json({
      ...updatedProduct,
      message: 'تم تحديث المنتج بنجاح',
      success: true
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج' });
  }
});

// Delete a product
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    // Delete product image if exists
    if (products[productIndex].image) {
      const imagePath = path.join(__dirname, products[productIndex].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    products.splice(productIndex, 1);
    saveData(PRODUCTS_FILE, products);
    console.log(`✅ Product deleted: ID ${req.params.id}`);
    
    res.json({ 
      message: 'تم حذف المنتج بنجاح',
      success: true 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج' });
  }
});

// الحصول على جميع الفئات
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// إضافة فئة جديدة
app.post('/api/categories', authMiddleware, (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'اسم الفئة مطلوب' });
  }

  if (categories.includes(name)) {
    return res.status(400).json({ message: 'هذه الفئة موجودة بالفعل' });
  }
  categories.push(name);
  
  // حفظ البيانات فوراً مع التحقق من النجاح
  saveData(CATEGORIES_FILE, categories);
  console.log(`✅ Category added: ${name}`);
  
  res.status(201).json({ 
    message: 'تمت إضافة الفئة بنجاح', 
    categories,
    success: true 
  });
});

// تحديث فئة
app.put('/api/categories/:oldName', authMiddleware, (req, res) => {
  const { oldName } = req.params;
  const { newName } = req.body;
  
  if (!newName) {
    return res.status(400).json({ message: 'الاسم الجديد للفئة مطلوب' });
  }

  const index = categories.indexOf(oldName);
  if (index === -1) {
    return res.status(404).json({ message: 'الفئة غير موجودة' });
  }

  if (categories.includes(newName) && oldName !== newName) {
    return res.status(400).json({ message: 'الاسم الجديد موجود بالفعل' });
  }

  categories[index] = newName;
  
  // تحديث الفئة في المنتجات
  products = products.map(product => {
    if (product.category === oldName) {
      return { ...product, category: newName };
    }
    return product;
  });
  saveData(CATEGORIES_FILE, categories);
  saveData(PRODUCTS_FILE, products);
  console.log(`✅ Category updated: ${oldName} → ${newName}`);
  
  res.json({ 
    message: 'تم تحديث الفئة بنجاح', 
    categories,
    success: true 
  });
});

// حذف فئة
app.delete('/api/categories/:name', authMiddleware, (req, res) => {
  const { name } = req.params;
  
  const index = categories.indexOf(name);
  if (index === -1) {
    return res.status(404).json({ message: 'الفئة غير موجودة' });
  }

  // التحقق من وجود منتجات في هذه الفئة
  const productsInCategory = products.some(product => product.category === name);
  if (productsInCategory) {
    return res.status(400).json({ message: 'لا يمكن حذف الفئة لأنها تحتوي على منتجات' });
  }
  categories.splice(index, 1);
  saveData(CATEGORIES_FILE, categories);
  console.log(`✅ Category deleted: ${name}`);
  
  res.json({ 
    message: 'تم حذف الفئة بنجاح', 
    categories,
    success: true 
  });
});

// تسجيل دخول المسؤول
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Received login attempt for username:', username);

    // التحقق من اسم المستخدم
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // التحقق من كلمة المرور باستخدام bcrypt
    const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // إنشاء توكن JWT
    const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token: token,
      message: 'تم تسجيل الدخول بنجاح'
    });

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ 
      success: false,
      message: 'حدث خطأ في تسجيل الدخول' 
    });
  }
});

// === Orders API ===
// الحصول على جميع الطلبات (للمسؤول فقط)
app.get('/api/orders', authMiddleware, (req, res) => {
  try {
    res.json({
      orders: orders,
      success: true
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'حدث خطأ في جلب الطلبات' });
  }
});

// إضافة طلب جديد
app.post('/api/orders', (req, res) => {
  try {
    const { customerInfo, cartItems, total } = req.body;
    
    if (!customerInfo || !cartItems || !total) {
      return res.status(400).json({ message: 'جميع معلومات الطلب مطلوبة' });
    }

    if (!customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({ message: 'اسم العميل ورقم الهاتف مطلوبان' });
    }

    const newOrder = {
      id: Date.now().toString(),
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address || '',
        email: customerInfo.email || ''
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      total: parseFloat(total),
      status: 'جديد', // جديد، قيد التحضير، مكتمل، ملغي
      createdAt: new Date(),
      updatedAt: new Date()
    };

    orders.push(newOrder);
    saveData(ORDERS_FILE, orders);
    console.log(`✅ New order created: ${newOrder.id} for ${newOrder.customerInfo.name}`);
    
    res.status(201).json({ 
      message: 'تم إرسال طلبك بنجاح وسيتم التواصل معك قريباً',
      order: newOrder,
      success: true 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إرسال الطلب' });
  }
});

// تحديث حالة طلب (للمسؤول فقط)
app.put('/api/orders/:id', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const validStatuses = ['جديد', 'قيد التحضير', 'مكتمل', 'ملغي'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'حالة الطلب غير صحيحة' });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date();
    
    saveData(ORDERS_FILE, orders);
    console.log(`✅ Order status updated: ${req.params.id} → ${status}`);
    
    res.json({
      message: 'تم تحديث حالة الطلب بنجاح',
      order: orders[orderIndex],
      success: true
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث الطلب' });
  }
});

// حذف طلب (للمسؤول فقط)
app.delete('/api/orders/:id', authMiddleware, (req, res) => {
  try {
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const deletedOrder = orders[orderIndex];
    orders.splice(orderIndex, 1);
    saveData(ORDERS_FILE, orders);
    console.log(`✅ Order deleted: ${req.params.id} for ${deletedOrder.customerInfo.name}`);
    
    res.json({ 
      message: 'تم حذف الطلب بنجاح',
      success: true 
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف الطلب' });
  }
});

// الحصول على إعدادات الموقع
app.get('/api/settings', (req, res) => {
  res.json(siteSettings);
});

// تحديث إعدادات الموقع
app.put('/api/settings', authMiddleware, (req, res) => {
  try {
    const newSettings = req.body;
    
    // تحديث الإعدادات مع الحفاظ على الهيكل الأصلي
    siteSettings = {
      ...siteSettings,
      about: {
        ...siteSettings.about,
        ...newSettings.about
      },
      contact: {
        ...siteSettings.contact,
        ...newSettings.contact
      },
      footer: {
        ...siteSettings.footer,
        ...newSettings.footer
      }
    };

    saveData(SETTINGS_FILE, siteSettings);
    console.log(`✅ Settings updated successfully`);
    
    res.json({ 
      message: 'تم تحديث إعدادات الموقع بنجاح',
      settings: siteSettings,
      success: true 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث الإعدادات' });
  }
});

// استعادة البيانات من النسخة الاحتياطية (للطوارئ فقط)
app.post('/api/restore', authMiddleware, (req, res) => {
  try {
    const { backupFile } = req.body;
    const backupDir = path.join(__dirname, 'data', 'backups');
    const backupPath = path.join(backupDir, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'ملف النسخة الاحتياطية غير موجود' });
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // استعادة البيانات
    products = backupData.products || [];
    categories = backupData.categories || [];
    siteSettings = backupData.settings || {};
    
    // حفظ البيانات المستعادة
    saveData(PRODUCTS_FILE, products);
    saveData(CATEGORIES_FILE, categories);
    saveData(SETTINGS_FILE, siteSettings);
    
    console.log(`🔄 Data restored from backup: ${backupFile}`);
    
    res.json({
      message: 'تم استعادة البيانات بنجاح',
      restored: {
        products: products.length,
        categories: categories.length,
        settings: Object.keys(siteSettings).length
      },
      success: true
    });
  } catch (error) {
    console.error('Error restoring data:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء استعادة البيانات' });
  }
});

// الحصول على قائمة النسخ الاحتياطية المتاحة
app.get('/api/backups', authMiddleware, (req, res) => {
  try {
    const backupDir = path.join(__dirname, 'data', 'backups');
    
    if (!fs.existsSync(backupDir)) {
      return res.json([]);
    }
    
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.mtime,
          formatted: stats.mtime.toLocaleDateString('ar-SA') + ' ' + stats.mtime.toLocaleTimeString('ar-SA')
        };
      })
      .sort((a, b) => b.created - a.created);
    
    res.json(backupFiles);
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب قائمة النسخ الاحتياطية' });
  }
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('خطأ غير متوقع:', error);
  // حفظ الخطأ في ملف السجل
  fs.appendFileSync(
    path.join(__dirname, 'error.log'),
    `${new Date().toISOString()} - Uncaught Exception: ${error.message}\n${error.stack}\n\n`
  );
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('وعد مرفوض غير معالج:', reason);
  // حفظ الخطأ في ملف السجل
  fs.appendFileSync(
    path.join(__dirname, 'error.log'),
    `${new Date().toISOString()} - Unhandled Rejection: ${reason}\n\n`
  );
});

// إعادة تشغيل الخادم في حالة الأخطاء
const startServer = () => {
  try {
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📊 Loaded data:`);
      console.log(`   - Products: ${products.length} items`);
      console.log(`   - Categories: ${categories.length} items`);
      console.log(`   - Settings: ${Object.keys(siteSettings).length} sections`);
      console.log(`📁 Data directory: ${DATA_DIR}`);
      console.log(`🖼️  Uploads directory: ${uploadsDir}`);
      
      // تنظيف ملف السجل القديم إذا كان حجمه كبيراً
      const logFile = path.join(__dirname, 'error.log');
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > 10 * 1024 * 1024) { // أكبر من 10 ميجابايت
          fs.writeFileSync(logFile, ''); // تنظيف الملف
        }
      }
    });
  } catch (error) {
    console.error('خطأ في بدء الخادم:', error);
    process.exit(1);
  }
};

startServer();
