const express = require('express');
const router = express.Router();
const prisma = require('../services/db');

// 获取订单列表
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true
      }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: '获取订单失败' });
  }
});

// 创建新订单
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, items, total, userId } = req.body;
    const order = await prisma.order.create({
      data: {
        name,
        phone,
        address,
        total,
        user: {
          connect: {
            id: userId
          }
        },
        items: {
          create: items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        items: true
      }
    });
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 更新订单
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, items, total } = req.body;

    // 删除现有的订单项
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });

    // 更新订单和创建新的订单项
    const order = await prisma.order.update({
      where: { id },
      data: {
        name,
        phone,
        address,
        total,
        items: {
          create: items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        items: true
      }
    });
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: '更新订单失败' });
  }
});

// 删除订单
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    });
    await prisma.order.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: '删除订单失败' });
  }
});

module.exports = router; 