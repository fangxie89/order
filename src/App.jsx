import React, { useState, useEffect } from 'react';
import { Container, Box, CssBaseline, Button } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import CustomerList from './components/CustomerList';
import OrderForm from './components/OrderForm';
import ProductSummary from './components/ProductSummary';
import GroupOrderDialog from './components/GroupOrderDialog';
import ProductManageDialog from './components/ProductManageDialog';
import Login from './components/Login';
import { AppContext } from './context/AppContext';
import { OrderManager } from './models/OrderManager';
import { Order } from './models/Order';
import { api } from './services/api';
import { auth } from './services/auth';
import useNotification from './hooks/useNotification';

function App() {
  const [orders, setOrders] = useState([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(-1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { showNotification } = useNotification();
  const [orderManager, setOrderManager] = useState(null);

  useEffect(() => {
  }, []);

  const handleLogin = (user) => {
    setUser(user);
    loadInitialData();
    showNotification('登录成功！');
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setOrderManager(null);
    showNotification('已退出登录');
  };

  const loadInitialData = async () => {
    try {
      const response = await fetch('/api/products');
      const priceData = await response.json();
      console.log('priceData', priceData);
      // 转换数据格式以匹配原有的 price.json 结构
      const formattedPriceData = priceData.reduce((acc, product) => {
        acc[product.name] = {
          price: product.price,
          half: product.half || null
        };
        return acc;
      }, {});

      const manager = new OrderManager(formattedPriceData);
      manager.loadOrders().then(() => {
        setOrders([...manager.orders]);
      });
      setOrderManager(manager);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      showNotification('加载数据失败！', 'error');
    }
  };

  const handleOrderSelect = (index) => {
    setCurrentOrderIndex(index);
  };

  const handleOrderDelete = (index) => {
    orderManager.deleteOrder(index);
    if (currentOrderIndex === index) {
      setCurrentOrderIndex(-1);
    }
  };

  const handleOrderMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < orderManager.orders.length) {
      orderManager.moveOrder(index, newIndex);
      if (currentOrderIndex === index) {
        setCurrentOrderIndex(newIndex);
      } else if (currentOrderIndex === newIndex) {
        setCurrentOrderIndex(index);
      }
    }
  };

  const handleExportDaily = async () => {
    if (orderManager.orders.length === 0) {
      showNotification('没有可导出的订单数据！', 'error');
      return;
    }

    try {
      const result = await api.saveDailyOrders(orderManager.orders);
      if (result.success) {
        showNotification(`订单数据已保存为: ${result.fileName}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      showNotification('导出订单数据失败！', 'error');
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedOrders = JSON.parse(e.target.result);
        if (Array.isArray(importedOrders)) {
          // 创建新的 OrderManager 实例并合并数据
          const newMafginager = new OrderManager(orderManager.calculator.priceData);
          newManager.orders = importedOrders.map(data => new Order(data));
          newManager.recalculateAll();

          if (orderManager.orders.length > 0 && 
              confirm('是否要合并导入的订单数据？点击确定合并，点击取消替换现有数据。')) {
            orderManager.orders.push(...newManager.orders);
          } else {
            orderManager.orders = newManager.orders;
          }
          orderManager.saveOrders();
          showNotification('订单数据导入成功！');
        } else {
          throw new Error('无效的订单数据格式');
        }
      } catch (error) {
        console.error('Error parsing import file:', error);
        showNotification('导入的文件格式无效！', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleGenerateExcel = async () => {
    if (orderManager.orders.length === 0) {
      showNotification('没有可导出的订单数据！', 'error');
      return;
    }

    try {
      const blob = await api.saveOrders(orderManager.orders);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_summary_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating Excel:', error);
      showNotification('生成汇总表格失败！', 'error');
    }
  };

  const handleClearOrders = () => {
    if (orderManager.orders.length === 0) {
      showNotification('列表已经是空的了！', 'info');
      return;
    }
    
    if (confirm('确定要清空所有订单吗？此操作不可恢复！')) {
      orderManager.clearOrders();
      setCurrentOrderIndex(-1);
      showNotification('已清空所有订单');
    }
  };

  const handleAddOrder = async (orderData) => {
    try {
      const order = await orderManager.addOrder(orderData);
      setOrders([...orderManager.orders]);
      showNotification('订单已添加');
    } catch (error) {
      showNotification('添加订单失败', 'error');
    }
  };

  const handleUpdateOrder = async (index, orderData) => {
    try {
      await orderManager.updateOrder(index, orderData);
      setOrders([...orderManager.orders]);
      showNotification('订单已更新');
    } catch (error) {
      showNotification('更新订单失败', 'error');
    }
  };
  if (!user) {
    return (
      <SnackbarProvider maxSnack={3}>
        <CssBaseline />
        <Login onLoginSuccess={handleLogin} />
      </SnackbarProvider>
    );
  }

  if (!orderManager) {
    return null; // 或显示加载中状态
  }

  const contextValue = {
    orders,
    currentOrderIndex,
    setCurrentOrderIndex,
    priceData: orderManager.calculator.priceData,
    addOrder: handleAddOrder,
    updateOrder: handleUpdateOrder,
    deleteOrder: orderManager.deleteOrder.bind(orderManager),
    moveOrder: orderManager.moveOrder.bind(orderManager),
    showNotification,
    user
  };

  return (
    <SnackbarProvider maxSnack={3}>
      <AppContext.Provider value={contextValue}>
        <CssBaseline />
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                欢迎，{user.username}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  sx={{ ml: 2 }}
                >
                  退出登录
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => setIsProductDialogOpen(true)}
                >
                  商品管理
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={handleClearOrders}
                >
                  清空列表
                </Button>
                <Button variant="contained" onClick={handleExportDaily}>
                  导出当日订单
                </Button>
                <input
                  type="file"
                  id="importFile"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImportFile}
                />
                <Button
                  variant="contained"
                  onClick={() => document.getElementById('importFile').click()}
                >
                  导入订单数据
                </Button>
                <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
                  接龙导入
                </Button>
                <Button variant="contained" onClick={handleGenerateExcel}>
                  生成汇总表格
                </Button>
              </Box>
            </Box>

            <CustomerList
              onSelect={handleOrderSelect}
              onDelete={handleOrderDelete}
              onMove={handleOrderMove}
            />
            <OrderForm />
            <ProductSummary />
            <GroupOrderDialog
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
            />
            <ProductManageDialog
              open={isProductDialogOpen}
              onClose={() => setIsProductDialogOpen(false)}
            />
          </Box>
        </Container>
      </AppContext.Provider>
    </SnackbarProvider>
  );
}

export default App; 