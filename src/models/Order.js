export class Order {
  constructor({ name, phone, address, items = [], date = new Date() }) {
    this.id = null;
    this.name = name || '';
    this.phone = phone || '';
    this.address = address || '';
    this.items = items || [];
    this._total = 0;
    this.position = 0;
    this.date = date;
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
    return this._total;
  }

  set total(value) {
    this._total = value;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      address: this.address,
      items: this.items,
      total: this._total,
      position: this.position,
      date: this.date
    };
  }
} 