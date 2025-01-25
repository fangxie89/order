const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

// 确保订单数据目录存在
const ordersDir = path.join(__dirname, 'orders');
async function ensureOrdersDir() {
    try {
        await fs.access(ordersDir);
    } catch {
        await fs.mkdir(ordersDir);
    }
}
ensureOrdersDir();

// 保存当日订单
app.post('/save-daily-orders', async (req, res) => {
    const { customers } = req.body;
    const date = new Date().toISOString().split('T')[0];
    const fileName = `orders_${date}.json`;
    const filePath = path.join(ordersDir, fileName);
    
    try {
        await fs.writeFile(filePath, JSON.stringify(customers, null, 2));
        res.json({ success: true, fileName });
    } catch (error) {
        console.error('Error saving orders:', error);
        res.status(500).json({ success: false, error: '保存订单失败' });
    }
});

// 获取订单文件列表
app.get('/order-files', async (req, res) => {
    try {
        const files = await fs.readdir(ordersDir);
        const orderFiles = files.filter(file => file.endsWith('.json'));
        res.json(orderFiles);
    } catch (error) {
        console.error('Error reading order files:', error);
        res.status(500).json({ error: '读取订单文件列表失败' });
    }
});

// 读取特定订单文件
app.get('/orders/:filename', async (req, res) => {
    const filePath = path.join(ordersDir, req.params.filename);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading order file:', error);
        res.status(500).json({ error: '读取订单文件失败' });
    }
});

app.post('/submit-orders', async (req, res) => {
    const { customers } = req.body;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('订单汇总');
    
    // 获取所有商品名称
    const allProducts = new Set();
    customers.forEach(customer => {
        customer.items.forEach(item => {
            allProducts.add(item.product);
        });
    });
    
    // 设置列
    const columns = [
        { header: '客户姓名', key: 'name', width: 15 },
        { header: '电话', key: 'phone', width: 15 },
        { header: '送货地址', key: 'address', width: 30 }
    ];
    
    // 为每个商品添加列
    Array.from(allProducts).forEach(product => {
        columns.push({ header: product, key: product, width: 10 });
    });
    
    // 添加总价列
    columns.push({ header: '总价(¥)', key: 'total', width: 12 });
    
    worksheet.columns = columns;
    
    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    
    // 添加客户数据
    customers.forEach(customer => {
        const rowData = {
            name: customer.name,
            phone: customer.phone || '',
            address: customer.address || ''
        };
        
        // 填充商品数量
        customer.items.forEach(item => {
            rowData[item.product] = item.quantity;
        });
        
        // 计算总价
        rowData.total = customer.items.reduce((sum, item) => sum + item.subtotal, 0);
        
        worksheet.addRow(rowData);
    });
    
    // 添加空行
    worksheet.addRow([]);
    
    // 添加统计行
    const summaryRow = ['商品统计', '', ''];
    const productTotals = {};
    
    // 计算每种商品的总数和总价
    customers.forEach(customer => {
        customer.items.forEach(item => {
            if (!productTotals[item.product]) {
                productTotals[item.product] = {
                    quantity: 0,
                    amount: 0
                };
            }
            productTotals[item.product].quantity += item.quantity;
            productTotals[item.product].amount += item.subtotal;
        });
    });
    
    // 填充统计数据
    Array.from(allProducts).forEach(product => {
        const total = productTotals[product] || { quantity: 0, amount: 0 };
        summaryRow.push(`${total.quantity}个 (¥${total.amount.toFixed(2)})`);
    });
    
    // 计算总金额
    const totalAmount = Object.values(productTotals)
        .reduce((sum, { amount }) => sum + amount, 0);
    summaryRow.push(`¥${totalAmount.toFixed(2)}`);
    
    // 添加统计行并设置样式
    const statsRow = worksheet.addRow(summaryRow);
    statsRow.font = { bold: true };
    statsRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE0E0' }
    };
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_summary_${new Date().toLocaleDateString()}.xlsx`);
    
    // 生成并发送文件
    await workbook.xlsx.write(res);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}); 