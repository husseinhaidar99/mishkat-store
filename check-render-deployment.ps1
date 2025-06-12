# PowerShell script for checking the status of a Render.com deployment
# You need to replace API_TOKEN with your actual Render API token
# You need to replace SERVICE_ID with your actual Render service ID

# تكوين المتغيرات الأساسية
$ApiToken = "YOUR_RENDER_API_TOKEN"
$ServiceId = "YOUR_SERVICE_ID"  # معرف الخدمة الذي حصلت عليه بعد إنشاء الخدمة
$ApiUrl = "https://api.render.com/v1/services/$ServiceId"

Write-Host "====== التحقق من حالة نشر الواجهة الخلفية لمتجر مشكاة على Render.com ======" -ForegroundColor Green

# التحقق من وجود رمز API ومعرف الخدمة
if ($ApiToken -eq "YOUR_RENDER_API_TOKEN" -or $ServiceId -eq "YOUR_SERVICE_ID") {
    Write-Host "خطأ: يجب أن تضع رمز API ومعرف الخدمة الخاصين بك" -ForegroundColor Red
    Write-Host "1. قم بزيارة https://dashboard.render.com/account/api-keys للحصول على رمز API"
    Write-Host "2. استبدل القيمة في متغير ApiToken"
    Write-Host "3. استبدل معرف الخدمة في متغير ServiceId"
    exit 1
}

# تحقق من حالة الخدمة
try {
    $Headers = @{
        "Authorization" = "Bearer $ApiToken"
        "Content-Type" = "application/json"
    }
    
    Write-Host "جاري التحقق من حالة الخدمة..." -ForegroundColor Cyan
    
    $Response = Invoke-RestMethod -Uri $ApiUrl -Method GET -Headers $Headers -ErrorAction Stop
    
    # عرض معلومات الخدمة
    Write-Host "`nمعلومات الخدمة:" -ForegroundColor Green
    Write-Host "- اسم الخدمة: $($Response.name)" -ForegroundColor Cyan
    Write-Host "- الحالة: $($Response.status)" -ForegroundColor Cyan
    Write-Host "- عنوان URL: $($Response.url)" -ForegroundColor Cyan
    Write-Host "- بيئة التشغيل: $($Response.env)" -ForegroundColor Cyan
    Write-Host "- تاريخ الإنشاء: $($Response.createdAt)" -ForegroundColor Cyan
    Write-Host "- آخر تحديث: $($Response.updatedAt)" -ForegroundColor Cyan
    
    # عرض آخر حالة نشر
    if ($Response.deploy) {
        Write-Host "`nمعلومات آخر عملية نشر:" -ForegroundColor Green
        Write-Host "- الحالة: $($Response.deploy.status)" -ForegroundColor Cyan
        Write-Host "- تاريخ البدء: $($Response.deploy.startedAt)" -ForegroundColor Cyan
        Write-Host "- تاريخ الانتهاء: $($Response.deploy.finishedAt)" -ForegroundColor Cyan
        
        # عرض رابط لمتابعة السجلات
        Write-Host "`nرابط متابعة سجلات النشر:" -ForegroundColor Green
        Write-Host "https://dashboard.render.com/web/$ServiceId/logs" -ForegroundColor Cyan
    }
    
    # تقديم توصيات بناءً على حالة الخدمة
    switch ($Response.status) {
        "live" { 
            Write-Host "`nالخدمة تعمل بشكل طبيعي! يمكنك الوصول إليها من خلال:" -ForegroundColor Green
            Write-Host "$($Response.url)" -ForegroundColor Cyan
        }
        "building" { 
            Write-Host "`nالخدمة قيد الإنشاء. يرجى الانتظار حتى اكتمال عملية البناء." -ForegroundColor Yellow
            Write-Host "قد تستغرق العملية بضع دقائق. يمكنك متابعة حالة البناء من خلال لوحة تحكم Render." -ForegroundColor Yellow
        }
        "updating" { 
            Write-Host "`nالخدمة قيد التحديث. يرجى الانتظار حتى اكتمال عملية التحديث." -ForegroundColor Yellow
        }
        "crashed" { 
            Write-Host "`nتوقفت الخدمة بشكل غير متوقع. يرجى التحقق من سجلات الأخطاء:" -ForegroundColor Red
            Write-Host "https://dashboard.render.com/web/$ServiceId/logs" -ForegroundColor Cyan
        }
        "suspended" { 
            Write-Host "`nتم تعليق الخدمة. قد يكون ذلك بسبب انتهاء الفترة المجانية أو بسبب مشكلة في الفواتير." -ForegroundColor Red
            Write-Host "قم بزيارة لوحة تحكم Render للتحقق من حالة الحساب." -ForegroundColor Yellow
        }
        default { 
            Write-Host "`nحالة الخدمة: $($Response.status)" -ForegroundColor Yellow
            Write-Host "قم بزيارة لوحة تحكم Render للحصول على مزيد من المعلومات." -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nلزيارة لوحة تحكم الخدمة، انقر على الرابط التالي:" -ForegroundColor Green
    Write-Host "https://dashboard.render.com/web/$ServiceId" -ForegroundColor Cyan
    
} catch {
    Write-Host "حدث خطأ أثناء محاولة الاتصال بـ Render API: $_" -ForegroundColor Red
    Write-Host "تأكد من صحة رمز API ومعرف الخدمة الخاصين بك" -ForegroundColor Yellow
    Write-Host "يمكنك أيضًا التحقق من حالة الخدمة يدويًا من خلال:" -ForegroundColor Yellow
    Write-Host "https://dashboard.render.com" -ForegroundColor Cyan
}

Write-Host "`n====== اكتمل التحقق من حالة النشر ======" -ForegroundColor Green
