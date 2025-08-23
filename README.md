# PGATS-02 API

API REST desenvolvida em Node.js com Express para aprendizado de testes e automação a nível de API. Simula um sistema básico de transferências bancárias com autenticação JWT e regras de negócio específicas.

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
- **app.js** - Aplicação Express sem o método `listen()`, ideal para importação em testes
- **server.js** - Servidor HTTP que importa o app e inicia o servidor
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
- **Supertest**: Testes de API simplificados
- **Sinon**: Mocking avançado para testes isolados
- **Separação app/server**: Facilita importação em testes
- **Organização por camadas**: Testes espelham a estrutura do código
- **Configuração centralizada**: .mocharc.json para setup consistente

### Manutenibilidade
- **Arquitetura em camadas**: Código organizado e fácil de manter
- **Separação de responsabilidades**: Cada módulo tem uma função específica
- **Validação centralizada**: Middlewares reutilizáveis

## 🎯 Por Que Esses Frameworks?

### Express.js vs Alternativas
**Escolhido por**: Simplicidade, maturidade, grande ecossistema
- ✅ Comunidade ativa e documentação extensa
- ✅ Middleware ecosystem robusto
- ✅ Performance adequada para APIs REST
- 🆚 **Fastify**: Mais rápido, mas menor ecossistema
- 🆚 **Koa**: Mais moderno, mas sintaxe mais complexa

### Mocha + Chai vs Jest
**Escolhido por**: Flexibilidade e controle fino
- ✅ Configuração mais granular
- ✅ Melhor para testes de API com Supertest
- ✅ Sintaxe BDD mais expressiva (Chai)
- ✅ Separação clara entre runner (Mocha) e assertions (Chai)
- 🆚 **Jest**: Mais opinativo, mas setup mais simples

### JWT vs Session-based Auth
**Escolhido por**: Escalabilidade e stateless
- ✅ Não requer armazenamento de sessão no servidor
- ✅ Ideal para APIs REST
- ✅ Facilita arquitetura de microserviços
- 🆚 **Sessions**: Mais seguro, mas menos escalável

### Joi vs Alternativas
**Escolhido por**: Expressividade e recursos avançados
- ✅ Validação declarativa e legível
- ✅ Mensagens de erro customizáveis
- ✅ Suporte a validações complexas
- 🆚 **Yup**: Mais leve, mas menos recursos
- 🆚 **Express-validator**: Integração direta, mas menos flexível

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
│   └── example.test.js          # Exemplos de testes da API
├── .mocharc.json               # Configuração do Mocha
├── app.js                       # Configuração da aplicação Express
├── server.js                    # Servidor HTTP
├── examples.http               # Exemplos de requisições HTTP
├── package.json                # Dependências e scripts
└── README.md                   # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** (versão 14 ou superior) - Recomendado: v18+ para melhor compatibilidade
- **npm** (v6+) ou **yarn** (v1.22+)

### Versões das Dependências Principais
- **Express**: ^4.18.2 - Framework web estável e maduro
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
   # Modo de desenvolvimento (com nodemon)
   npm run dev
   
   # Modo de produção
   npm start
   ```

4. **Acesse a aplicação:**
   - API: http://localhost:3000
   - Documentação: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger UI em:
**http://localhost:3000/api-docs**

### Endpoints Principais

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

### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### 3. Realizar Transferência
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

### 4. Adicionar Favorito
```bash
curl -X POST http://localhost:3000/transfers/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "account": "123456"
  }'
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

## 🧪 Testando com Chai/Mocha + Supertest

O projeto foi estruturado para facilitar testes com Chai, Mocha e Supertest:

### Estrutura de Testes Organizada
```
test/
├── controller/              # Testes de controllers específicos
│   └── transferController.test.js
├── service/                 # Testes de serviços (expansível)
├── middleware/              # Testes de middlewares (expansível)
├── integration/             # Testes de integração (expansível)
└── example.test.js          # Exemplos gerais da API
```

### Exemplo de Teste
```javascript
// Exemplo de teste
const request = require('supertest');
const { expect } = require('chai');
const app = require('./app'); // Importa apenas o app, sem o listen()

describe('Auth', () => {
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
  "test": "mocha"
}
```

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

## 🎯 Cenários de Teste Sugeridos

### Autenticação
- ✅ Login com credenciais válidas
- ❌ Login sem email ou senha
- ❌ Login com credenciais inválidas

### Registro
- ✅ Registro com dados válidos
- ❌ Registro com email duplicado
- ❌ Registro com dados inválidos

### Transferências
- ✅ Transferência válida para favorito
- ✅ Transferência válida para não-favorito (≤ R$ 5.000)
- ❌ Transferência para não-favorito (> R$ 5.000)
- ❌ Transferência com saldo insuficiente
- ❌ Transferência para conta inexistente
- ❌ Transferência para si mesmo

### Favoritos
- ✅ Adicionar conta válida aos favoritos
- ❌ Adicionar conta inexistente
- ❌ Adicionar conta já favoritada
- ❌ Adicionar própria conta

## 👥 Contribuição

Este projeto foi desenvolvido para fins educacionais. Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Adicionar novos recursos
- Melhorar a documentação

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido para o curso PGATS-02 - Aprendizado de Testes e Automação de APIs** 🚀
