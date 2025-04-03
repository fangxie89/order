export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fromIndex, toIndex, orderId } = req.body;
    const { id } = req.query;

    // 使用 Prisma 更新订单位置
    await prisma.order.update({
      where: { id },
      data: {
        position: toIndex
      }
    });

    // 更新其他受影响的订单位置
    if (fromIndex < toIndex) {
      await prisma.order.updateMany({
        where: {
          position: {
            gt: fromIndex,
            lte: toIndex
          },
          NOT: {
            id: orderId
          }
        },
        data: {
          position: {
            decrement: 1
          }
        }
      });
    } else {
      await prisma.order.updateMany({
        where: {
          position: {
            gte: toIndex,
            lt: fromIndex
          },
          NOT: {
            id: orderId
          }
        },
        data: {
          position: {
            increment: 1
          }
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error moving order:', error);
    res.status(500).json({ error: 'Failed to move order' });
  }
} 