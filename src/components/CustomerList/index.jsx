import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import { ArrowUpward, ArrowDownward, Edit, Delete } from '@mui/icons-material';
import styled from 'styled-components';
import { AppContext } from '../../context/AppContext';

const CustomerListContainer = styled.div`
  margin-bottom: 2rem;
`;

const StyledCard = styled(Card)`
  margin-bottom: 1rem;
  ${props => props.active && `
    border: 2px solid #1976d2;
  `}
`;

const ItemsList = styled.div`
  margin-top: 0.5rem;
`;

const ItemTag = styled.span`
  display: inline-block;
  background-color: #e3f2fd;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  font-size: 0.875rem;
`;

const FlexBox = styled.div`
  display: flex;
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  flex: ${props => props.flex};
`;

function CustomerList({ onSelect, onDelete, onMove }) {
  const { orders, currentOrderIndex } = useContext(AppContext);

  if (!orders || orders.length === 0) {
    return <Typography>暂无订单</Typography>;
  }

  return (
    <CustomerListContainer>
      <Typography variant="h5" gutterBottom>
        客户列表
      </Typography>
      {orders.map((customer, index) => (
        <StyledCard
          key={index}
          active={index === currentOrderIndex}
        >
          <CardContent>
            <FlexBox justify="space-between" align="center">
              <FlexBox flex={1} direction="column">
                <Typography variant="h6">{customer.name}</Typography>
                {customer.phone && (
                  <Typography variant="body2">电话: {customer.phone}</Typography>
                )}
                {customer.address && (
                  <Typography variant="body2">{customer.address}</Typography>
                )}
                <Typography variant="body2">
                  总价: ¥{customer.total.toFixed(2)}
                </Typography>
                <ItemsList>
                  {customer.items.map((item, itemIndex) => (
                    <ItemTag key={itemIndex}>
                      {item.product}: {item.quantity}
                      {item.quantity % 1 === 0 ? '个' : '份'}
                    </ItemTag>
                  ))}
                </ItemsList>
              </FlexBox>
              <FlexBox>
                <IconButton onClick={() => onMove(index, -1)}>
                  <ArrowUpward />
                </IconButton>
                <IconButton onClick={() => onMove(index, 1)}>
                  <ArrowDownward />
                </IconButton>
                <IconButton onClick={() => onSelect(index)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(index)}>
                  <Delete />
                </IconButton>
              </FlexBox>
            </FlexBox>
          </CardContent>
        </StyledCard>
      ))}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => onSelect(-1)}
        sx={{ mt: 2 }}
      >
        添加新客户
      </Button>
    </CustomerListContainer>
  );
}

export default CustomerList; 