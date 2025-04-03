import React, { useContext } from 'react';
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
import { AppContext } from '../../context/AppContext';
import styled from 'styled-components';
import './style.css';

const SummaryContainer = styled.div`
  margin-top: 2rem;
`;

// 格式化数量显示
const formatQuantity = (quantity) => {
  // 如果是整数，直接显示
  if (Number.isInteger(quantity)) {
    return quantity;
  }
  // 如果是 0.5 的倍数，显示到一位小数
  if (quantity % 0.5 === 0) {
    return quantity.toFixed(1);
  }
  // // 其他情况显示到两位小数
  return quantity.toFixed(2);
};

function ProductSummary() {
  const { orders } = useContext(AppContext);

  if (!orders) {
    return null;
  }

  const calculateSummary = () => {
    const summary = {};
    let totalQuantity = 0;
    let totalAmount = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!summary[item.product]) {
          summary[item.product] = {
            quantity: 0,
            amount: 0
          };
        }
        summary[item.product].quantity += parseFloat(item.quantity);
        summary[item.product].amount += item.subtotal;
        totalQuantity += item.quantity;
        totalAmount += item.subtotal;
      });
    });

    return { summary, totalQuantity, totalAmount };
  };

  const { summary, totalQuantity, totalAmount } = calculateSummary();

  return (
    <SummaryContainer>
      <Typography variant="h6" gutterBottom>
        商品统计
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>商品名称</TableCell>
              <TableCell align="right">数量</TableCell>
              <TableCell align="right">金额</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(summary).map(([product, data]) => (
              <TableRow key={product}>
                <TableCell>{product}</TableCell>
                <TableCell align="right">{formatQuantity(data.quantity)}</TableCell>
                <TableCell align="right">¥{data.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell><strong>总计</strong></TableCell>
              <TableCell align="right"><strong>¥{totalAmount.toFixed(2)}</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </SummaryContainer>
  );
}

export default ProductSummary; 