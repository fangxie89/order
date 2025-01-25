import { User } from '../models/User';

const USERS = {
  'admin': { password: 'tn1lJBB?', role: 'admin' },
  'user': { password: 'user123', role: 'user' }
};

export const auth = {
  currentUser: null,

  async login(username, password) {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = USERS[username];
    if (!user || user.password !== password) {
      throw new Error('用户名或密码错误');
    }

    this.currentUser = new User({ username, role: user.role });
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return this.currentUser;
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  },

  restoreSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      this.currentUser = new User(userData);
      return this.currentUser;
    }
    return null;
  }
}; 