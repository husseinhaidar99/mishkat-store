const bcrypt = require('bcryptjs');

// تغيير هذه الكلمة حسب رغبتك
const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
    console.log('كلمة المرور المشفرة:', hash);
});
