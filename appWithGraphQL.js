const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// Importar configuração REST existente do app.js original
const restApp = require('./app');

// Importar configuração GraphQL
const typeDefs = require('./src/graphql/typeDefs');
const resolvers = require('./src/graphql/resolvers');
const authService = require('./src/services/authService');

// Função para criar o servidor GraphQL standalone
const createGraphQLServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_ERROR',
        path: error.path,
      };
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      // Extrair e verificar token JWT do header Authorization
      let user = null;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        try {
          user = authService.verifyToken(token);
        } catch (error) {
          console.warn('Token inválido fornecido:', error.message);
          // Não lançar erro aqui, deixar os resolvers lidarem com autenticação
        }
      }

      return { user };
    },
  });

  return { server, url };
};

// Função para criar app REST com informações do GraphQL
const createRestAppWithGraphQLInfo = () => {
  const app = express();
  
  // Aplicar todos os middlewares e rotas do app original
  app.use(restApp);
  
  // Sobrescrever a rota raiz para incluir informações do GraphQL
  app.get('/', (req, res) => {
    res.json({
      message: 'PGATS-02 API - Sistema de Transferências (REST + GraphQL)',
      version: '1.0.0',
      apis: {
        rest: {
          port: process.env.PORT || 3000,
          documentation: '/api-docs',
          endpoints: {
            auth: '/auth',
            users: '/users',
            transfers: '/transfers'
          }
        },
        graphql: {
          port: 4000,
          endpoint: 'http://localhost:4000/',
          info: '/graphql/info'
        }
      }
    });
  });

  // Atualizar health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      apis: {
        rest: 'Available on port ' + (process.env.PORT || 3000),
        graphql: 'Available on port 4000'
      }
    });
  });

  // Informações do GraphQL
  app.get('/graphql/info', (req, res) => {
    res.json({
      message: 'PGATS-02 GraphQL API',
      version: '1.0.0',
      endpoint: 'http://localhost:4000/',
      note: 'GraphQL roda em servidor separado na porta 4000',
      documentation: {
        queries: [
          'me - Perfil do usuário atual',
          'users - Listar todos os usuários',  
          'userBalance - Saldo do usuário atual',
          'transfers - Transferências do usuário',
          'favorites - Favoritos do usuário'
        ],
        mutations: [
          'login - Autenticação de usuário',
          'register - Registro de usuário',
          'createTransfer - Criar nova transferência',
          'addFavorite - Adicionar usuário favorito',
          'removeFavorite - Remover usuário favorito'
        ]
      }
    });
  });

  return app;
};

module.exports = {
  createGraphQLServer,
  createRestAppWithGraphQLInfo,
  // Exportar app original para testes
  restApp
};