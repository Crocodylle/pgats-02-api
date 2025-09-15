# PGATS-02 API

API REST e GraphQL desenvolvida em Node.js com Express e Apollo Server para aprendizado de testes e automação a nível de API. Simula um sistema básico de transferências bancárias com autenticação JWT e regras de negócio específicas.

## 🌟 Novidade: GraphQL API

Esta API agora oferece suporte completo ao GraphQL além da API REST tradicional. Você pode usar ambas as interfaces para acessar os mesmos dados e funcionalidades.

## 📋 Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Geração de token JWT
- ✅ Middleware de autenticação

### Usuários
- ✅ Registro de novos usuários
- ✅ Consulta de usuários
- ✅ Perfil do usuário logado
- ✅ Consulta de saldo
- ✅ Prevenção de usuários duplicados

### Transferências
- ✅ Transferência entre contas
- ✅ Histórico de transferências
- ✅ Validação de saldo
- ✅ Regras específicas para valores altos

### Favoritos
- ✅ Adicionar contas favoritas
- ✅ Listar favoritos
- ✅ Remover favoritos
- ✅ Transferências privilegiadas para favoritos

## 🔐 Regras de Negócio

### Login
- Email e senha são obrigatórios para realizar login
- Credenciais inválidas retornam erro 401

### Registro
- Não é possível registrar usuários com emails duplicados
- Todos os usuários iniciam com saldo de R$ 1.000,00
- Conta bancária é gerada automaticamente (6 dígitos)

### Transferências
- Transferências para destinatários **não favorecidos** são limitadas a **R$ 5.000,00**
- Transferências para destinatários **favorecidos** não têm limite de valor
- Validação de saldo insuficiente
- Não é possível transferir para si mesmo

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
- **app.js** - Aplicação Express REST sem o método `listen()`, ideal para importação em testes
- **appWithGraphQL.js** - Configuração GraphQL + REST, exporta apps separados para testes
- **server.js** - Servidor principal que inicia ambas as APIs
- **test/** - Pasta dedicada para todos os arquivos de teste
  - **test/controller/** - Testes específicos dos controllers
  - **test/example.test.js** - Exemplos de testes da API completa
- **.mocharc.json** - Configuração centralizada do framework de testes

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

## 📁 Estrutura do Projeto

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
│   ├── controller/
│   │   └── transferController.test.js # Testes do controller de transferências
│   ├── external/
│   │   └── transferExternal.test.js # Testes externos (servidor real)
│   ├── fixtures/
│   │   └── response/            # Exemplos de respostas da API
│   ├── helpers/
│   │   ├── authHelper.js        # Helper para autenticação em testes
│   │   ├── dataHelper.js        # Helper para criação de dados de teste
│   │   ├── requestHelper.js     # Helper para requisições com Supertest
│   │   └── externalApiHelper.js # Helper para requisições com Axios
│   └── example.test.js          # Exemplos de testes da API
├── .mocharc.json               # Configuração do Mocha
├── app.js                       # Configuração da aplicação Express (REST) - para testes
├── server.js                    # Servidor principal (REST + GraphQL)
├── appWithGraphQL.js            # 🆕 Configuração integrada GraphQL + REST
├── examples.http               # Exemplos de requisições HTTP
├── examples.graphql             # 🆕 Exemplos de queries GraphQL
├── package.json                # Dependências e scripts
└── README.md                   # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** (versão 14 ou superior) - Recomendado: v18+ para melhor compatibilidade
- **npm** (v6+) ou **yarn** (v1.22+)

### Versões das Dependências Principais
- **Express**: ^4.18.2 - Framework web estável e maduro
- **Apollo Server**: ^5.0.0 - Servidor GraphQL moderno
- **GraphQL**: ^16.11.0 - Implementação padrão da linguagem
- **Mocha**: ^11.7.1 - Framework de testes atualizado
- **Chai**: ^6.0.1 - Biblioteca de assertions moderna
- **JWT**: ^9.0.2 - Implementação segura de tokens
- **Swagger**: ^6.2.8 - Documentação OpenAPI 3.0

### Instalação

1. **Clone o repositório ou navegue até a pasta:**
   ```bash
   cd pgats-02-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   # Inicia ambas as APIs (REST + GraphQL)
   npm start                  # Produção
   npm run dev               # Desenvolvimento
   ```

4. **Acesse as aplicações:**

   **API REST (porta 3000):**
   - API: http://localhost:3000
   - Documentação Swagger: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health
   
   **API GraphQL (porta 4000):**
   - GraphQL Endpoint: http://localhost:4000/
   - GraphQL Playground: http://localhost:4000/ (acesse no navegador)
   - GraphQL Info: http://localhost:3000/graphql/info

## 📚 Documentação das APIs

### API REST
A documentação completa da API REST está disponível via Swagger UI em:
**http://localhost:3000/api-docs**

### API GraphQL
A API GraphQL oferece uma interface moderna para consultas e mutações:

**Endpoints GraphQL:**
- **Servidor GraphQL**: http://localhost:4000/
- **Playground**: http://localhost:4000/ (acesse diretamente no navegador)
- **Informações**: http://localhost:3000/graphql/info

**GraphQL Playground:** Acesse o endpoint GraphQL diretamente no navegador para usar o playground interativo.

#### Queries Disponíveis
```graphql
# Perfil do usuário autenticado
query {
  me {
    id
    name
    email
    account
    balance
  }
}

# Listar todos os usuários
query {
  users {
    id
    name
    email
    account
  }
}

# Saldo do usuário
query {
  userBalance {
    balance
  }
}

# Transferências do usuário
query {
  transfers {
    id
    fromAccount
    toAccount
    amount
    description
    status
    createdAt
  }
}

# Favoritos do usuário
query {
  favorites {
    id
    account
    name
    createdAt
  }
}
```

#### Mutations Disponíveis
```graphql
# Login
mutation {
  login(input: {
    email: "usuario@email.com"
    password: "senha123"
  }) {
    token
    user {
      id
      name
      email
    }
  }
}

# Registro
mutation {
  register(input: {
    name: "Novo Usuário"
    email: "novo@email.com"
    password: "senha123"
  }) {
    token
    user {
      id
      name
      email
    }
  }
}

# Criar transferência
mutation {
  createTransfer(input: {
    toAccount: "123456"
    amount: 100.50
    description: "Pagamento"
  }) {
    id
    fromAccount
    toAccount
    amount
    description
    status
  }
}

# Adicionar favorito
mutation {
  addFavorite(input: {
    account: "123456"
  }) {
    id
    account
    name
  }
}

# Remover favorito
mutation {
  removeFavorite(id: "1")
}
```

#### Autenticação GraphQL
Para usar queries e mutations que requerem autenticação, inclua o token JWT no header:
```
Authorization: Bearer SEU_TOKEN_JWT
```

### Endpoints REST Principais

#### Autenticação
- `POST /auth/login` - Realizar login

#### Usuários
- `POST /users/register` - Registrar usuário
- `GET /users` - Listar usuários (autenticado)
- `GET /users/profile` - Perfil do usuário (autenticado)
- `GET /users/balance` - Saldo do usuário (autenticado)

#### Transferências
- `POST /transfers` - Realizar transferência (autenticado)
- `GET /transfers` - Listar transferências (autenticado)

#### Favoritos
- `POST /transfers/favorites` - Adicionar favorito (autenticado)
- `GET /transfers/favorites` - Listar favoritos (autenticado)
- `DELETE /transfers/favorites/:id` - Remover favorito (autenticado)

## 🧪 Exemplos de Uso

### API REST

#### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

#### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

#### 3. Realizar Transferência
```bash
curl -X POST http://localhost:3000/transfers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "toAccount": "123456",
    "amount": 100.50,
    "description": "Pagamento"
  }'
```

#### 4. Adicionar Favorito
```bash
curl -X POST http://localhost:3000/transfers/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "account": "123456"
  }'
```

### API GraphQL

#### 1. Registrar Usuário
```graphql
# Acesse http://localhost:4000/ no navegador e execute:
mutation {
  register(input: {
    name: "João Silva"
    email: "joao@email.com"
    password: "senha123"
  }) {
    token
    user {
      id
      name
      email
      account
      balance
    }
  }
}
```

#### 2. Fazer Login
```graphql
mutation {
  login(input: {
    email: "joao@email.com"
    password: "senha123"
  }) {
    token
    user {
      name
      account
      balance
    }
  }
}
```

#### 3. Consultar Perfil (requer autenticação)
```graphql
# No header HTTP Headers: {"Authorization": "Bearer SEU_TOKEN_JWT"}
query {
  me {
    id
    name
    email
    account
    balance
  }
}
```

#### 4. Realizar Transferência (requer autenticação)
```graphql
mutation {
  createTransfer(input: {
    toAccount: "123456"
    amount: 100.50
    description: "Pagamento GraphQL"
  }) {
    id
    fromAccount
    toAccount
    amount
    description
    status
    isFavorite
  }
}
```

#### 5. Adicionar Favorito (requer autenticação)
```graphql
mutation {
  addFavorite(input: {
    account: "123456"
  }) {
    id
    account
    name
  }
}
```

#### 6. Consultar Dados Combinados (requer autenticação)
```graphql
query {
  me {
    name
    balance
  }
  transfers {
    amount
    description
    status
    createdAt
  }
  favorites {
    account
    name
  }
}
```

## 🔑 Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. Para acessar endpoints protegidos:

1. Faça login para obter o token
2. Inclua o token no header `Authorization`:
   ```
   Authorization: Bearer SEU_TOKEN_JWT
   ```

## 💾 Banco de Dados

A aplicação utiliza um banco de dados **em memória** (variáveis JavaScript) para simplicidade nos testes. Os dados são perdidos quando a aplicação é reiniciada.

### Dados Iniciais
- Usuários começam com saldo de R$ 1.000,00
- Contas são geradas automaticamente com 6 dígitos
- Não há dados pré-carregados

## 🧪 Testando as APIs

O projeto foi estruturado para facilitar testes tanto da API REST quanto GraphQL com Chai, Mocha e Supertest:

### Estrutura de Testes Organizada
```
test/
├── controller/              # Testes de controllers específicos
│   └── transferController.test.js
├── external/                # Testes end-to-end (servidor real)
│   └── transferExternal.test.js
├── fixtures/                # Dados e respostas de exemplo
│   └── response/
├── helpers/                 # Utilitários reutilizáveis para testes
│   ├── authHelper.js        # Autenticação e tokens
│   ├── dataHelper.js        # Criação de dados de teste
│   ├── requestHelper.js     # Requisições com Supertest
│   └── externalApiHelper.js # Requisições com Axios
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
// Teste da API GraphQL (precisa do servidor rodando)
const axios = require('axios');
const { expect } = require('chai');

describe('Auth GraphQL', () => {
  it('should login successfully', async () => {
    const query = `
      mutation {
        login(input: {
          email: "test@email.com"
          password: "password123"
        }) {
          token
          user {
            name
            email
          }
        }
      }
    `;
    
    const response = await axios.post('http://localhost:4000/', { 
      query 
    });
    
    expect(response.data.data.login).to.have.property('token');
    expect(response.data.data.login.user).to.have.property('name');
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

## 📝 Scripts Disponíveis

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "mocha test/**/*.test.js",
  "test-controller": "mocha test/controller/*.test.js",
  "test-external": "mocha test/external/*.test.js"
}
```

### 🚀 Scripts Principais
- **`npm start`** - Inicia ambos os servidores (REST na porta 3000 + GraphQL na porta 4000)
- **`npm run dev`** - Desenvolvimento com hot reload para ambas as APIs
- **`npm test`** - Executa todos os testes
- **`npm run test-controller`** - Testes específicos dos controllers  
- **`npm run test-external`** - Testes end-to-end contra servidor real

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
npm run test-external       # Testes contra servidor real
```
- **Pré-requisito**: API rodando em `http://localhost:3000`
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

## 🔧 Configuração

### Variáveis de Ambiente (opcionais)
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### CORS
A API está configurada para aceitar requisições de qualquer origem em modo de desenvolvimento.

## 📊 Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `409` - Conflito (duplicação)
- `500` - Erro interno do servidor



## 👥 Contribuição

Este projeto foi desenvolvido para fins educacionais. Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Adicionar novos recursos
- Melhorar a documentação

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido para o curso PGATS-02 - Aprendizado de Testes e Automação de APIs com REST e GraphQL** 🚀

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
