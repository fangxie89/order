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
import { initializeProductPrices } from './utils/parser';

function App() {
  const [orders, setOrders] = useState([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(-1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { showNotification } = useNotification();
  const [orderManager, setOrderManager] = useState(null);

  useEffect(() => {
    // 在应用启动时初始化商品价格
    initializeProductPrices();
    
    // 页面加载时检查认证状态
    const checkAuth = async () => {
      // 如果本地存储中有用户信息，直接设置用户状态并加载数据
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);
        loadInitialData();
      }
      
      try {
        const isValid = await auth.checkAuth();
        if (!isValid) {
          // 如果token无效，清除用户状态
          setUser(null);
          setOrderManager(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setOrderManager(null);
      }
    };

    checkAuth();
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

  const handleOrderDelete = async (index) => {
    try {
      await orderManager.deleteOrder(index);
      setOrders([...orderManager.orders]);
      if (currentOrderIndex === index) {
        setCurrentOrderIndex(-1);
      }
      showNotification('订单已删除');
    } catch (error) {
      showNotification('删除订单失败', 'error');
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < orderManager.orders.length) {
      try {
        await orderManager.moveOrder(index, newIndex);
        // 强制更新组件状态以重新渲染
        setOrders([...orderManager.orders]);
      } catch (error) {
        console.error('Failed to move order:', error);
      }
    }
  };

  const handleClearOrders = async () => {
    if (orderManager.orders.length === 0) {
      showNotification('列表已经是空的了！', 'info');
      return;
    }
    
    if (confirm('确定要清空所有订单吗？此操作不可恢复！')) {
      try {
        await orderManager.clearOrders();
        setOrders([]);
        setCurrentOrderIndex(-1);
        showNotification('已清空所有订单');
      } catch (error) {
        showNotification('清空订单失败', 'error');
      }
    }
  };

  const handleAddOrder = async (orderData) => {
    try {
      const order = await orderManager.addOrder(orderData);
      setOrders([...orderManager.orders]);
      showNotification('订单已添加');
      return order;
    } catch (error) {
      showNotification('添加订单失败', 'error');
      throw error;
    }
  };

  const handleUpdateOrder = async (index, orderData) => {
    try {
      await orderManager.updateOrder(index, orderData);
      setOrders([...orderManager.orders]);
      showNotification('订单已更新');
      return true;
    } catch (error) {
      showNotification('更新订单失败', 'error');
      throw error;
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
    moveOrder: handleMoveOrder,
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
                <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
                  接龙导入
                </Button>
              </Box>
            </Box>

            <CustomerList
              onSelect={handleOrderSelect}
              onDelete={handleOrderDelete}
              onMove={handleMoveOrder}
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