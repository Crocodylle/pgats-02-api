const userService = require('../services/userService');

class UserController {
  async register(req, res) {
    try {
      const user = await userService.createUser(req.body);
      
      res.status(201).json({
        message: 'Usuário criado com sucesso',
        data: user.toJSON()
      });
    } catch (error) {
      if (error.message.includes('já existe')) {
        return res.status(409).json({
          error: error.message
        });
      }
      
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getUsers(req, res) {
    try {
      const users = userService.getAllUsers();
      
      res.status(200).json({
        message: 'Usuários recuperados com sucesso',
        data: users
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = userService.getUserById(req.user.userId);
      
      res.status(200).json({
        message: 'Perfil recuperado com sucesso',
        data: user.toJSON()
      });
    } catch (error) {
      res.status(404).json({
        error: error.message
      });
    }
  }

  async getBalance(req, res) {
    try {
      const balance = userService.getUserBalance(req.user.userId);
      
      res.status(200).json({
        message: 'Saldo recuperado com sucesso',
        data: balance
      });
    } catch (error) {
      res.status(404).json({
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
