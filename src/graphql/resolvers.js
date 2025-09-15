const authService = require('../services/authService');
const userService = require('../services/userService');
const transferService = require('../services/transferService');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// Custom Date scalar type
const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Helper function to get user from context
const getAuthenticatedUser = (context) => {
  if (!context.user) {
    throw new Error('Você deve estar autenticado para realizar esta operação');
  }
  return context.user;
};

const resolvers = {
  Date: DateType,

  Query: {
    // User queries
    me: async (parent, args, context) => {
      const user = getAuthenticatedUser(context);
      return userService.getUserById(user.userId);
    },

    users: async (parent, args, context) => {
      getAuthenticatedUser(context); // Verify authentication
      return userService.getAllUsers();
    },

    userBalance: async (parent, args, context) => {
      const user = getAuthenticatedUser(context);
      return userService.getUserBalance(user.userId);
    },

    // Transfer queries
    transfers: async (parent, args, context) => {
      const user = getAuthenticatedUser(context);
      return transferService.getTransfersByUserId(user.userId);
    },

    // Favorite queries
    favorites: async (parent, args, context) => {
      const user = getAuthenticatedUser(context);
      return transferService.getFavoritesByUserId(user.userId);
    },
  },

  Mutation: {
    // Authentication mutations
    login: async (parent, { input }) => {
      try {
        const { email, password } = input;
        const result = await authService.login(email, password);
        return result;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // User mutations
    register: async (parent, { input }) => {
      try {
        const { name, email, password } = input;
        const user = await userService.createUser({ name, email, password });
        
        // Auto-login after registration
        const loginResult = await authService.login(email, password);
        return loginResult;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Transfer mutations
    createTransfer: async (parent, { input }, context) => {
      try {
        const user = getAuthenticatedUser(context);
        const { toAccount, amount, description } = input;
        
        const transfer = await transferService.createTransfer(user.userId, {
          toAccount,
          amount,
          description
        });
        
        return transfer;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Favorite mutations
    addFavorite: async (parent, { input }, context) => {
      try {
        const user = getAuthenticatedUser(context);
        const { account } = input;
        
        const favorite = await transferService.addFavorite(user.userId, account);
        
        // Return in the expected format for GraphQL
        return {
          id: favorite.id,
          account: favorite.account,
          name: favorite.name || null,
          createdAt: favorite.createdAt
        };
      } catch (error) {
        throw new Error(error.message);
      }
    },

    removeFavorite: async (parent, { id }, context) => {
      try {
        const user = getAuthenticatedUser(context);
        await transferService.removeFavorite(user.userId, id);
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  // Field resolvers for custom formatting
  User: {
    id: (parent) => parent.id.toString(),
    balance: (parent) => parseFloat(parent.balance),
    createdAt: (parent) => parent.createdAt,
    updatedAt: (parent) => parent.updatedAt,
  },

  Transfer: {
    id: (parent) => parent.id.toString(),
    amount: (parent) => parseFloat(parent.amount),
    createdAt: (parent) => parent.createdAt,
  },

  Favorite: {
    id: (parent) => parent.id.toString(),
    createdAt: (parent) => parent.createdAt,
  },
};

module.exports = resolvers;
