const express = require('express');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

// 用户路由（包含登录和验证）
app.use('/api/users', require('./routes/users'));

// 受保护的路由
app.use('/api/orders', auth, require('./routes/orders'));

// ... 其他代码 