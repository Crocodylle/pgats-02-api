const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const http = require('http');
const cors = require('cors');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const authService = require('../services/authService');

// Create Express app for GraphQL
const createGraphQLApp = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_ERROR',
        path: error.path,
      };
    },
  });

  // Start the server
  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors({
      origin: true,
      credentials: true,
    }),
    express.json({ limit: '50mb' }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract and verify JWT token from Authorization header
        let user = null;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
          try {
            user = authService.verifyToken(token);
          } catch (error) {
            console.warn('Invalid token provided:', error.message);
            // Don't throw error here, let resolvers handle authentication
          }
        }

        return { user };
      },
    })
  );

  // Health check endpoint
  app.get('/graphql/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      service: 'GraphQL API',
      timestamp: new Date().toISOString(),
    });
  });

  // GraphQL Playground info endpoint
  app.get('/graphql/info', (req, res) => {
    res.json({
      message: 'PGATS-02 GraphQL API',
      version: '1.0.0',
      graphqlEndpoint: '/graphql',
      playground: process.env.NODE_ENV !== 'production' ? '/graphql' : null,
      documentation: {
        queries: [
          'me - Get current user profile',
          'users - List all users',
          'userBalance - Get current user balance',
          'transfers - Get user transfers',
          'favorites - Get user favorites'
        ],
        mutations: [
          'login - User authentication',
          'register - User registration',
          'createTransfer - Create new transfer',
          'addFavorite - Add favorite user',
          'removeFavorite - Remove favorite user'
        ]
      }
    });
  });

  return { app, httpServer, server };
};

module.exports = createGraphQLApp;
