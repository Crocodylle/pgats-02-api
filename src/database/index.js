// Banco de dados em memória
const database = {
  users: [],
  transfers: [],
  favorites: [],
  nextUserId: 1,
  nextTransferId: 1,
  nextFavoriteId: 1
};

// Helper functions
const generateAccount = () => {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

const findUserByEmail = (email) => {
  return database.users.find(user => user.email === email);
};

const findUserById = (id) => {
  return database.users.find(user => user.id === parseInt(id));
};

const findUserByAccount = (account) => {
  return database.users.find(user => user.account === account);
};

const addUser = (user) => {
  database.users.push(user);
  return user;
};

const addTransfer = (transfer) => {
  database.transfers.push(transfer);
  return transfer;
};

const addFavorite = (favorite) => {
  database.favorites.push(favorite);
  return favorite;
};

const isFavorite = (userId, toAccount) => {
  return database.favorites.some(fav => 
    fav.userId === parseInt(userId) && fav.account === toAccount
  );
};

const getAllUsers = () => {
  return database.users.map(user => user.toJSON());
};

const getTransfersByUserId = (userId) => {
  return database.transfers.filter(transfer => 
    transfer.fromAccount === findUserById(userId)?.account || 
    transfer.toAccount === findUserById(userId)?.account
  );
};

const getFavoritesByUserId = (userId) => {
  return database.favorites.filter(fav => fav.userId === parseInt(userId));
};

module.exports = {
  database,
  generateAccount,
  findUserByEmail,
  findUserById,
  findUserByAccount,
  addUser,
  addTransfer,
  addFavorite,
  isFavorite,
  getAllUsers,
  getTransfersByUserId,
  getFavoritesByUserId
};
