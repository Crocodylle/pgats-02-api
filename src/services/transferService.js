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

    // Validar dados obrigatórios
    if (!toAccount || !amount) {
      throw new Error('Conta de destino e valor são obrigatórios');
    }

    // Validar valor
    if (amount <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    // Buscar usuário remetente
    const fromUser = findUserById(fromUserId);
    if (!fromUser) {
      throw new Error('Usuário remetente não encontrado');
    }

    // Buscar usuário destinatário
    const toUser = findUserByAccount(toAccount);
    if (!toUser) {
      throw new Error('Conta de destino não encontrada');
    }

    // Verificar se não é transferência para si mesmo
    if (fromUser.account === toAccount) {
      throw new Error('Não é possível transferir para si mesmo');
    }

    // Verificar saldo suficiente
    if (fromUser.balance < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Verificar regra de favorecido para valores acima de R$ 5.000,00
    const isToUserFavorite = isFavorite(fromUserId, toAccount);
    if (amount > 5000 && !isToUserFavorite) {
      throw new Error('Transferências acima de R$ 5.000,00 só podem ser realizadas para usuários favorecidos');
    }

    // Realizar transferência
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
    // Validar se conta existe
    const favoritedUser = findUserByAccount(favoritedAccount);
    if (!favoritedUser) {
      throw new Error('Conta não encontrada');
    }

    // Verificar se não está tentando favoritar a si mesmo
    const user = findUserById(userId);
    if (user.account === favoritedAccount) {
      throw new Error('Não é possível favoritar a si mesmo');
    }

    // Verificar se já não está favoritado
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
