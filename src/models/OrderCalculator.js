export class OrderCalculator {
  constructor(priceData) {
    this.priceData = priceData;
  }

  calculateOrder(order) {
    order.items.forEach(item => {
      const product = this.priceData[item.product];
      if (product) {
        const quantity = parseFloat(item.quantity);
        item.subtotal = this.calculateSubtotal(product, quantity);
      }
    });
  }

  calculateSubtotal(product, quantity) {
    if (!product.half) {
      return product.price * quantity;
    }
    return quantity % 1 === 0
      ? product.price * quantity
      : product.half * Math.floor(quantity) + (quantity % 1 === 0.5 ? product.half : 0);
  }
} 