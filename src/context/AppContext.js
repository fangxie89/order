import { createContext } from 'react';

export const  AppContext = createContext({
  customers: [],
  setCustomers: () => {},
  currentCustomerIndex: -1,
  setCurrentCustomerIndex: () => {},
  priceData: {},
  showNotification: () => {}
}); 