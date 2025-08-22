const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PGATS-02 API',
      version: '1.0.0',
      description: 'API REST para aprendizado de testes e automação - Sistema de transferências bancárias',
      contact: {
        name: 'API Support',
        email: 'support@pgats.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@email.com'
            },
            account: {
              type: 'string',
              example: '123456'
            },
            balance: {
              type: 'number',
              example: 1000.00
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Transfer: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            fromAccount: {
              type: 'string',
              example: '123456'
            },
            toAccount: {
              type: 'string',
              example: '654321'
            },
            amount: {
              type: 'number',
              example: 100.50
            },
            description: {
              type: 'string',
              example: 'Transferência PIX'
            },
            isFavorite: {
              type: 'boolean',
              example: false
            },
            status: {
              type: 'string',
              example: 'completed'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Favorite: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            account: {
              type: 'string',
              example: '654321'
            },
            name: {
              type: 'string',
              example: 'Maria Santos'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Mensagem de erro'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints relacionados à autenticação'
      },
      {
        name: 'Usuários',
        description: 'Endpoints relacionados aos usuários'
      },
      {
        name: 'Transferências',
        description: 'Endpoints relacionados às transferências'
      },
      {
        name: 'Favoritos',
        description: 'Endpoints relacionados aos favoritos'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Caminho para os arquivos com anotações Swagger
};

const specs = swaggerJSDoc(options);

module.exports = specs;
