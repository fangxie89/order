const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ordersRouter = require('./routes/orders');
const dailyRouter = require('./routes/daily');

const app = express();
const port = 3000;

// 服务静态文件
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

// API 路由
app.use('/api', ordersRouter);
app.use('/api', dailyRouter);

// 所有其他请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});  