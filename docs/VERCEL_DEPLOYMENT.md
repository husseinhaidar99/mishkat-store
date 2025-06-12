# دليل نشر مشكاة على Vercel

## الواجهة الأمامية (Frontend) على Vercel

### الخطوة 1: تجهيز المشروع للنشر

تم إعداد ملفات التهيئة المطلوبة:
- `vercel.json` - إعدادات Vercel
- `.env.production` - متغيرات البيئة للإنتاج

### الخطوة 2: نشر المشروع على Vercel

1. **إنشاء حساب على Vercel**:
   - توجه إلى [vercel.com](https://vercel.com)
   - قم بالتسجيل أو تسجيل الدخول (يفضل باستخدام GitHub)

2. **نشر المشروع**:

   **الطريقة 1: استخدام واجهة الويب Vercel**:
   - انقر على "+ New Project"
   - اختر مستودع GitHub أو قم برفع المشروع
   - حدد مجلد `islamic-gifts-shop` كمسار للمشروع
   - في إعدادات البناء، تأكد من ضبط الإعدادات:
     - Framework Preset: Create React App
     - Root Directory: islamic-gifts-shop
     - Build Command: npm run build
     - Output Directory: build
   - انقر على "Deploy"

   **الطريقة 2: استخدام Vercel CLI**:
   ```powershell
   # تثبيت Vercel CLI
   npm i -g vercel

   # تسجيل الدخول
   vercel login

   # نشر المشروع (قم بتنفيذ هذا في مجلد المشروع الرئيسي)
   vercel
   # اتبع التعليمات واختر islamic-gifts-shop كمجلد للمشروع
   ```

## الواجهة الخلفية (Backend) على Render.com

### الخطوة 1: إعداد الخادم الخلفي

تم إعداد ملفات التهيئة المطلوبة في مجلد المشروع:
- `render.yaml` - إعدادات Render.com

### الخطوة 2: نشر الخادم الخلفي

1. **إنشاء حساب على Render.com**:
   - توجه إلى [render.com](https://render.com)
   - قم بالتسجيل أو تسجيل الدخول

2. **نشر الخادم الخلفي**:
   - انقر على "New" ثم اختر "Web Service"
   - قم باختيار "Build and deploy from a Git repository" 
   - حدد مستودع GitHub أو قم برفع المشروع
   - احرص على اختيار مجلد `backend` كمسار للمشروع
   - املأ الإعدادات:
     - Name: mshkat-api
     - Region: أقرب منطقة لك
     - Branch: main
     - Root Directory: backend
     - Runtime: Node
     - Build Command: npm install
     - Start Command: node index.js
   - انقر على "Create Web Service"

3. **إعداد متغيرات البيئة**:
   - بعد إنشاء الخدمة، اذهب إلى قسم "Environment"
   - أضف المتغيرات التالية:
     - JWT_SECRET: (كلمة سر آمنة للمصادقة)
     - NODE_ENV: production

## بعد النشر

1. **تحديث عنوان API في الواجهة الأمامية**:
   - بعد نشر الخادم الخلفي على Render، ستحصل على رابط مثل `https://mshkat-api.onrender.com`
   - تأكد من تحديث `REACT_APP_API_URL` في إعدادات Vercel ليشير إلى عنوان API الجديد

2. **اختبار التطبيق**:
   - قم بزيارة موقع Vercel المنشور للتأكد من أن كل شيء يعمل بشكل صحيح
   - جرب تسجيل الدخول كمدير والتحقق من الطلبات

## ملاحظات هامة

- الملفات المحلية مثل الصور المرفوعة ستحتاج إلى استراتيجية تخزين أخرى في الإنتاج (مثل Amazon S3 أو Cloudinary)
- للحصول على مزامنة البيانات الكاملة، يجب استخدام قاعدة بيانات حقيقية بدلاً من التخزين المحلي في ملفات JSON

## مصادر إضافية

- [توثيق Vercel](https://vercel.com/docs)
- [توثيق Render](https://render.com/docs)
