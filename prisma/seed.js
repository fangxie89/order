const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // 创建默认系统用户
  try {
    await prisma.user.create({
      data: {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'system',
        password: 'not-accessible',
        role: 'system'
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('System user already exists, skipping...');
    } else {
      throw error;
    }
  }

  // 创建默认管理员用户
  const hashedPassword = await bcrypt.hash('tn1lJBB?', 10);
  try {
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Admin user already exists, skipping...');
    } else {
      throw error;
    }
  }

  // 创建普通用户
  const userPassword = await bcrypt.hash('user123', 10);
  try {
    await prisma.user.create({
      data: {
        username: 'user',
        password: userPassword,
        role: 'user'
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Regular user already exists, skipping...');
    } else {
      throw error;
    }
  }

  // 导入产品数据
  const products = require('../src/assets/price.json');
  for (const [name, data] of Object.entries(products)) {
    try {
      await prisma.product.create({
        data: {
          name,
          price: data.price,
          half: data.half || null
        }
      });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`Product ${name} already exists, skipping...`);
      } else {
        throw error;
      }
    }
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