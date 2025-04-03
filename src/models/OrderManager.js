import { Order } from "./Order";
import { OrderCalculator } from "./OrderCalculator";
import { auth } from "../services/auth";
import dayjs from "dayjs";

export class OrderManager {
  constructor(priceData) {
    this.orders = [];
    this.calculator = new OrderCalculator(priceData);
    this.loadOrders();
  }

  async loadOrders() {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to load orders');
      }
      const ordersData = await response.json();
      
      this.orders = ordersData.map(data => {
        const order = new Order({
          name: data.name,
          phone: data.phone,
          address: data.address,
          items: data.items,
          date: new Date(data.date)  // 转换日期
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
      const order = new Order(orderData);
      this.calculator.calculateOrder(order);
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...order.toJSON(),
          date: order.date.toISOString(),  // 确保日期格式正确
          total: parseFloat(order.total),
          items: order.items.map(item => ({
            product: item.product,
            quantity: Number(item.quantity),
            subtotal: parseFloat(item.subtotal)
          }))
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
          date: dayjs(order.date).toISOString(), // 确保日期格式正确
          total: parseFloat(order.total),
          items: order.items.map(item => ({
            product: item.product,
            quantity: Number(item.quantity),
            subtotal: parseFloat(item.subtotal)
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await response.json();
      order.id = existingOrder.id;
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
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      this.orders.splice(index, 1);
      return true;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  clearOrders() {
    return Promise.all(
      this.orders.map((_, index) => this.deleteOrder(index))
    ).then(() => {
      this.orders = [];
    });
  }

  async moveOrder(fromIndex, toIndex) {
    try {
      // 先在内存中移动
      const order = this.orders[fromIndex];
      this.orders.splice(fromIndex, 1);
      this.orders.splice(toIndex, 0, order);

      // 同步到数据库
      const response = await fetch(`/api/orders/${order.id}/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromIndex,
          toIndex,
          orderId: order.id,
        }),
      });

      if (!response.ok) {
        // 如果数据库更新失败，恢复内存中的顺序
        this.orders.splice(toIndex, 1);
        this.orders.splice(fromIndex, 0, order);
        throw new Error("Failed to update order position");
      }

      return true;
    } catch (error) {
      console.error("Error moving order:", error);
      throw error;
    }
  }

  recalculateAll() {
    this.orders.forEach((order) => this.calculator.calculateOrder(order));
  }

  getSummary() {
    const summary = {};
    let totalQuantity = 0;
    let totalAmount = 0;

    this.orders.forEach((order) => {
      order.items.forEach((item) => {
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
