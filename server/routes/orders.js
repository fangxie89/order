const express = require('express');
const router = express.Router();
const prisma = require('../services/db');

// 获取订单列表
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        position: 'asc'
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
    const { name, phone, address, items, total, userId, position } = req.body;
    console.log('Received position:', position);

    const order = await prisma.order.create({
      data: {
        name,
        phone,
        address,
        total,
        position: position,
        user: {
          connect: {
            id: userId
          }
        },
        items: {
          create: items
        }
      },
      include: {
        items: true
      }
    });

    console.log('Created order:', order);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// 更新订单
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, items, total, date } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        name,
        phone,
        address,
        total,
        date: new Date(date),
        items: {
          deleteMany: {},
          create: items
        }
      },
      include: {
        items: true
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
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

// 移动订单位置
router.put('/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { fromIndex, toIndex } = req.body;

    // 获取所有订单，按position排序
    const orders = await prisma.order.findMany({
      orderBy: {
        position: 'asc'
      }
    });

    // 更新受影响的订单位置
    if (fromIndex < toIndex) {
      // 向下移动
      await prisma.order.updateMany({
        where: {
          position: {
            gt: fromIndex,
            lte: toIndex
          },
          NOT: {
            id: id
          }
        },
        data: {
          position: {
            decrement: 1
          }
        }
      });
    } else {
      // 向上移动
      await prisma.order.updateMany({
        where: {
          position: {
            gte: toIndex,
            lt: fromIndex
          },
          NOT: {
            id: id
          }
        },
        data: {
          position: {
            increment: 1
          }
        }
      });
    }

    // 更新目标订单的位置
    await prisma.order.update({
      where: { id },
      data: {
        position: toIndex
      }
    });

    // 返回更新后的订单列表
    const updatedOrders = await prisma.order.findMany({
      include: {
        items: true
      },
      orderBy: {
        position: 'asc'
      }
    });

    res.json(updatedOrders);
  } catch (error) {
    console.error('Error moving order:', error);
    res.status(500).json({ error: '移动订单失败' });
  }
});

module.exports = router; 