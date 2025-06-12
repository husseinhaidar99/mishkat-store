// Generate a random string for JWT_SECRET
const crypto = require('crypto');
const generateSecret = () => crypto.randomBytes(64).toString('hex');

// Fixed JWT secret to maintain session consistency
const FIXED_JWT_SECRET = 'mshkat-stor-secret-key-2025-production-secure-token-authentication-system-v1.0';

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || FIXED_JWT_SECRET,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '$2b$10$D4U.kIe2RiS60jfPlKbR7eNQDSjK1H3cWo5PLisoHYiJTZkAhOECi', // admin123
    // يمكنك تغيير كلمة المرور باستخدام: node scripts/generate-password.js
};
