import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        orderBy: {
          position: 'asc'
        },
        include: {
          items: true
        }
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load orders' });
    }
  } else if (req.method === 'POST') {
    try {
      const orderData = req.body;
      const order = await prisma.order.create({
        data: {
          ...orderData,
          items: {
            create: orderData.items
          }
        }
      });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
} 