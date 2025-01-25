export const parseGroupOrder = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const orders = [];
  let currentOrder = null;

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

  // 商品名称映射表，用于处理同一商品的不同叫法
  const productMapping = {
    '榴莲': '榴莲蛋糕卷',
    '榴莲卷': '榴莲蛋糕卷',
    '抹茶红豆卷': '抹茶红豆',
    '抹茶卷': '抹茶',
    '巧克力卷': '巧克力',
    '巧克力': '巧克力',
    '原味': '原味',
    '原味卷': '原味',
    '红茶卷': '红茶',
    '驴打滚': '驴打滚',
    '芒果班戟': '芒果班戟',
    '榴莲班戟': '榴莲班戟',
    '芒果雪媚娘': '芒果雪媚娘',
    '奥利奥雪媚娘': '奥利奥雪媚娘',
    '绿豆糕': '绿豆糕',
    '豆沙绿豆糕': '绿豆糕豆沙',
    '芋泥绿豆糕': '绿豆糕芋泥',
    '冰皮': '冰皮月饼',
    '桃酥': '桃酥',
    '桃花酥': '桃花酥',
    '芋泥豆沙酥': '芋泥豆沙酥',
    '蛋黄酥': '蛋黄酥',
    '桂花糕': '桂花糕',
    '椰蓉荷花酥': '椰蓉荷花酥',
    '牛舌饼': '牛舌饼'
  };

  // 标准化商品名称
  const normalizeProductName = (name) => {
    name = name.trim();
    // 先尝试完全匹配
    if (productMapping[name]) {
      return productMapping[name];
    }
    // 再尝试部分匹配
    for (const [key, value] of Object.entries(productMapping)) {
      if (name.includes(key)) {
        return value;
      }
    }
    return null;
  };

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
        items: []
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
            currentOrder.items.push({
              product: normalizedProductName,
              quantity: convertChineseNumber(itemMatch[2]),
              subtotal: 0 // 将由 OrderCalculator 计算
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