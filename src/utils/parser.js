// 首先声明 productMapping
const productMapping = {
  '榴莲': { standardName: '榴莲蛋糕卷', price: 0 },
  '榴莲卷': { standardName: '榴莲蛋糕卷', price: 0 },
  '抹茶红豆卷': { standardName: '抹茶红豆', price: 0 },
  '抹茶卷': { standardName: '抹茶', price: 0 },
  '巧克力卷': { standardName: '巧克力', price: 0 },
  '巧克力': { standardName: '巧克力', price: 0 },
  '原味': { standardName: '原味', price: 0 },
  '原味卷': { standardName: '原味', price: 0 },
  '红茶卷': { standardName: '红茶', price: 0 },
  '驴打滚': { standardName: '驴打滚', price: 0 },
  '芒果班戟': { standardName: '芒果班戟', price: 0 },
  '榴莲班戟': { standardName: '榴莲班戟', price: 0 },
  '芒果雪媚娘': { standardName: '芒果雪媚娘', price: 0 },
  '奥利奥雪媚娘': { standardName: '奥利奥雪媚娘', price: 0 },
  '绿豆糕': { standardName: '绿豆糕', price: 0 },
  '豆沙绿豆糕': { standardName: '绿豆糕豆沙', price: 0 },
  '芋泥绿豆糕': { standardName: '绿豆糕芋泥', price: 0 },
  '冰皮': { standardName: '冰皮月饼', price: 0 },
  '桃酥': { standardName: '桃酥', price: 0 },
  '桃花酥': { standardName: '桃花酥', price: 0 },
  '芋泥豆沙酥': { standardName: '芋泥豆沙酥', price: 0 },
  '蛋黄酥': { standardName: '蛋黄酥', price: 0 },
  '桂花糕': { standardName: '桂花糕', price: 0 },
  '椰蓉荷花酥': { standardName: '椰蓉荷花酥', price: 0 },
  '牛舌饼': { standardName: '牛舌饼', price: 0 }
};

// 将 initializeProductPrices 移到顶层
export async function initializeProductPrices() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    
    // 更新 productMapping 中的价格
    products.forEach(product => {
      Object.values(productMapping).forEach(mapping => {
        if (mapping.standardName === product.name) {
          mapping.price = product.price;
        }
      });
    });
    
    console.log('Product prices initialized:', productMapping);
  } catch (error) {
    console.error('Error initializing product prices:', error);
  }
}

// 中文数字映射
const chineseNumbers = {
  '零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '壹': 1, '贰': 2, '叁': 3, '肆': 4, '伍': 5,
  '陆': 6, '柒': 7, '捌': 8, '玖': 9, '拾': 10
};

// 转换中文数字为阿拉伯数字
const convertChineseNumber = (str) => {
  // 如果是阿拉伯数字，直接返回
  if (/^\d+\.?\d*$/.test(str)) {
    return parseFloat(str);
  }

  // 处理带小数点的中文数字（如：二点五）
  if (str.includes('点')) {
    const parts = str.split('点');
    const integer = convertChineseNumber(parts[0]);
    const decimal = convertChineseNumber(parts[1]) / 10;
    return integer + decimal;
  }

  let result = 0;
  let temp = 0;
  let multiple = 1;

  // 从右向左处理
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i];
    const num = chineseNumbers[char];

    if (num !== undefined) {
      if (char === '十' || char === '拾') {
        multiple = 10;
        if (temp === 0) temp = 1;
      } else {
        temp = num;
      }
    }

    if (i === 0 || chineseNumbers[str[i-1]] === undefined) {
      result += temp * multiple;
      temp = 0;
      multiple = 1;
    }
  }

  return result || parseFloat(str);
};

// 修改 normalizeProductName 函数
const normalizeProductName = (name) => {
  name = name.trim();
  // 先尝试完全匹配
  if (productMapping[name]) {
    return productMapping[name].standardName;
  }
  // 再尝试部分匹配
  for (const [key, value] of Object.entries(productMapping)) {
    if (name.includes(key)) {
      return value.standardName;
    }
  }
  return null;
};

// 在解析订单时获取价格
const getProductPrice = (productName) => {
  for (const [key, value] of Object.entries(productMapping)) {
    if (value.standardName === productName) {
      return value.price;
    }
  }
  return 0;
};

export const parseGroupOrder = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const orders = [];
  let currentOrder = null;

  for (let line of lines) {
    line = line.trim();
    
    // 跳过无效行
    if (!line || line.startsWith('接龙') || line.startsWith('订单')) {
      continue;
    }
    console.log(line);
    // 检查是否是新订单（以数字开头）
    const orderMatch = line.match(/^(\d+)[.、](.+)/);
    if (orderMatch) {
      // 保存前一个订单
      if (currentOrder) {
        orders.push(currentOrder);
      }

      // 解析客户信息
      const customerInfo = orderMatch[2].split('，');
      currentOrder = {
        name: customerInfo[0].trim(),
        phone: '',
        address: '',
        items: [],
        position: lines.indexOf(line)
      };

      // 解析电话和地址
      customerInfo.forEach(info => {
        if (info.includes('电话')) {
          currentOrder.phone = info.replace(/[电话:：]/g, '').trim();
        } else if (info.includes('地址')) {
          currentOrder.address = info.replace(/[地址:：]/g, '').trim();
        }
      });

    //   continue;
    }

    // 如果有当前订单，解析商品信息
    if (currentOrder) {
      // 支持多种分隔符
      const items = line.split(/[,，、\s]/g).map(item => item.trim());
      console.log(items);
      items.forEach(item => {
        // 修改匹配模式以包含中文数字
        const itemMatch = item.match(/(.+?)([0-9.|一|二|两|三|四|五|六|七|八|九|十|点]+)\s*(个|份|盒|条|P|$)/);
        if (itemMatch) {
          const rawProductName = itemMatch[1].trim();
          const normalizedProductName = normalizeProductName(rawProductName);
          
          if (normalizedProductName) {
            const price = getProductPrice(normalizedProductName);
            console.log(price);
            const quantity = convertChineseNumber(itemMatch[2]);
            currentOrder.items.push({
              product: normalizedProductName,
              quantity: quantity,
              subtotal: price * quantity  // 使用数据库中的价格计算小计
            });
          }
        }
      });
    }
  }

  // 保存最后一个订单
  if (currentOrder) {
    orders.push(currentOrder);
  }

  return orders;
};

function parsePrice(priceText) {
  // 从文本中提取数字
  const match = priceText.match(/(\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
}

function parseOrder(text, priceMap) {
  // ... 其他代码 ...

  // 解析商品和数量
  const items = [];
  const lines = text.split('\n');
  for (const line of lines) {
    for (const [productName, price] of Object.entries(priceMap)) {
      if (line.includes(productName)) {
        // 提取数量
        const quantityMatch = line.match(/(\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        
        items.push({
          product: productName,
          quantity: quantity,
          subtotal: price * quantity  // 确保使用正确的价格
        });
        break;
      }
    }
  }

  // ... 其他代码 ...

  return {
    name,
    phone,
    address,
    items
  };
} 