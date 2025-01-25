let priceData = {};
let customers = [];
let currentCustomerIndex = -1;

// 加载价格数据和本地存储的客户数据
fetch('price.json')
    .then(response => response.json())
    .then(data => {
        priceData = data;
        // 加载本地存储的客户数据
        loadFromLocalStorage();
    });

function createProductSelect() {
    const select = document.createElement('select');
    select.className = 'product-select';
    select.innerHTML = '<option value="">请选择商品</option>';
    
    for (let product in priceData) {
        select.innerHTML += `<option value="${product}">${product}</option>`;
    }
    
    select.addEventListener('change', function() {
        updateRowPrice(this.closest('tr'));
    });
    
    return select;
}

function createQuantityInput(hasHalf) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'quantity-input';
    input.min = hasHalf ? '0.5' : '1';
    input.step = hasHalf ? '0.5' : '1';
    input.value = '1';
    
    input.addEventListener('change', function() {
        updateRowPrice(this.closest('tr'));
    });
    
    return input;
}

function updateRowPrice(row) {
    const select = row.querySelector('.product-select');
    const quantityInput = row.querySelector('.quantity-input');
    const priceCell = row.querySelector('.price');
    const subtotalCell = row.querySelector('.subtotal');
    
    if (select.value && quantityInput.value) {
        const product = priceData[select.value];
        const quantity = parseFloat(quantityInput.value);
        
        // 显示单价
        priceCell.textContent = `¥${product.price.toFixed(2)}`;
        
        let price;
        if (quantity % 1 === 0) {
            price = product.price * quantity;
        } else {
            price = product.half * Math.floor(quantity) + 
                   (quantity % 1 === 0.5 ? product.half : 0);
        }
        
        subtotalCell.textContent = `¥${price.toFixed(2)}`;
        updateTotal();
    }
}

function updateTotal() {
    const subtotals = document.querySelectorAll('.subtotal');
    let total = 0;
    
    subtotals.forEach(cell => {
        const value = parseFloat(cell.textContent.replace('¥', '')) || 0;
        total += value;
    });
    
    document.getElementById('totalPrice').textContent = `¥${total.toFixed(2)}`;
}

function addRow(itemData = null) {
    const tbody = document.querySelector('#orderTable tbody');
    const row = document.createElement('tr');
    
    const productCell = document.createElement('td');
    const select = createProductSelect();
    productCell.appendChild(select);
    
    const priceCell = document.createElement('td');
    priceCell.className = 'price';
    priceCell.textContent = '¥0.00';
    
    const quantityCell = document.createElement('td');
    const quantityInput = createQuantityInput(true);
    quantityCell.appendChild(quantityInput);
    
    const subtotalCell = document.createElement('td');
    subtotalCell.className = 'subtotal';
    subtotalCell.textContent = '¥0.00';
    
    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '删除';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = function() {
        row.remove();
        updateTotal();
    };
    actionCell.appendChild(deleteButton);
    
    row.appendChild(productCell);
    row.appendChild(priceCell);
    row.appendChild(quantityCell);
    row.appendChild(subtotalCell);
    row.appendChild(actionCell);
    
    if (itemData) {
        select.value = itemData.product;
        quantityInput.value = itemData.quantity;
        updateRowPrice(row);
    }
    
    tbody.appendChild(row);
}

// 添加通知函数
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 添加本地存储相关函数
function saveToLocalStorage() {
    localStorage.setItem('dessertOrderCustomers', JSON.stringify(customers));
}

function loadFromLocalStorage() {
    const savedCustomers = localStorage.getItem('dessertOrderCustomers');
    if (savedCustomers) {
        customers = JSON.parse(savedCustomers);
        refreshCustomersList();
        updateProductSummary();
    }
}

function addNewCustomer() {
    const name = document.getElementById('customerName').value;
    
    if (!name) {
        showNotification('请填写客户姓名！', true);
        return;
    }
    
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    
    const customer = {
        name,
        phone,
        address,
        items: []
    };
    
    customers.push(customer);
    currentCustomerIndex = customers.length - 1;
    saveToLocalStorage();
    refreshCustomersList();
    clearOrderForm();
    loadCustomerOrder(currentCustomerIndex);
    showNotification('新客户已添加');
}

function moveCustomer(index, direction) {
    if ((direction === -1 && index > 0) || (direction === 1 && index < customers.length - 1)) {
        const temp = customers[index];
        customers[index] = customers[index + direction];
        customers[index + direction] = temp;
        
        if (currentCustomerIndex === index) {
            currentCustomerIndex = index + direction;
        } else if (currentCustomerIndex === index + direction) {
            currentCustomerIndex = index;
        }
        
        saveToLocalStorage();
        refreshCustomersList();
    }
}

function refreshCustomersList() {
    const customersList = document.getElementById('customersList');
    customersList.innerHTML = '';
    
    customers.forEach((customer, index) => {
        const card = document.createElement('div');
        card.className = `customer-card ${index === currentCustomerIndex ? 'active' : ''}`;
        
        const info = document.createElement('div');
        info.className = 'customer-info-display';
        
        // 创建基本信息
        const basicInfo = document.createElement('div');
        basicInfo.innerHTML = `
            <strong>${customer.name}</strong>
            ${customer.phone ? `<br>电话: ${customer.phone}` : ''}
            ${customer.address ? `<br>${customer.address}` : ''}
            <br>总价: ¥${calculateCustomerTotal(customer).toFixed(2)}
        `;
        
        // 创建商品列表
        const itemsList = document.createElement('div');
        itemsList.className = 'customer-items-list';
        customer.items.forEach(item => {
            const itemSpan = document.createElement('span');
            itemSpan.textContent = `${item.product}: ${item.quantity}${item.quantity % 1 === 0 ? '个' : '份'}`;
            itemsList.appendChild(itemSpan);
        });
        
        info.appendChild(basicInfo);
        info.appendChild(itemsList);
        
        const actions = document.createElement('div');
        actions.className = 'customer-card-actions';
        
        // 添加排序按钮
        const orderButtons = document.createElement('div');
        orderButtons.className = 'order-buttons';
        
        const upButton = document.createElement('button');
        upButton.textContent = '↑';
        upButton.className = 'order-button';
        upButton.onclick = () => moveCustomer(index, -1);
        
        const downButton = document.createElement('button');
        downButton.textContent = '↓';
        downButton.className = 'order-button';
        downButton.onclick = () => moveCustomer(index, 1);
        
        orderButtons.appendChild(upButton);
        orderButtons.appendChild(downButton);
        
        const editBtn = document.createElement('button');
        editBtn.textContent = '编辑';
        editBtn.onclick = () => loadCustomerOrder(index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteCustomer(index);
        
        actions.appendChild(orderButtons);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        card.appendChild(info);
        card.appendChild(actions);
        customersList.appendChild(card);
    });
}

function calculateCustomerTotal(customer) {
    return customer.items.reduce((total, item) => total + item.subtotal, 0);
}

function loadCustomerOrder(index) {
    currentCustomerIndex = index;
    const customer = customers[index];
    
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerAddress').value = customer.address;
    
    const tbody = document.querySelector('#orderTable tbody');
    tbody.innerHTML = '';
    
    customer.items.forEach(item => {
        addRow(item);
    });
    
    refreshCustomersList();
}

function deleteCustomer(index) {
    if (confirm('确定要删除该客户的订单吗？')) {
        customers.splice(index, 1);
        if (currentCustomerIndex === index) {
            currentCustomerIndex = -1;
            clearOrderForm();
        }
        // 保存到本地存储
        saveToLocalStorage();
        refreshCustomersList();
        updateProductSummary();
        showNotification('客户订单已删除');
    }
}

function clearOrderForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.querySelector('#orderTable tbody').innerHTML = '';
    document.getElementById('totalPrice').textContent = '¥0.00';
}

function saveCurrentOrder() {
    const name = document.getElementById('customerName').value;
    
    if (!name) {
        showNotification('请填写客户姓名！', true);
        return;
    }
    
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    
    const items = [];
    document.querySelectorAll('#orderTable tbody tr').forEach(row => {
        const product = row.querySelector('.product-select').value;
        const quantity = row.querySelector('.quantity-input').value;
        const subtotal = parseFloat(row.querySelector('.subtotal').textContent.replace('¥', ''));
        
        if (product) {
            items.push({
                product,
                quantity: parseFloat(quantity),
                subtotal
            });
        }
    });
    
    if (items.length === 0) {
        showNotification('请至少添加一件商品！', true);
        return;
    }
    
    if (currentCustomerIndex === -1) {
        customers.push({
            name,
            phone,
            address,
            items
        });
        currentCustomerIndex = customers.length - 1;
    } else {
        customers[currentCustomerIndex] = {
            name,
            phone,
            address,
            items
        };
    }
    
    // 保存到本地存储
    saveToLocalStorage();
    
    refreshCustomersList();
    updateProductSummary();
    showNotification('订单已保存');
    
    // 清空当前表格
    clearOrderForm();
    currentCustomerIndex = -1;
    refreshCustomersList();
}

function submitAllOrders() {
    if (customers.length === 0) {
        showNotification('请至少添加一个客户订单！', true);
        return;
    }
    
    fetch('/submit-orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customers })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `订单汇总表_${new Date().toLocaleDateString()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification('汇总表格已生成');
        
        // 清空所有数据
        if (confirm('是否清空所有订单数据？')) {
            customers = [];
            currentCustomerIndex = -1;
            saveToLocalStorage();
            clearOrderForm();
            refreshCustomersList();
            updateProductSummary();
            showNotification('所有订单数据已清空');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('生成汇总表格时发生错误！', true);
    });
}

// 添加更新商品统计的函数
function updateProductSummary() {
    const summaryData = {};
    let totalQuantity = 0;
    let totalAmount = 0;
    
    // 统计所有客户的订单
    customers.forEach(customer => {
        customer.items.forEach(item => {
            if (!summaryData[item.product]) {
                summaryData[item.product] = {
                    quantity: 0,
                    amount: 0
                };
            }
            summaryData[item.product].quantity += parseFloat(item.quantity);
            summaryData[item.product].amount += item.subtotal;
            totalQuantity += parseFloat(item.quantity);
            totalAmount += item.subtotal;
        });
    });
    
    // 更新统计表格
    const tbody = document.querySelector('#productSummaryTable tbody');
    tbody.innerHTML = '';
    
    Object.entries(summaryData).forEach(([product, data]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product}</td>
            <td>${data.quantity.toFixed(1)}</td>
            <td>¥${data.amount.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // 更新总计
    document.getElementById('totalQuantity').textContent = totalQuantity.toFixed(1);
    document.getElementById('summaryTotalPrice').textContent = `¥${totalAmount.toFixed(2)}`;
}

// 页面加载时初始化统计表格
document.addEventListener('DOMContentLoaded', () => {
    updateProductSummary();
});

// 导出当日订单
async function exportDailyOrders() {
    if (customers.length === 0) {
        showNotification('没有可导出的订单数据！', true);
        return;
    }

    try {
        const response = await fetch('/save-daily-orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customers })
        });

        const result = await response.json();
        if (result.success) {
            showNotification(`订单数据已保存为: ${result.fileName}`);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error exporting orders:', error);
        showNotification('导出订单数据失败！', true);
    }
}

// 处理文件导入
async function handleFileImport(input) {
    const file = input.files[0];
    if (!file) return;

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedCustomers = JSON.parse(e.target.result);
                if (Array.isArray(importedCustomers)) {
                    if (customers.length > 0) {
                        if (confirm('是否要合并导入的订单数据？点击确定合并，点击取消替换现有数据。')) {
                            customers = customers.concat(importedCustomers);
                        } else {
                            customers = importedCustomers;
                        }
                    } else {
                        customers = importedCustomers;
                    }
                    
                    currentCustomerIndex = -1;
                    saveToLocalStorage();
                    refreshCustomersList();
                    updateProductSummary();
                    clearOrderForm();
                    showNotification('订单数据导入成功！');
                } else {
                    throw new Error('无效的订单数据格式');
                }
            } catch (error) {
                console.error('Error parsing import file:', error);
                showNotification('导入的文件格式无效！', true);
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error importing file:', error);
        showNotification('读取文件失败！', true);
    }
    
    // 清空 input 的值，允许重复导入同一个文件
    input.value = '';
}

// 显示接龙导入对话框
function showGroupOrderDialog() {
    document.getElementById('groupOrderDialog').style.display = 'flex';
}

// 关闭接龙导入对话框
function closeGroupOrderDialog() {
    document.getElementById('groupOrderDialog').style.display = 'none';
    document.getElementById('groupOrderText').value = '';
}

// 解析接龙文本
function parseGroupOrder(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const orders = [];
    
    const productMatchers = {
        '榴莲蛋糕卷': /榴莲.*卷|榴莲瑞士/,
        '抹茶红豆': /抹茶红豆.*卷/,
        '抹茶': /抹茶.*卷(?!红豆)|抹茶"原味"/,
        '巧克力': /巧克力.*卷/,
        '原味': /原味.*卷/,
        '红茶': /红茶.*卷|伯爵红茶/,
        '驴打滚': /驴打滚/,
        '芒果班戟': /芒果班戟/,
        '榴莲班戟': /榴莲班戟/,
        '芒果雪媚娘': /芒果雪媚娘/,
        '奥利奥雪媚娘': /奥利奥雪媚娘|雪媚娘奥利奥/,
        '绿豆糕': /绿豆糕(?!豆沙|芋泥)(?:原味)?/,
        '绿豆糕豆沙': /绿豆糕豆沙|豆沙绿豆糕/,
        '绿豆糕芋泥': /绿豆糕芋泥/,
        '冰皮月饼': /冰皮月饼/,
        '桃酥': /桃酥(?!花)/,
        '桃花酥': /桃花酥|豆沙桃花酥/,
        '芋泥豆沙酥': /芋泥豆沙酥/,
        '蛋黄酥': /蛋黄酥/,
        '桂花糕': /桂花糕/,
        '椰蓉荷花酥': /椰蓉荷花酥/
    };

    for (const line of lines) {
        // 跳过空行
        if (!line.trim()) continue;

        // 提取序号和名字
        const match = line.match(/^\d+\.\s*([^*×Xx\d]+)/);
        if (!match) continue;

        const name = match[1].trim();
        const items = [];

        // 遍历所有可能的产品，只要匹配到就添加一个
        for (const [product, pattern] of Object.entries(productMatchers)) {
            if (line.match(pattern)) {
                const productData = priceData[product];
                items.push({
                    product,
                    quantity: 1,
                    subtotal: productData.price
                });
            }
        }

        // 提取地址信息
        const addressMatch = line.match(/送(.*?)(?:，|。|$)/);
        const address = addressMatch ? addressMatch[1].trim() : '';

        if (items.length > 0) {
            orders.push({
                name,
                address,
                items
            });
        }
    }

    return orders;
}

// 导入接龙订单
function importGroupOrder() {
    const text = document.getElementById('groupOrderText').value;
    if (!text.trim()) {
        showNotification('请输入接龙内容！', true);
        return;
    }

    try {
        const newOrders = parseGroupOrder(text);
        if (newOrders.length === 0) {
            showNotification('未能解析出有效订单！', true);
            return;
        }

        if (customers.length > 0) {
            if (confirm('是否要合并接龙订单？点击确定合并，点击取消替换现有数据。')) {
                customers = customers.concat(newOrders);
            } else {
                customers = newOrders;
            }
        } else {
            customers = newOrders;
        }

        currentCustomerIndex = -1;
        saveToLocalStorage();
        refreshCustomersList();
        updateProductSummary();
        clearOrderForm();
        showNotification(`成功导入 ${newOrders.length} 个订单`);
        closeGroupOrderDialog();
    } catch (error) {
        console.error('Error parsing group order:', error);
        showNotification('解析接龙内容时发生错误！', true);
    }
} 