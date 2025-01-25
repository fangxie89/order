export const storage = {
  saveCustomers(customers) {
    localStorage.setItem('dessertOrderCustomers', JSON.stringify(customers));
  },

  loadCustomers() {
    const data = localStorage.getItem('dessertOrderCustomers');
    return data ? JSON.parse(data) : [];
  }
}; 