const Transfer = require('../models/Transfer');
const Favorite = require('../models/Favorite');
const {
  findUserById,
  findUserByAccount,
  addTransfer,
  addFavorite,
  isFavorite,
  getTransfersByUserId,
  getFavoritesByUserId,
  database
} = require('../database');
const userService = require('./userService');

class TransferService {
  async createTransfer(fromUserId, transferData) {
    const { toAccount, amount, description } = transferData;

    // ✅ VALIDATION: Amount must be positive (for GraphQL and REST)
    if (amount <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    // ✅ VALIDATION: Amount must be a valid number
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Valor deve ser um número válido');
    }
    
    // Business rule: Sender user exists?
    const fromUser = findUserById(fromUserId);
    if (!fromUser) {
      throw new Error('Usuário remetente não encontrado');
    }

    // Business rule: Target account exists?
    const toUser = findUserByAccount(toAccount);
    if (!toUser) {
      throw new Error('Conta de destino não encontrada');
    }

    // Business rule: Can't transfer to self
    if (fromUser.account === toAccount) {
      throw new Error('Não é possível transferir para si mesmo');
    }

    // Business rule: Sufficient balance?
    if (fromUser.balance < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Business rule: High amount restriction for non-favorites
    const isToUserFavorite = isFavorite(fromUserId, toAccount);
    if (amount > 5000 && !isToUserFavorite) {
      throw new Error('Transferências acima de R$ 5.000,00 só podem ser realizadas para usuários favorecidos');
    }

    // ✅ BUSINESS LOGIC: Execute transfer
    userService.updateUserBalance(fromUserId, -amount);
    userService.updateUserBalance(toUser.id, amount);

    // Criar registro da transferência
    const transfer = new Transfer(
      database.nextTransferId++,
      fromUser.account,
      toAccount,
      amount,
      description || 'Transferência',
      isToUserFavorite
    );

    return addTransfer(transfer);
  }

  getTransfersByUserId(userId) {
    return getTransfersByUserId(userId);
  }

  addFavorite(userId, favoritedAccount) {
    // ✅ BUSINESS LOGIC VALIDATION ONLY (Format validation handled by Joi)
    
    // Business rule: Target account exists?
    const favoritedUser = findUserByAccount(favoritedAccount);
    if (!favoritedUser) {
      throw new Error('Conta não encontrada');
    }

    // Business rule: Can't favorite yourself
    const user = findUserById(userId);
    if (user.account === favoritedAccount) {
      throw new Error('Não é possível favoritar a si mesmo');
    }

    // Business rule: Already favorited?
    if (isFavorite(userId, favoritedAccount)) {
      throw new Error('Usuário já está nos favoritos');
    }

    const favorite = new Favorite(
      database.nextFavoriteId++,
      userId,
      favoritedUser.id,
      favoritedAccount
    );

    return addFavorite(favorite);
  }

  getFavoritesByUserId(userId) {
    const favorites = getFavoritesByUserId(userId);
    return favorites.map(fav => {
      const favoritedUser = findUserById(fav.favoritedUserId);
      return {
        id: fav.id,
        account: fav.account,
        name: favoritedUser?.name,
        createdAt: fav.createdAt
      };
    });
  }

  removeFavorite(userId, favoriteId) {
    const favoriteIndex = database.favorites.findIndex(
      fav => fav.id === parseInt(favoriteId) && fav.userId === parseInt(userId)
    );

    if (favoriteIndex === -1) {
      throw new Error('Favorito não encontrado');
    }

    database.favorites.splice(favoriteIndex, 1);
    return { message: 'Favorito removido com sucesso' };
  }
}

module.exports = new TransferService();
