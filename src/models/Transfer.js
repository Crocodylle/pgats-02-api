class Transfer {
  constructor(id, fromAccount, toAccount, amount, description, isFavorite = false) {
    this.id = id;
    this.fromAccount = fromAccount;
    this.toAccount = toAccount;
    this.amount = amount;
    this.description = description;
    this.isFavorite = isFavorite;
    this.status = 'completed';
    this.createdAt = new Date();
  }
}

module.exports = Transfer;
