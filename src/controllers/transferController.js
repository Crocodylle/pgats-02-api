const transferService = require('../services/transferService');

class TransferController {
  async createTransfer(req, res) {
    try {
      const transfer = await transferService.createTransfer(req.user.userId, req.body);
      
      res.status(201).json({
        message: 'Transferência realizada com sucesso',
        data: transfer
      });
    } catch (error) {
      if (error.message.includes('Saldo insuficiente')) {
        return res.status(400).json({
          error: error.message
        });
      }
      
      if (error.message.includes('favorecidos')) {
        return res.status(403).json({
          error: error.message
        });
      }

      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          error: error.message
        });
      }
      
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getTransfers(req, res) {
    try {
      const transfers = transferService.getTransfersByUserId(req.user.userId);
      
      res.status(200).json({
        message: 'Transferências recuperadas com sucesso',
        data: transfers
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async addFavorite(req, res) {
    try {
      const { account } = req.body;
      const favorite = await transferService.addFavorite(req.user.userId, account);
      
      res.status(201).json({
        message: 'Favorito adicionado com sucesso',
        data: favorite
      });
    } catch (error) {
      if (error.message.includes('não encontrada')) {
        return res.status(404).json({
          error: error.message
        });
      }

      if (error.message.includes('já está nos favoritos')) {
        return res.status(409).json({
          error: error.message
        });
      }
      
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getFavorites(req, res) {
    try {
      const favorites = transferService.getFavoritesByUserId(req.user.userId);
      
      res.status(200).json({
        message: 'Favoritos recuperados com sucesso',
        data: favorites
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async removeFavorite(req, res) {
    try {
      const { id } = req.params;
      const result = await transferService.removeFavorite(req.user.userId, id);
      
      res.status(200).json({
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          error: error.message
        });
      }
      
      res.status(400).json({
        error: error.message
      });
    }
  }
}

module.exports = new TransferController();
