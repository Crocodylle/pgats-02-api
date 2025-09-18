# 📖 Documentação Técnica - PGATS-02 API

> **Para informações básicas e início rápido, consulte o [README.md](./README.md)**

Esta documentação contém detalhes técnicos aprofundados sobre a arquitetura, tecnologias e estrutura de testes da API.

## 🛠️ Tecnologias e Frameworks Utilizados

### Runtime e Framework Principal
- **Node.js** - Runtime JavaScript para execução do código no servidor
- **Express.js** - Framework web minimalista e flexível para Node.js, usado para criar APIs REST de forma rápida e eficiente
- **Apollo Server** - Servidor GraphQL de alto desempenho para Node.js, oferecendo uma interface moderna e flexível para consultas de dados
- **GraphQL** - Linguagem de consulta para APIs que permite buscar exatamente os dados necessários

### Segurança e Autenticação
- **bcryptjs** - Biblioteca para hash de senhas, garantindo que as senhas sejam armazenadas de forma segura através de criptografia
- **jsonwebtoken (JWT)** - Implementação de JSON Web Tokens para autenticação stateless, permitindo autenticação segura entre cliente e servidor
- **cors** - Middleware para habilitação de Cross-Origin Resource Sharing, permitindo que a API seja acessada por diferentes domínios

### Validação e Documentação
- **joi** - Biblioteca para validação de dados de entrada, garantindo que apenas dados válidos sejam processados pela API
- **swagger-jsdoc** - Gerador de documentação OpenAPI/Swagger a partir de comentários JSDoc no código
- **swagger-ui-express** - Interface web interativa para visualização e teste da documentação da API

### Framework de Testes
- **mocha** - Framework de testes JavaScript flexível e rico em recursos, usado para estruturar e executar os testes
- **chai** - Biblioteca de assertions BDD/TDD para Node.js, fornece uma interface expressiva para escrever testes
- **sinon** - Biblioteca para criação de spies, stubs e mocks, permitindo testes isolados e simulação de comportamentos
- **supertest** - Biblioteca específica para testes de APIs HTTP, facilitando testes de integração em aplicações Express
- **axios** - Cliente HTTP para fazer requisições para APIs externas, usado em testes end-to-end contra servidores reais

### Utilitários de Desenvolvimento
- **nodemon** - Utilitário que monitora mudanças no código e reinicia automaticamente o servidor durante o desenvolvimento

## 🏗️ Arquitetura e Padrões

### Padrão MVC (Model-View-Controller)
O projeto segue uma arquitetura em camadas inspirada no padrão MVC:

- **Models** (`src/models/`) - Definem a estrutura dos dados (User, Transfer, Favorite)
- **Controllers** (`src/controllers/`) - Gerenciam as requisições HTTP e coordenam as respostas
- **Services** (`src/services/`) - Contêm a lógica de negócio e regras da aplicação
- **Routes** (`src/routes/`) - Definem os endpoints e fazem a ligação com os controllers

### Separação de Responsabilidades
- **Database** (`src/database/`) - Camada de persistência em memória
- **Middlewares** (`src/middlewares/`) - Funções intermediárias para autenticação e validação
- **Config** (`src/config/`) - Configurações da aplicação (Swagger, etc.)

### Arquitetura para Testes
A arquitetura foi projetada para suportar múltiplas estratégias de teste (unitário, integração, end-to-end) tanto para REST quanto GraphQL:

#### **Arquivos de Configuração**
- **app.js** - Aplicação Express REST pura sem `listen()`, ideal para importação em testes unitários
- **appWithGraphQL.js** - Configuração combinada GraphQL + REST, exporta funções para criar servidores separados
- **server.js** - Servidor principal que orquestra ambas as APIs (REST:3000 + GraphQL:4000)
- **.mocharc.json** - Configuração centralizada do Mocha (timeout, reporter, etc.)

#### **Estrutura de Testes Hierárquica**
```
test/
├── controller/              # 🎯 Testes unitários/integração (Supertest)
│   ├── rest/                # Controllers REST (importa app.js diretamente)
│   │   ├── transferController.test.js ✅
│   │   └── userController.test.js ✅
│   └── graphql/             # Controllers GraphQL (usa helper especializado)
│       ├── transferControllerGraphql.test.js
│       └── userControllerGraphql.test.js
├── external/                # 🌐 Testes end-to-end (Axios + servidor real)
│   ├── rest/                # Testes REST externos
│   │   ├── transferExternal.test.js ✅
│   │   └── userExternal.test.js
│   └── graphql/             # Testes GraphQL externos
│       └── transfersExternalGraphql.test.js ✅
├── fixtures/                # 📄 Dados de teste e respostas esperadas
│   └── response/
│       └── TransferenciaComSucesso.json ✅
├── helpers/                 # 🛠️ Utilitários especializados por tipo
│   ├── authHelper.js ✅         # Geração de tokens JWT para testes
│   ├── dataHelper.js ✅         # Criação de usuários e dados de teste
│   ├── requestHelper.js ✅      # Requisições REST com Supertest
│   ├── externalApiHelper.js ✅  # Requisições REST com Axios
│   └── graphqlApiHelper.js ✅   # Requisições GraphQL com Axios
└── example.test.js ✅           # Exemplos gerais da API REST
```

#### **Estratégias de Teste por Tipo**

**🔹 Testes Unitários/Integração (test/controller/)**
- **Método**: Importa `app.js` diretamente via Supertest
- **Vantagem**: Rápido, sem overhead de rede
- **Uso**: Validação de lógica de controllers e middlewares
- **Exemplo**: `request(app).post('/auth/login').send(data)`

**🔹 Testes End-to-End REST (test/external/rest/)**
- **Método**: Requisições HTTP reais via Axios para `localhost:3000`
- **Pré-requisito**: `npm start` rodando
- **Vantagem**: Testa servidor completo + comportamento real
- **Uso**: Validação de fluxos completos e performance

**🔹 Testes End-to-End GraphQL (test/external/graphql/)**
- **Método**: Requisições HTTP reais via Axios para `localhost:4000`
- **Pré-requisito**: `npm start` rodando (ambos servidores)
- **Vantagem**: Testa resolvers GraphQL + autenticação real
- **Uso**: Validação de queries/mutations complexas

#### **Helpers Especializados**

**🔹 REST Helpers**
- `requestHelper.js`: Métodos para Supertest (testes rápidos)
- `externalApiHelper.js`: Métodos para Axios REST (testes externos)

**🔹 GraphQL Helper**
- `graphqlApiHelper.js`: Queries/mutations centralizadas + autenticação GraphQL

**🔹 Utilitários Comuns**
- `authHelper.js`: Geração de tokens JWT válidos/inválidos/expirados
- `dataHelper.js`: Criação de usuários de teste com diferentes cenários

#### **Configuração Centralizada**
- **Timeout configurável**: Para testes externos mais lentos
- **Reporter mochawesome**: Relatórios HTML + JSON
- **Padrão recursive**: Busca testes em subpastas automaticamente
- **Estrutura espelhada**: Organização de testes segue estrutura do `src/`

## 💡 Benefícios da Stack Escolhida

### Produtividade
- **Express.js**: Framework minimalista que acelera o desenvolvimento de APIs
- **Swagger**: Documentação automática e interface de testes integrada
- **Nodemon**: Desenvolvimento mais ágil com reload automático

### Segurança
- **bcryptjs**: Hash seguro de senhas com salt automático
- **JWT**: Autenticação stateless e escalável
- **Joi**: Validação robusta de entrada de dados

### Testabilidade
- **Mocha + Chai**: Sintaxe expressiva e flexível para testes
- **Supertest**: Testes de integração diretamente no app Express (sem servidor)
- **Axios**: Testes end-to-end contra servidor real em execução
- **Sinon**: Mocking avançado para testes isolados
- **Separação app/server**: Facilita importação em testes
- **Organização por camadas**: Testes espelham a estrutura do código
- **Configuração centralizada**: .mocharc.json para setup consistente

### Manutenibilidade
- **Arquitetura em camadas**: Código organizado e fácil de manter
- **Separação de responsabilidades**: Cada módulo tem uma função específica
- **Validação centralizada**: Middlewares reutilizáveis

## ⚡ Considerações de Performance

### Otimizações Implementadas
- **Middleware de validação**: Rejeita dados inválidos antes do processamento
- **JWT stateless**: Elimina consultas de sessão no banco
- **Estrutura modular**: Carregamento apenas do necessário
- **Hash assíncrono**: bcryptjs não bloqueia o event loop

### Limitações do Banco em Memória
- 📊 **Adequado para**: Desenvolvimento, testes, prototipagem
- ⚠️ **Limitações**: Dados perdidos no restart, não escalável
- 🚀 **Próximos passos**: MongoDB, PostgreSQL ou Redis para produção

### Escalabilidade
- **Horizontal**: Stateless JWT permite múltiplas instâncias
- **Vertical**: Express.js lida bem com aumento de recursos
- **Monitoramento**: Endpoint `/health` para health checks

## 📁 Estrutura Detalhada do Projeto

```
pgats-02-api/
├── src/
│   ├── config/
│   │   └── swagger.js           # Configuração do Swagger
│   ├── controllers/
│   │   ├── authController.js    # Controller de autenticação
│   │   ├── userController.js    # Controller de usuários
│   │   └── transferController.js # Controller de transferências
│   ├── database/
│   │   └── index.js             # Banco de dados em memória
│   ├── graphql/                 # 🆕 Configuração GraphQL
│   │   ├── typeDefs.js          # Definições de tipos GraphQL
│   │   ├── resolvers.js         # Resolvers GraphQL
│   │   └── graphqlApp.js        # App GraphQL para testes
│   ├── middlewares/
│   │   ├── auth.js              # Middleware de autenticação
│   │   └── validation.js        # Middleware de validação
│   ├── models/
│   │   ├── User.js              # Modelo de usuário
│   │   ├── Transfer.js          # Modelo de transferência
│   │   └── Favorite.js          # Modelo de favorito
│   ├── routes/
│   │   ├── authRoutes.js        # Rotas de autenticação
│   │   ├── userRoutes.js        # Rotas de usuários
│   │   └── transferRoutes.js    # Rotas de transferências
│   └── services/
│       ├── authService.js       # Serviço de autenticação
│       ├── userService.js       # Serviço de usuários
│       └── transferService.js   # Serviço de transferências
├── test/
│   ├── controller/              # 🆕 Organizado por REST e GraphQL
│   │   ├── rest/
│   │   │   ├── transferController.test.js # Testes REST dos controllers
│   │   │   └── userController.test.js     # Testes REST dos controllers
│   │   └── graphql/
│   │       ├── transferControllerGraphql.test.js # Testes GraphQL dos controllers
│   │       └── userControllerGraphql.test.js     # Testes GraphQL dos controllers
│   ├── external/                # 🆕 Testes externos organizados
│   │   ├── rest/
│   │   │   ├── transferExternal.test.js # Testes REST externos (servidor real)
│   │   │   └── userExternal.test.js     # Testes REST externos
│   │   └── graphql/
│   │       └── transfersExternalGraphql.test.js # 🆕 Testes GraphQL externos
│   ├── fixtures/
│   │   └── response/            # Exemplos de respostas da API
│   ├── helpers/                 # 🆕 Helpers especializados
│   │   ├── authHelper.js        # Helper para autenticação em testes
│   │   ├── dataHelper.js        # Helper para criação de dados de teste
│   │   ├── requestHelper.js     # Helper para requisições REST com Supertest
│   │   ├── externalApiHelper.js # Helper para requisições REST com Axios
│   │   └── graphqlApiHelper.js  # 🆕 Helper para requisições GraphQL com Axios
│   └── example.test.js          # Exemplos de testes da API
├── .mocharc.json               # Configuração do Mocha
├── app.js                       # Configuração da aplicação Express (REST) - para testes
├── server.js                    # Servidor principal (REST + GraphQL)
├── appWithGraphQL.js            # 🆕 Configuração integrada GraphQL + REST
├── examples.http               # Exemplos de requisições HTTP
├── examples.graphql             # 🆕 Exemplos de queries GraphQL
├── README.md                   # Documentação principal
├── DOCUMENTACAO-TECNICA.md     # 🆕 Esta documentação técnica detalhada
├── FLUXO-REQUISICOES.md        # 🎓 Guia didático do fluxo de requisições
├── package.json                # Dependências e scripts
```

## 🧪 Estratégias de Teste Avançadas

### Estrutura de Testes Organizada
```
test/
├── controller/              # Testes de controllers organizados por tipo
│   ├── rest/                # Testes dos controllers REST
│   │   ├── transferController.test.js
│   │   └── userController.test.js
│   └── graphql/             # Testes dos controllers GraphQL
│       ├── transferControllerGraphql.test.js
│       └── userControllerGraphql.test.js
├── external/                # Testes end-to-end (servidor real)
│   ├── rest/                # Testes externos REST
│   │   ├── transferExternal.test.js
│   │   └── userExternal.test.js
│   └── graphql/             # 🆕 Testes externos GraphQL
│       └── transfersExternalGraphql.test.js
├── fixtures/                # Dados e respostas de exemplo
│   └── response/
├── helpers/                 # 🆕 Utilitários especializados para testes
│   ├── authHelper.js        # Autenticação e tokens
│   ├── dataHelper.js        # Criação de dados de teste
│   ├── requestHelper.js     # Requisições REST com Supertest
│   ├── externalApiHelper.js # Requisições REST com Axios
│   └── graphqlApiHelper.js  # 🆕 Requisições GraphQL com Axios
├── service/                 # Testes de serviços (expansível)
├── middleware/              # Testes de middlewares (expansível)
├── integration/             # Testes de integração (expansível)
└── example.test.js          # Exemplos gerais da API
```

### Exemplo de Teste REST
```javascript
// Teste da API REST
const request = require('supertest');
const { expect } = require('chai');
const app = require('./app'); // Importa apenas o app REST, sem o listen()

describe('Auth REST', () => {
  it('should login successfully', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@email.com',
        password: 'password123'
      });
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('data');
    expect(response.body.data).to.have.property('token');
  });
});
```

### Exemplo de Teste GraphQL
```javascript
// Teste da API GraphQL usando o novo helper
const { expect } = require('chai');
const {
    registerAndLoginGraphQL,
    getUserBalance,
    checkGraphQLHealth
} = require('../helpers/graphqlApiHelper');

describe('Auth GraphQL', () => {
  let authToken;

  before(async function() {
    // Verificar se API está rodando
    const isRunning = await checkGraphQLHealth();
    if (!isRunning) {
      throw new Error('GraphQL API não está rodando');
    }

    // Criar usuário e fazer login
    const { token } = await registerAndLoginGraphQL();
    authToken = token;
  });

  it('should get user balance successfully', async () => {
    const response = await getUserBalance(authToken);
    
    expect(response.status).to.equal(200);
    expect(response.data).to.not.have.property('errors');
    expect(response.data.data.userBalance.balance).to.equal(1000);
  });
});
```

### Expansão da Estrutura de Testes
Para expandir os testes, organize por camadas seguindo a estrutura do `src/`:
- **test/controller/** - Testes unitários dos controllers
- **test/service/** - Testes unitários dos serviços
- **test/middleware/** - Testes dos middlewares
- **test/integration/** - Testes de fluxo completo
- **test/util/** - Utilitários e helpers para testes

## 📝 Scripts de Teste Detalhados

### 🧪 Scripts de Teste Organizados
- **`npm test`** - Executa todos os testes (REST + GraphQL)
- **`npm run test-controller`** - Todos os testes de controllers (REST + GraphQL)
- **`npm run test-controllerRest`** - Apenas testes de controllers REST
- **`npm run test-controllerGraphql`** - Apenas testes de controllers GraphQL
- **`npm run test-external`** - Todos os testes externos (REST + GraphQL)
- **`npm run test-externalRest`** - Apenas testes externos REST
- **`npm run test-externalGraphql`** - Apenas testes externos GraphQL

### Tipos de Testes

#### Testes Unitários/Integração (Supertest)
```bash
npm test                    # Executa todos os testes
npm run test-controller     # Apenas testes de controllers
```
- **Método**: Importa o `app.js` diretamente
- **Velocidade**: Rápido (sem inicialização de servidor)
- **Uso**: Testes unitários e de integração

#### Testes End-to-End (Axios)
```bash
npm run test-external          # Todos os testes externos (REST + GraphQL)
npm run test-externalRest      # Apenas testes externos REST
npm run test-externalGraphql   # Apenas testes externos GraphQL
```
- **Pré-requisito**: 
  - REST: API rodando em `http://localhost:3000`
  - GraphQL: API rodando em `http://localhost:4000`
  - Use `npm start` para iniciar ambos os servidores
- **Método**: Requisições HTTP reais via Axios
- **Velocidade**: Mais lento (rede + servidor)
- **Uso**: Testes end-to-end, cenários reais

#### Por que Axios foi Necessário?

**Supertest** vs **Axios** - Diferentes propósitos:

- **Supertest**: 
  - Testa diretamente a aplicação Express **sem iniciar servidor**
  - Importa o `app.js` e simula requisições HTTP internamente
  - Ideal para testes unitários e de integração rápidos

- **Axios**: 
  - Faz requisições HTTP **para um servidor real em execução**
  - Necessário para testes externos/end-to-end
  - Simula exatamente como um cliente real usaria a API

**Alternativas ao Axios**: `fetch`, `node-fetch`, `http` nativo
**Por que Axios**: Sintaxe limpa, Promises nativas, melhor tratamento de erros

### GraphQL Test Helper

O projeto agora inclui um helper especializado para testes GraphQL (`graphqlApiHelper.js`):

#### Funcionalidades do Helper GraphQL
```javascript
const {
    // Autenticação
    registerAndLoginGraphQL,
    loginUserGraphQL,
    
    // Consultas
    getUserProfile,
    getUserBalance,
    getAllUsers,
    getUserTransfers,
    getUserFavorites,
    
    // Mutações
    createTransferGraphQL,
    addFavoriteGraphQL,
    removeFavoriteGraphQL,
    
    // Utilitários
    checkGraphQLHealth,
    executeGraphQL
} = require('./helpers/graphqlApiHelper');
```

#### Exemplo de Uso
```javascript
describe('GraphQL Transfer Tests', () => {
    let authToken;

    before(async () => {
        // Configuração automática: registra usuário e faz login
        const { token } = await registerAndLoginGraphQL();
        authToken = token;
    });

    it('should create transfer via GraphQL', async () => {
        const transferData = {
            toAccount: '123456',
            amount: 100.50,
            description: 'Test transfer'
        };
        
        const response = await createTransferGraphQL(transferData, authToken);
        
        expect(response.status).to.equal(200);
        expect(response.data.data.createTransfer).to.have.property('id');
    });
});
```

#### Benefícios
- **Reutilização**: Queries e mutations centralizadas
- **Manutenibilidade**: Um lugar para atualizar sintaxe GraphQL
- **Simplicidade**: Métodos intuitivos para operações comuns
- **Consistência**: Mesmo padrão usado no helper REST

## 💾 Banco de Dados

A aplicação utiliza um banco de dados **em memória** (variáveis JavaScript) para simplicidade nos testes. Os dados são perdidos quando a aplicação é reiniciada.

### Dados Iniciais
- Usuários começam com saldo de R$ 1.000,00
- Contas são geradas automaticamente com 6 dígitos
- Não há dados pré-carregados

## 📊 Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `409` - Conflito (duplicação)
- `500` - Erro interno do servidor

## 🔧 Configuração Avançada

### Variáveis de Ambiente (opcionais)
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### CORS
A API está configurada para aceitar requisições de qualquer origem em modo de desenvolvimento.

## 🔗 Links Úteis

### Documentação Oficial
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/) - Documentação oficial do Apollo Server
- [GraphQL](https://graphql.org/learn/) - Tutorial oficial do GraphQL
- [Express.js](https://expressjs.com/) - Documentação do Express

### Ferramentas de Teste
- [Apollo Studio](https://studio.apollographql.com/) - IDE online para GraphQL
- [GraphQL Playground](https://github.com/graphql/graphql-playground) - IDE GraphQL
- [Postman](https://www.postman.com/) - Cliente REST
- [Insomnia](https://insomnia.rest/) - Cliente REST e GraphQL

### Aprendizado
- [How to GraphQL](https://www.howtographql.com/) - Tutorial completo de GraphQL
- [Apollo Server Tutorial](https://www.apollographql.com/docs/tutorial/introduction/) - Tutorial oficial
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/) - Melhores práticas

---

**🎯 Objetivo Alcançado:** API completa com REST e GraphQL, usando os mesmos services e lógica de negócio, pronta para testes automatizados!
