import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography
} from '@mui/material';
import { AppContext } from '../../context/AppContext';
import { parseGroupOrder } from '../../utils/parser';
import styled from 'styled-components';
import './style.css';

const DialogContentStyled = styled(DialogContent)`
  min-height: 300px;
`;

const ErrorMessage = styled(Typography)`
  color: #f44336;
  margin-top: 8px;
`;

function GroupOrderDialog({ open, onClose }) {
  const { orders, addOrder, showNotification } = useContext(AppContext);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    if (!text.trim()) {
      setError('请输入接龙内容！');
      return;
    }

    try {
      const parsedOrders = parseGroupOrder(text);
      console.log(parsedOrders)
      if (parsedOrders.length === 0) {
        setError('未能识别任何有效订单！');
        return;
      }

      // 确认是否合并订单
      if (orders.length > 0 && !confirm('是否要合并接龙订单？点击确定合并，点击取消替换现有数据。')) {
        orders.length = 0;
      }
      // 添加解析出的订单
      parsedOrders.forEach(orderData => {
        addOrder(orderData);
      });

      showNotification(`成功导入 ${parsedOrders.length} 个订单！`);
      setText('');
      setError('');
      onClose();
    } catch (error) {
      console.error('Error parsing group order:', error);
      setError('接龙内容解析失败！');
    }
  };

  const handleClose = () => {
    setText('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>接龙导入</DialogTitle>
      <DialogContentStyled>
        <TextField
          multiline
          rows={10}
          fullWidth
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          placeholder={`请粘贴接龙内容，格式示例：

1. 张三，电话13800138000，地址xx小区
榴莲蛋糕卷1个，抹茶2.5个

2. 李四，电话13900139000
原味1个，巧克力0.5个，桃酥5个`}
          variant="outlined"
          margin="normal"
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </DialogContentStyled>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleImport} color="primary">
          导入
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GroupOrderDialog; 