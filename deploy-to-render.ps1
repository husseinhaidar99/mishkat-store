# PowerShell script for deploying to Render.com
# نسخة مبسطة تستخدم النشر المباشر دون الحاجة إلى Render API

# تكوين المتغيرات الأساسية
$BackendZipPath = "c:\Users\msii\Desktop\mshkat-stor\backend-deploy-ready.zip"
$RenderDeployDir = "c:\Users\msii\Desktop\mshkat-stor\render-deploy"

# اسم الخدمة وإعدادات أخرى
$ServiceName = "mshkat-api"

Write-Host "====== بدء نشر الواجهة الخلفية لمتجر مشكاة على Render.com ======" -ForegroundColor Green

# التحقق من وجود ملف الواجهة الخلفية المضغوط
if (-not (Test-Path $BackendZipPath)) {
    Write-Host "خطأ: ملف $BackendZipPath غير موجود" -ForegroundColor Red
    exit 1
}

# Create a temp directory for extraction
$TempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
Write-Host "تم إنشاء دليل مؤقت: $TempDir" -ForegroundColor Cyan

# Extract the zip file to temp directory
Expand-Archive -Path $BackendZipPath -DestinationPath $TempDir
Write-Host "تم استخراج ملفات الواجهة الخلفية إلى الدليل المؤقت" -ForegroundColor Cyan

# التحقق من محتويات الملف المضغوط
$FilesCount = (Get-ChildItem -Path $TempDir -Recurse).Count
Write-Host "عدد الملفات في حزمة النشر: $FilesCount" -ForegroundColor Cyan

# التحقق من وجود الملفات الأساسية
$RequiredFiles = @("index.js", "package.json", "render.yaml")
$AllFound = $true
foreach ($file in $RequiredFiles) {
    if (-not (Test-Path (Join-Path $TempDir $file))) {
        Write-Host "تحذير: الملف الأساسي '$file' غير موجود في حزمة النشر" -ForegroundColor Yellow
        $AllFound = $false
    } else {
        Write-Host "الملف '$file' موجود" -ForegroundColor Green
    }
}

if (-not $AllFound) {
    Write-Host "`nتحذير: بعض الملفات الأساسية مفقودة من حزمة النشر. قد تواجه مشاكل في النشر." -ForegroundColor Yellow
    $Continue = Read-Host "هل تريد الاستمرار على الرغم من ذلك؟ (نعم/لا)"
    if ($Continue -ne "نعم") {
        Write-Host "تم إلغاء عملية النشر" -ForegroundColor Red
        Remove-Item -Recurse -Force $TempDir
        exit 1
    }
}

# فتح متصفح الويب على موقع Render.com
Write-Host "`nجاري بدء عملية النشر اليدوي..." -ForegroundColor Cyan

# فتح متصفح الويب للقيام بعملية النشر
try {
    # إنشاء ملف مؤقت للمعلومات
    $InfoFile = Join-Path $TempDir "render-info.json"
    
    # تجهيز بيانات إعدادات الخدمة للعرض
    $ServiceInfo = @{
        name = $ServiceName
        buildCommand = "npm install"
        startCommand = "node index.js"
        envVars = @{
            "NODE_ENV" = "production"
            "PORT" = "10000"
            "JWT_SECRET" = "mshkat-stor-secret-key-2025-production-secure-token-authentication-system-v1.0"
        }
        disk = @{
            name = "data"
            mountPath = "/opt/render/project/src/data"
            sizeGB = 1
        }
    }
    
    # حفظ المعلومات في ملف مؤقت للرجوع إليها
    $ServiceInfo | ConvertTo-Json -Depth 10 | Set-Content $InfoFile
    Write-Host "تم حفظ معلومات الإعداد في: $InfoFile" -ForegroundColor Cyan
    
    # فتح Render.com في المتصفح
    Write-Host "جاري فتح موقع Render.com في المتصفح..." -ForegroundColor Cyan
    Start-Process "https://dashboard.render.com/new/web-service"
    
    # عرض التعليمات للمستخدم
    Write-Host "`nخطوات النشر اليدوي:" -ForegroundColor Yellow
    
} catch {
    Write-Host "حدث خطأ أثناء محاولة فتح المتصفح: $_" -ForegroundColor Red
    
    # عرض التعليمات اليدوية في حالة الخطأ
    Write-Host "`nخطوات النشر اليدوي:" -ForegroundColor Yellow
    Write-Host "1. في الواجهة التي فتحت، قم باختيار 'Build and deploy from a ZIP file'" -ForegroundColor Yellow
    Write-Host "2. اضغط على زر التصفح واختر الملف: $BackendZipPath" -ForegroundColor Yellow
    Write-Host "3. قم بتكوين الخدمة باستخدام هذه الإعدادات:" -ForegroundColor Yellow
    Write-Host "   - الاسم: $ServiceName" -ForegroundColor Cyan
    Write-Host "   - بيئة التشغيل: Node" -ForegroundColor Cyan
    Write-Host "   - أمر البناء: npm install" -ForegroundColor Cyan
    Write-Host "   - أمر البدء: node index.js" -ForegroundColor Cyan
    Write-Host "4. في قسم متغيرات البيئة (Environment Variables)، أضف:" -ForegroundColor Yellow
    Write-Host "   - NODE_ENV: production" -ForegroundColor Cyan
    Write-Host "   - PORT: 10000" -ForegroundColor Cyan
    Write-Host "   - JWT_SECRET: mshkat-stor-secret-key-2025-production-secure-token-authentication-system-v1.0" -ForegroundColor Cyan
    Write-Host "5. اضغط على 'Add disk' وأضف قرصًا جديدًا:" -ForegroundColor Yellow
    Write-Host "   - الاسم: data" -ForegroundColor Cyan
    Write-Host "   - مسار التثبيت: /opt/render/project/src/data" -ForegroundColor Cyan
    Write-Host "   - الحجم: 1 GB" -ForegroundColor Cyan
    Write-Host "6. اضغط على زر 'Create Web Service' في الأسفل لبدء عملية النشر" -ForegroundColor Yellow
    
    # فتح مجلد الملف المضغوط في Windows Explorer
    Write-Host "`nجاري فتح مجلد الملف المضغوط لتسهيل رفعه..." -ForegroundColor Cyan
    $ZipFileDirectory = Split-Path -Parent $BackendZipPath
    Start-Process explorer.exe -ArgumentList $ZipFileDirectory
    
    # نسخ مسار الملف المضغوط إلى الحافظة لسهولة الوصول
    Set-Clipboard -Value $BackendZipPath
    Write-Host "تم نسخ مسار الملف المضغوط إلى الحافظة" -ForegroundColor Green
}

# تنظيف الدليل المؤقت
Write-Host "جاري تنظيف الدليل المؤقت..." -ForegroundColor Cyan
Remove-Item -Recurse -Force $TempDir
Write-Host "تم تنظيف الدليل المؤقت" -ForegroundColor Green

Write-Host "`n====== اكتملت عملية تحضير النشر ======" -ForegroundColor Green
Write-Host "تذكر أن عملية البناء والنشر قد تستغرق بضع دقائق على Render.com" -ForegroundColor Yellow
Write-Host "بعد اكتمال النشر، ستكون واجهة API الخاصة بك متاحة على:" -ForegroundColor Yellow
Write-Host "https://$ServiceName.onrender.com" -ForegroundColor Cyan
Write-Host "`nللتحقق من حالة النشر لاحقًا، استخدم:" -ForegroundColor Yellow
Write-Host "https://dashboard.render.com/web/srv-xxxx" -ForegroundColor Cyan
Write-Host "حيث xxxx هو معرف الخدمة الذي ستحصل عليه بعد إنشاء الخدمة" -ForegroundColor Yellow
