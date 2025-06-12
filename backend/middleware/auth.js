const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log('Auth Header:', authHeader); // للتشخيص
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'يرجى تسجيل الدخول أولاً' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('Token:', token); // للتشخيص

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded); // للتشخيص
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth Error:', error); // للتشخيص
        res.status(401).json({ message: 'جلسة العمل منتهية، يرجى تسجيل الدخول مرة أخرى' });
    }
};

module.exports = authMiddleware;
