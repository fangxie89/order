import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';

function ProductSummary() {
  // 从 AppContext 获取 orders
  const { orders } = useContext(AppContext);

  // 按日期对订单进行分组并统计
  const groupedSummary = orders.reduce((groups, order) => {
    const date = dayjs(order.date).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = {};
    }
    
    order.items.forEach(item => {
      if (!groups[date][item.product]) {
        groups[date][item.product] = {
          quantity: 0,
          total: 0
        };
      }
      groups[date][item.product].quantity += item.quantity;
      groups[date][item.product].total += item.subtotal;
    });
    
    return groups;
  }, {});

  return (
    <Box>
      {Object.entries(groupedSummary).sort(([dateA], [dateB]) => dayjs(dateB).diff(dayjs(dateA))).map(([date, summary]) => (
        <Box key={date} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {dayjs(date).format('YYYY年MM月DD日')}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>商品</TableCell>
                  <TableCell align="right">数量</TableCell>
                  <TableCell align="right">金额</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(summary).map(([product, { quantity, total }]) => (
                  <TableRow key={product}>
                    <TableCell>{product}</TableCell>
                    <TableCell align="right">{quantity}</TableCell>
                    <TableCell align="right">{total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}

export default ProductSummary; 