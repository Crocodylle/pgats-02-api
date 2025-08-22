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

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **bcryptjs** - Criptografia de senhas
- **jsonwebtoken** - Autenticação JWT
- **joi** - Validação de dados
- **swagger-jsdoc** - Documentação da API
- **swagger-ui-express** - Interface do Swagger
- **cors** - Cross-Origin Resource Sharing

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
├── app.js                       # Configuração da aplicação Express
├── server.js                    # Servidor HTTP
├── package.json                 # Dependências e scripts
└── README.md                    # Documentação
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

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

## 🧪 Testando com Supertest

O projeto foi estruturado para facilitar testes com Supertest:

```javascript
// Exemplo de teste
const request = require('supertest');
const app = require('./app'); // Importa apenas o app, sem o listen()

describe('Auth', () => {
  test('should login successfully', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@email.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data.token');
  });
});
```

## 📝 Scripts Disponíveis

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
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
