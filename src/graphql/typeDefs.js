const typeDefs = `
  # Scalar types
  scalar Date

  # Authentication types
  type AuthPayload {
    token: String!
    user: User!
  }

  # User types
  type User {
    id: ID!
    name: String!
    email: String!
    account: String!
    balance: Float!
    createdAt: Date!
    updatedAt: Date!
  }

  type UserBalance {
    balance: Float!
  }

  # Transfer types
  type Transfer {
    id: ID!
    fromAccount: String!
    toAccount: String!
    amount: Float!
    description: String!
    isFavorite: Boolean!
    status: String!
    createdAt: Date!
  }

  # Favorite types
  type Favorite {
    id: ID!
    account: String!
    name: String
    createdAt: Date!
  }

  # Input types for mutations
  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input TransferInput {
    toAccount: String!
    amount: Float!
    description: String
  }

  input FavoriteInput {
    account: String!
  }

  # Queries
  type Query {
    # User queries
    me: User
    users: [User!]!
    userBalance: UserBalance
    
    # Transfer queries
    transfers: [Transfer!]!
    
    # Favorite queries
    favorites: [Favorite!]!
  }

  # Mutations
  type Mutation {
    # Authentication mutations
    login(input: LoginInput!): AuthPayload!
    
    # User mutations
    register(input: RegisterInput!): AuthPayload!
    
    # Transfer mutations
    createTransfer(input: TransferInput!): Transfer!
    
    # Favorite mutations
    addFavorite(input: FavoriteInput!): Favorite!
    removeFavorite(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
