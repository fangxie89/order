const express = require('express');
const router = express.Router();
const prisma = require('../services/db');

// 获取所有产品
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: '获取产品列表失败' });
  }
});

// 创建产品
router.post('/products', async (req, res) => {
  try {
    const { name, price, half } = req.body;
    const product = await prisma.product.create({
      data: { name, price, half }
    });
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: '创建产品失败' });
  }
});

// 更新产品
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, half } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: { name, price, half }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: '更新产品失败' });
  }
});

// 删除产品
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: '删除产品失败' });
  }
});

module.exports = router; 