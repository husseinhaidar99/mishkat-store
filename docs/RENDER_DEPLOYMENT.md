# دليل نشر موقع "مشكاة" على Render.com

## مميزات Render.com
1. يوفر طبقة مجانية للبدء (500 ساعة شهرياً)
2. سهل الاستخدام والإعداد
3. يدعم تثبيت Node.js والـ Express تلقائياً
4. يوفر خدمة استضافة المواقع الساكنة (Static Sites) مجاناً

## المتطلبات المسبقة
1. حساب على Render.com
2. مشروعك مرفوع على GitHub (للتحديث التلقائي)

## خطوات النشر

### 1. إنشاء حساب على Render.com
1. توجه إلى [Render.com](https://render.com)
2. انقر على "Sign Up" في الأعلى
3. يمكنك التسجيل باستخدام:
   - حساب GitHub
   - حساب Google
   - بريد إلكتروني وكلمة مرور

### 2. رفع المشروع على GitHub
1. إنشاء مستودع جديد على GitHub
2. رفع مشروعك:
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/mshkat-store.git
git push -u origin master
```

### 3. إنشاء خدمة Web Service على Render.com
1. بعد تسجيل الدخول إلى Render، انقر على "New +" ثم اختر "Web Service"
2. اربط حسابك على GitHub وقم باختيار المستودع الذي رفعت إليه مشروعك
3. قم بتعبئة المعلومات التالية:
   - **Name**: `mshkat-api`
   - **Region**: `Frankfurt` (أقرب منطقة للعراق)
   - **Branch**: `master`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node index.js`
   - **Plan**: اختر "Free $0/month"

### 4. إعداد المتغيرات البيئية
انقر على "Environment" وأضف المتغيرات التالية:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render يستخدم هذا المنفذ تلقائياً)
- `JWT_SECRET`: `your-secret-key` (استبدلها بمفتاح آمن)

### 5. إنشاء خدمة Static Site للواجهة الأمامية
1. انقر على "New +" ثم اختر "Static Site"
2. اختر نفس المستودع
3. قم بتعبئة المعلومات التالية:
   - **Name**: `mshkat-frontend`
   - **Branch**: `master`
   - **Root Directory**: `islamic-gifts-shop`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: اختر "Free $0/month"

### 6. إعداد المتغيرات البيئية للواجهة الأمامية
انقر على "Environment" وأضف:
- `REACT_APP_API_URL`: رابط الـ API (سيكون مثل: `https://mshkat-api.onrender.com`)

### 7. تعديلات على الكود لتتوافق مع Render.com

#### تعديل ملف backend/index.js
يجب تعديل طريقة قراءة المسارات:

```javascript
// تأكد من تعريف مجلد uploads بالشكل الصحيح
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// تأكد من وجود مجلد المنتجات أيضاً
const productsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}
```

#### تعديل ملف backend/package.json
تأكد من وجود السطر التالي:
```json
{
  "engines": {
    "node": ">=14.0.0"
  }
}
```

### 8. إعداد CORS
تعديل إعدادات CORS في backend/index.js للسماح للواجهة الأمامية بالاتصال بالـ API:

```javascript
app.use(cors({
  origin: ['https://mshkat-frontend.onrender.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

### 9. النسخ الاحتياطي
للتأكد من عدم فقدان البيانات:
1. قم بتنزيل محتويات مجلد `data` بشكل دوري
2. في الإصدارات المستقبلية، خطط للانتقال إلى قواعد بيانات حقيقية مثل MongoDB

## مراقبة الموقع
بعد النشر، يمكنك:
1. تتبع سجلات الخطأ والنشاط: داخل لوحة التحكم في Render تحت قسم "Logs"
2. مراقبة الأداء: تحت قسم "Metrics"

## إضافة نطاق مخصص (اختياري)
يمكنك ربط نطاق مخصص لموقعك:
1. قم بشراء نطاق من أي مزود (مثل Namecheap أو GoDaddy)
2. انتقل إلى "Settings" في لوحة تحكم Render
3. انقر على "Custom Domain" واتبع التعليمات

## تحديث الموقع
1. قم بتحديث الكود على جهازك المحلي
2. ادفع التغييرات إلى GitHub:
```powershell
git add .
git commit -m "وصف التغييرات"
git push
```
3. Render سيقوم بإعادة النشر تلقائياً
