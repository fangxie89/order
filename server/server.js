const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');

const app = express();
const port = 3000;

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());

// API 路由
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

// 服务静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 所有其他请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});  