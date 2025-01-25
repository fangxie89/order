export class Order {
  constructor({ name, phone, address, items = [] }) {
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.items = items;
  }

  addItem(product, quantity) {
    this.items.push({
      product,
      quantity,
      subtotal: 0 // 将由 OrderCalculator 计算
    });
  }

  removeItem(index) {
    this.items.splice(index, 1);
  }

  updateItem(index, product, quantity) {
    this.items[index] = {
      ...this.items[index],
      product,
      quantity
    };
  }

  get total() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  toJSON() {
    return {
      name: this.name,
      phone: this.phone,
      address: this.address,
      items: this.items
    };
  }
} 