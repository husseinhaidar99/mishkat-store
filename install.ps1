# تثبيت اعتماديات الباكيند
Set-Location -Path "backend"
npm install

# تثبيت اعتماديات الفرونت إند
Set-Location -Path "..\islamic-gifts-shop"
npm install

Write-Host "`nتم تثبيت جميع الاعتماديات بنجاح!`n"
Write-Host "لتشغيل المشروع، قم بتشغيل الملف start.ps1"
