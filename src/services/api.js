export const api = {
  async saveOrders(customers) {
    const response = await fetch('/api/submit-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customers })
    });
    return response.blob();
  },

  async saveDailyOrders(customers) {
    const response = await fetch('/api/save-daily-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customers })
    });
    return response.json();
  }
}; 