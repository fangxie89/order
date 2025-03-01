import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  TextField
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { AppContext } from '../../context/AppContext';
import styled from 'styled-components';

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const AddButton = styled(Button)`
  margin-bottom: 16px;
`;

function ProductManageDialog({ open, onClose }) {
  const { showNotification } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('加载商品列表失败', 'error');
    }
  };

  const handleAdd = () => {
    setEditingProduct({ name: '', price: '', half: '' });
    setIsEditing(true);
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
      
      await loadProducts();
      showNotification('商品已删除');
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('删除商品失败', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const method = editingProduct.id ? 'PUT' : 'POST';
      const url = editingProduct.id 
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingProduct.name,
          price: parseFloat(editingProduct.price),
          half: editingProduct.half ? parseFloat(editingProduct.half) : null
        })
      });

      if (!response.ok) throw new Error('Failed to save product');
      
      await loadProducts();
      setIsEditing(false);
      setEditingProduct(null);
      showNotification('商品已保存');
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('保存商品失败', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>商品管理</DialogTitle>
      <DialogContent>
        {!isEditing ? (
          <>
            <AddButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              添加商品
            </AddButton>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>商品名称</TableCell>
                    <TableCell align="right">单价</TableCell>
                    <TableCell align="right">半份价格</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">¥{product.price}</TableCell>
                      <TableCell align="right">
                        {product.half ? `¥${product.half}` : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <ActionButtons>
                          <IconButton onClick={() => handleEdit(product)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(product.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <div>
            <TextField
              fullWidth
              label="商品名称"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({
                ...editingProduct,
                name: e.target.value
              })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="单价"
              type="number"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({
                ...editingProduct,
                price: e.target.value
              })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="半份价格（可选）"
              type="number"
              value={editingProduct.half}
              onChange={(e) => setEditingProduct({
                ...editingProduct,
                half: e.target.value
              })}
              margin="normal"
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={() => setIsEditing(false)}>取消</Button>
            <Button onClick={handleSave} color="primary">
              保存
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>关闭</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ProductManageDialog; 