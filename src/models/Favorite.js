class Favorite {
  constructor(id, userId, favoritedUserId, account) {
    this.id = id;
    this.userId = userId;
    this.favoritedUserId = favoritedUserId;
    this.account = account;
    this.createdAt = new Date();
  }
}

module.exports = Favorite;
