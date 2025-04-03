const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // 建议在环境变量中设置
const TOKEN_EXPIRES_IN = '2h';  // token 有效期为2小时

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未授权访问' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: '认证失败' });
  }
};

module.exports = { auth, JWT_SECRET, TOKEN_EXPIRES_IN }; 