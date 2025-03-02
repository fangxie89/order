const express = require('express');
const bodyParser = require('body-parser');
const ordersRouter = require('../server/routes/orders');
const usersRouter = require('../server/routes/users');
const productsRouter = require('../server/routes/products');

const app = express();

// 中间件
app.use(bodyParser.json());

// API 路由
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);

module.exports = (req, res) => {
  // 添加 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 移除 URL 中的 /api 前缀
  req.url = req.url.replace(/^\/api/, '');
  return app(req, res);
}; 