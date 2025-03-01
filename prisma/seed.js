const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 创建默认系统用户
  await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000000',
      username: 'system',
      password: 'not-accessible',
      role: 'system'
    }
  });

  // 创建默认管理员用户
  const hashedPassword = await bcrypt.hash('tn1lJBB?', 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  });

  // 导入产品数据
  const products = require('../src/assets/price.json');
  for (const [name, data] of Object.entries(products)) {
    await prisma.product.create({
      data: {
        name,
        price: data.price,
        half: data.half || null
      }
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 