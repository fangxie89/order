import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import dayjs from 'dayjs';

function OrderList() {
  const { orders, deleteOrder, setCurrentOrderIndex, moveOrder } = useContext(AppContext);

  // 按日期对订单进行分组
  const groupedOrders = orders.reduce((groups, order, index) => {
    const date = dayjs(order.date).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push({ ...order, index });
    return groups;
  }, {});

  const handleEdit = (index) => {
    setCurrentOrderIndex(index);
  };

  const handleDelete = async (index) => {
    if (window.confirm('确定要删除这个订单吗？')) {
      await deleteOrder(index);
    }
  };

  const handleMove = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < orders.length) {
      await moveOrder(index, newIndex);
    }
  };

  // 计算每个日期组的总计
  const calculateDailyTotal = (dateOrders) => {
    return dateOrders.reduce((total, order) => total + order.total, 0);
  };

  return (
    <Box>
      {Object.entries(groupedOrders)
        .sort(([dateA], [dateB]) => dayjs(dateB).diff(dayjs(dateA)))
        .map(([date, dateOrders]) => (
          <Box key={date} sx={{ mb: 4 }}>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light' }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {dayjs(date).format('YYYY年MM月DD日')}
                <span style={{ marginLeft: '20px' }}>
                  订单数: {dateOrders.length}
                </span>
                <span style={{ marginLeft: '20px' }}>
                  总金额: ¥{calculateDailyTotal(dateOrders).toFixed(2)}
                </span>
              </Typography>
            </Paper>

            {dateOrders.map((order) => (
              <Paper key={order.id} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle1">
                      客户：{order.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle1">
                      电话：{order.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1">
                      地址：{order.address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton 
                        onClick={() => handleMove(order.index, 'up')}
                        disabled={order.index === 0}
                      >
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleMove(order.index, 'down')}
                        disabled={order.index === orders.length - 1}
                      >
                        <ArrowDownwardIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(order.index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(order.index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 1 }} />
                <Box>
                  {order.items.map((item, itemIndex) => (
                    <Typography key={itemIndex}>
                      {item.product}: {item.quantity} × {(item.subtotal / item.quantity).toFixed(2)} = {item.subtotal.toFixed(2)}
                    </Typography>
                  ))}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    总计：¥{order.total.toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        ))}
    </Box>
  );
}

export default OrderList; 