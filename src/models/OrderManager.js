import { Order } from './Order';
import { OrderCalculator } from './OrderCalculator';
import { storage } from '../services/storage';

export class OrderManager {
  constructor(priceData) {
    this.orders = [];
    this.calculator = new OrderCalculator(priceData);
    this.loadOrders();
  }

  clearOrders() {
    this.orders = [];
    this.saveOrders();
  }

  loadOrders() {
    const savedOrders = storage.loadCustomers();
    this.orders = savedOrders.map(data => new Order(data));
    this.recalculateAll();
  }

  saveOrders() {
    storage.saveCustomers(this.orders.map(order => order.toJSON()));
  }

  addOrder(orderData) {
    const order = new Order(orderData);
    this.calculator.calculateOrder(order);
    this.orders.push(order);
    this.saveOrders();
    return order;
  }

  updateOrder(index, orderData) {
    const order = new Order(orderData);
    this.calculator.calculateOrder(order);
    this.orders[index] = order;
    this.saveOrders();
    return order;
  }

  deleteOrder(index) {
    this.orders.splice(index, 1);
    this.saveOrders();
  }

  moveOrder(fromIndex, toIndex) {
    const order = this.orders[fromIndex];
    this.orders.splice(fromIndex, 1);
    this.orders.splice(toIndex, 0, order);
    this.saveOrders();
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
        summary[item.product].quantity += item.quantity;
        summary[item.product].amount += item.subtotal;
        totalQuantity += item.quantity;
        totalAmount += item.subtotal;
      });
    });

    return { summary, totalQuantity, totalAmount };
  }
} 