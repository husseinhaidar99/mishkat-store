# دليل نشر موقع مشكاة على DigitalOcean

## المتطلبات الأساسية
1. حساب على DigitalOcean
2. تثبيت `doctl` (أداة سطر الأوامر الخاصة بـ DigitalOcean)
3. نطاق (domain) مسجل (اختياري)

## خطوات النشر

### 1. إنشاء Droplet على DigitalOcean
```bash
# تسجيل الدخول إلى DigitalOcean
doctl auth init

# إنشاء Droplet جديد
doctl compute droplet create mshkat-prod \
    --size s-1vcpu-1gb \
    --image ubuntu-20-04-x64 \
    --region nyc1
```

### 2. تجهيز الخادم
بعد إنشاء الـ Droplet، قم بالاتصال به باستخدام SSH:

```bash
ssh root@<DROPLET_IP>

# تحديث النظام
apt update && apt upgrade -y

# تثبيت Node.js و npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get install -y nodejs

# تثبيت PM2 عالمياً
npm install -g pm2

# إنشاء مستخدم للتطبيق
adduser mshkat
usermod -aG sudo mshkat
```

### 3. نقل الملفات إلى الخادم
```bash
# من جهازك المحلي
rsync -avz --exclude 'node_modules' ./ mshkat@<DROPLET_IP>:/home/mshkat/app
```

### 4. تثبيت وتشغيل التطبيق
```bash
ssh mshkat@<DROPLET_IP>

cd ~/app
npm install
npm run build

# تشغيل التطبيق باستخدام PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. إعداد Nginx كـ reverse proxy
```bash
# تثبيت Nginx
sudo apt install nginx -y

# تكوين Nginx
sudo nano /etc/nginx/sites-available/mshkat

# أضف التكوين التالي:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/mshkat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. إعداد SSL (اختياري)
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com
```

### 7. النسخ الاحتياطي
إعداد نسخ احتياطي تلقائي للبيانات:
```bash
# إنشاء سكربت النسخ الاحتياطي
sudo nano /usr/local/bin/backup.sh

# محتوى السكربت:
#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="/home/mshkat/backups"
mkdir -p $backup_dir
tar -czf $backup_dir/mshkat_$timestamp.tar.gz /home/mshkat/app/data/

# جعل السكربت قابل للتنفيذ
sudo chmod +x /usr/local/bin/backup.sh

# إضافة مهمة cron للنسخ الاحتياطي التلقائي
(crontab -l 2>/dev/null; echo "0 0 * * * /usr/local/bin/backup.sh") | crontab -
```

## المراقبة والصيانة
- مراقبة السجلات: `pm2 logs`
- مراقبة حالة التطبيق: `pm2 status`
- تحديث التطبيق: `git pull && npm install && pm2 reload all`
- مراقبة استخدام الموارد: `htop`

## استكشاف الأخطاء وإصلاحها
- تحقق من سجلات Nginx: `sudo tail -f /var/log/nginx/error.log`
- تحقق من سجلات التطبيق: `pm2 logs`
- إعادة تشغيل الخدمات: 
  ```bash
  sudo systemctl restart nginx
  pm2 reload all
  ```
