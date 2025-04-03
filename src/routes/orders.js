const express = require('express');
const router = express.Router();
const { Order } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

router.post('/api/orders/reorder', async (req, res) => {
  try {
    const { orderId, fromIndex, toIndex } = req.body;
    
    // 获取所有订单
    const orders = await Order.findAll({
      order: [['position', 'ASC']]  // 假设有一个 position 字段来存储顺序
    });
    
    // 更新位置
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // 更新所有受影响订单的位置
    if (fromIndex < toIndex) {
      // 向下移动
      await Order.update(
        { position: sequelize.literal('position - 1') },
        { 
          where: {
            position: {
              [Op.gt]: fromIndex,
              [Op.lte]: toIndex
            }
          }
        }
      );
    } else {
      // 向上移动
      await Order.update(
        { position: sequelize.literal('position + 1') },
        {
          where: {
            position: {
              [Op.gte]: toIndex,
              [Op.lt]: fromIndex
            }
          }
        }
      );
    }
    
    // 更新目标订单的位置
    await order.update({ position: toIndex });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

module.exports = router; 