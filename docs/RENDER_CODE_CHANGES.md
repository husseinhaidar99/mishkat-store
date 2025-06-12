# التعديلات المطلوبة للنشر على Render.com

## 1. تعديلات ملف backend/index.js

```javascript
// إضافة هذه الأسطر بعد تعريف المتغيرات في بداية الملف
// التأكد من وجود مجلدات التحميل
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// تأكد من وجود مجلد المنتجات أيضاً
const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// تعديل إعدادات CORS للسماح للواجهة الأمامية بالاتصال بالـ API
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mshkat-frontend.onrender.com']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

## 2. تعديل ملف backend/package.json

قم بإضافة نسخة Node.js المطلوبة:

```json
{
  "name": "mshkat-backend",
  "version": "1.0.0",
  "engines": {
    "node": ">=14.0.0"
  },
  "dependencies": {
    // الاعتماديات الحالية
  }
}
```

## 3. تعديل ملف islamic-gifts-shop/src/services/api.js

تحديث عنوان API:

```javascript
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://mshkat-api.onrender.com' 
  : 'http://localhost:3001';
```

## 4. إنشاء ملف جذر للمشروع بالكامل (render.yaml)

قم بإنشاء ملف `render.yaml` في الجذر:

```yaml
services:
  # خدمة الواجهة الخلفية (API)
  - type: web
    name: mshkat-api
    runtime: node
    rootDir: backend
    buildCommand: npm install
    startCommand: node index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
    disk:
      name: data
      mountPath: /opt/render/project/src/backend/data
      sizeGB: 1

  # خدمة الواجهة الأمامية
  - type: web
    name: mshkat-frontend
    runtime: static
    rootDir: islamic-gifts-shop
    buildCommand: npm install && npm run build
    staticPublishPath: build
    envVars:
      - key: REACT_APP_API_URL
        fromService:
          name: mshkat-api
          type: web
          property: url
