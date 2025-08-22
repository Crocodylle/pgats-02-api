const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { 
  findUserByEmail, 
  findUserById, 
  addUser, 
  generateAccount, 
  getAllUsers,
  database 
} = require('../database');

class UserService {
  async createUser(userData) {
    const { name, email, password } = userData;

    // Validar dados obrigatórios
    if (!name || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios');
    }

    // Verificar se usuário já existe
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      throw new Error('Usuário já existe com este email');
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gerar conta única
    let account;
    do {
      account = generateAccount();
    } while (database.users.some(user => user.account === account));

    // Criar usuário
    const user = new User(
      database.nextUserId++,
      name,
      email,
      hashedPassword,
      account,
      1000 // Saldo inicial de R$ 1.000,00
    );

    return addUser(user);
  }

  getUserById(id) {
    const user = findUserById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user;
  }

  getAllUsers() {
    return getAllUsers();
  }

  updateUserBalance(userId, amount) {
    const user = findUserById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    user.updateBalance(amount);
    return user;
  }

  getUserBalance(userId) {
    const user = findUserById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return { balance: user.balance };
  }
}

module.exports = new UserService();
