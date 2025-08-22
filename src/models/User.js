class User {
  constructor(id, name, email, password, account, balance = 0) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.account = account;
    this.balance = balance;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  updateBalance(amount) {
    this.balance += amount;
    this.updatedAt = new Date();
  }
}

module.exports = User;
