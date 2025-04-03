import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppContext } from '../context/AppContext';
import { Order } from '../models/Order';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function OrderForm() {
  const { 
    orders, 
    currentOrderIndex, 
    priceData, 
    addOrder, 
    updateOrder, 
    showNotification 
  } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    items: [],
    date: dayjs()
  });

  useEffect(() => {
    if (currentOrderIndex >= 0 && orders[currentOrderIndex]) {
      const order = orders[currentOrderIndex];
      setFormData({
        name: order.name,
        phone: order.phone,
        address: order.address,
        items: [...order.items],
        date: dayjs(order.date)
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        address: '',
        items: [],
        date: dayjs()
      });
    }
  }, [currentOrderIndex, orders]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // 如果修改了商品或数量，重新计算小计
    if (field === 'product' || field === 'quantity') {
      const price = priceData[newItems[index].product]?.price || 0;
      newItems[index].subtotal = price * newItems[index].quantity;
    }

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, subtotal: 0 }]
    }));
  };

  const handleDeleteItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 验证表单
      if (!formData.name.trim()) {
        showNotification('请输入客户姓名', 'error');
        return;
      }

      if (formData.items.length === 0) {
        showNotification('请添加至少一个商品', 'error');
        return;
      }

      for (const item of formData.items) {
        if (!item.product) {
          showNotification('请选择商品', 'error');
          return;
        }
        if (!item.quantity || item.quantity <= 0) {
          showNotification('请输入有效的数量', 'error');
          return;
        }
      }

      const orderData = {
        ...formData,
        date: formData.date.toDate()
      };

      if (currentOrderIndex >= 0) {
        await updateOrder(currentOrderIndex, orderData);
      } else {
        await addOrder(orderData);
        setFormData({
          name: '',
          phone: '',
          address: '',
          items: [],
          date: dayjs()
        });
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="订单日期"
                value={formData.date}
                onChange={(newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    date: newValue
                  }));
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="客户姓名"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="电话"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="地址"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">商品列表</Typography>
          {formData.items.map((item, index) => (
            <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="商品"
                  value={item.product}
                  onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  {Object.keys(priceData).map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="数量"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="小计"
                  value={item.subtotal}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <IconButton onClick={() => handleDeleteItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button type="button" variant="outlined" onClick={handleAddItem}>
            添加商品
          </Button>
          <Button type="submit" variant="contained">
            {currentOrderIndex >= 0 ? '更新订单' : '添加订单'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default OrderForm; 