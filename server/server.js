const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(bodyParser.json());

// 服务静态文件
app.use(express.static(path.join(__dirname, '../public')));

// 所有其他请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Vercel 需要导出 app
module.exports = app;  