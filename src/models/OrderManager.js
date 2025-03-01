import { Order } from './Order';
import { OrderCalculator } from './OrderCalculator';
import { auth } from '../services/auth';

export class OrderManager {
  constructor(priceData) {
    this.orders = [];
    this.calculator = new OrderCalculator(priceData);
    this.loadOrders();
  }

  async loadOrders() {
    console.log('loadOrders')
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load orders');
      }
      const orders = await response.json();
      this.orders = orders.map(data => {
        const order = new Order({
          name: data.name,
          phone: data.phone,
          address: data.address,
          items: data.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        });
        order.id = data.id;
        return order;
      });
      this.recalculateAll();
      return this.orders;
    } catch (error) {
      console.error('Error loading orders:', error);
      throw error;
    }
  }

  async addOrder(orderData) {
    try {
      console.log('addorder')
      const order = new Order(orderData);
      this.calculator.calculateOrder(order);
      
      // 如果没有登录用户，使用默认用户
      const userId = auth.currentUser?.id || '00000000-0000-0000-0000-000000000000';
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...order.toJSON(),
          total: order.total,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      const savedOrder = await response.json();
      order.id = savedOrder.id;
      this.orders.push(order);
      return order;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  async updateOrder(index, orderData) {
    console.log('updateOrder')
    try {
      const order = new Order(orderData);
      this.calculator.calculateOrder(order);
      
      const existingOrder = this.orders[index];
      const response = await fetch(`/api/orders/${existingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...order.toJSON(),
          total: order.total
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      this.orders[index] = order;
      return order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async deleteOrder(index) {
    try {
      const order = this.orders[index];
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      this.orders.splice(index, 1);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  moveOrder(fromIndex, toIndex) {
    const order = this.orders[fromIndex];
    this.orders.splice(fromIndex, 1);
    this.orders.splice(toIndex, 0, order);
  }

  recalculateAll() {
    this.orders.forEach(order => this.calculator.calculateOrder(order));
  }

  getSummary() {
    const summary = {};
    let totalQuantity = 0;
    let totalAmount = 0;

    this.orders.forEach(order => {
      order.items.forEach(item => {
        if (!summary[item.product]) {
          summary[item.product] = { quantity: 0, amount: 0 };
        }
        summary[item.product].quantity += parseFloat(item.quantity);
        summary[item.product].amount += item.subtotal;
        totalQuantity += parseFloat(item.quantity);
        totalAmount += item.subtotal;
      });
    });

    return { summary, totalQuantity, totalAmount };
  }
} 