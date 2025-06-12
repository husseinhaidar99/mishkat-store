# تثبيت الاعتماديات
Write-Host "تثبيت اعتماديات الباكيند..."
Set-Location -Path "backend"
npm install --production
Set-Location -Path ".."

Write-Host "تثبيت اعتماديات الفرونت إند..."
Set-Location -Path "islamic-gifts-shop"
npm install --production
npm run build
Set-Location -Path ".."

# تثبيت الخادم الثابت
npm install -g serve

# تشغيل التطبيق باستخدام PM2
Write-Host "بدء تشغيل التطبيق..."
pm2 start ecosystem.config.js

Write-Host "`nتم تشغيل المشروع بنجاح!`n"
Write-Host "يمكنك الوصول إلى التطبيق على:"
Write-Host "الواجهة الأمامية: http://localhost:3000"
Write-Host "الواجهة الخلفية: http://localhost:3001"
Write-Host "`nللتحقق من حالة الخوادم، استخدم الأمر:"
Write-Host "pm2 status"
Write-Host "`nلإيقاف التطبيق، استخدم الأمر:"
Write-Host "pm2 stop all"
