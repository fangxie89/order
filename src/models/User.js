export class User {
  constructor({ username, role = 'user' }) {
    this.username = username;
    this.role = role;
  }

  hasPermission(permission) {
    if (this.role === 'admin') return true;
    return false; // 可以根据需要扩展权限系统
  }

  toJSON() {
    return {
      username: this.username,
      role: this.role
    };
  }
} 