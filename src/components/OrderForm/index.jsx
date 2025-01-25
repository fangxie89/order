import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { AppContext } from '../../context/AppContext';
import styled from 'styled-components';
import './style.css';

const OrderFormContainer = styled.div`
  margin-bottom: 2rem;
`;

const CustomerInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
`;

function OrderForm() {
  const {
    orders,
    currentOrderIndex,
    priceData,
    updateOrder,
    showNotification
  } = useContext(AppContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (currentOrderIndex !== -1) {
      const order = orders[currentOrderIndex];
      setName(order.name);
      setPhone(order.phone);
      setAddress(order.address);
      setItems(order.items);
    }
  }, [currentOrderIndex]);
  const addItem = () => {
    setItems([...items, { product: '', quantity: 1, subtotal: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'product' || field === 'quantity') {
      const product = priceData[newItems[index].product];
      if (product && newItems[index].quantity) {
        const quantity = parseFloat(newItems[index].quantity);
        newItems[index].subtotal = quantity % 1 === 0 
          ? product.price * quantity
          : product.half * Math.floor(quantity) + (quantity % 1 === 0.5 ? product.half : 0);
      }
    }
    
    setItems(newItems);
  };

  const saveOrder = () => {
    if (!name) {
      showNotification('请填写客户姓名！', 'error');
      return;
    }

    if (items.length === 0) {
      showNotification('请添加商品！', 'error');
      return;
    }

    const order = {
      name,
      phone,
      address,
      items
    };

    if (currentOrderIndex === -1) {
      updateOrder(order);
    } else {
      updateOrder(currentOrderIndex, order);
    }
    showNotification('订单已保存');
    clearForm();
  };

  const clearForm = () => {
    setName('');
    setPhone('');
    setAddress('');
    setItems([]);
  };

  return (
    <OrderFormContainer>
      <CustomerInfo>
        <TextField
          label="客户姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          label="电话"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          label="地址"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </CustomerInfo>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>商品</TableCell>
              <TableCell>数量</TableCell>
              <TableCell>小计</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <FormControl fullWidth>
                    <Select
                      value={item.product}
                      onChange={(e) => updateItem(index, 'product', e.target.value)}
                    >
                      {Object.keys(priceData).map(product => (
                        <MenuItem key={product} value={product}>
                          {product}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    inputProps={{ step: 0.5, min: 0.5 }}
                  />
                </TableCell>
                <TableCell>¥{item.subtotal.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => removeItem(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <FormActions>
        <Button variant="contained" onClick={addItem}>
          添加商品
        </Button>
        <Button variant="contained" color="primary" onClick={saveOrder}>
          保存订单
        </Button>
      </FormActions>
    </OrderFormContainer>
  );
}

export default OrderForm; 