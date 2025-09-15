# 🚀 Como Funcionam as Requisições na Nossa API

*Uma explicação visual e simples para entender o caminho que suas requisições percorrem!*

---

## 🎯 O Que Vamos Aprender?

Imagine que você é um **detetive** 🕵️ seguindo o rastro de uma requisição desde quando ela sai do seu computador até voltar com a resposta! Vamos descobrir por onde ela passa e o que acontece em cada parada.

---

## 🏗️ Arquitetura Geral do Projeto

```
🌐 INTERNET
    │
    ▼
📱 CLIENTE (Postman, Browser, App)
    │
    ▼
🚪 SERVIDOR (server.js)
    │
    ├─── 🌐 REST API (porta 3000)
    │    │
    │    └─── 📋 app.js
    │
    └─── ⚡ GraphQL API (porta 4000)
         │
         └─── 🔧 appWithGraphQL.js
```

---

## 🌐 Fluxo de Requisição REST API

### 📊 Diagrama Visual

```
👤 USUÁRIO
   │ "Quero fazer login!"
   ▼
🌐 HTTP REQUEST
   │ POST /auth/login
   ▼
🚪 SERVER.JS (Porta 3000)
   │ "Nova requisição chegou!"
   ▼
📋 APP.JS (Aplicação Principal)
   │ Middlewares globais ✅
   │ • CORS ✅
   │ • JSON Parser ✅
   │ • Logger ✅
   ▼
🛣️ ROUTES (src/routes/authRoutes.js)
   │ "Ah! É para /auth/login"
   ▼
🎯 CONTROLLER (src/controllers/authController.js)
   │ "Vou processar esse login!"
   ▼
🔧 SERVICE (src/services/authService.js)
   │ "Vou verificar email e senha"
   │ "Importando Model User..."
   ▼
💾 DATABASE (src/database/index.js)
   │ "Procurando usuário..."
   │ "Retornando instância do Model User"
   ▼
🏗️ MODEL (src/models/User.js)
   │ "Sou a instância encontrada!"
   │ "Tenho métodos como toJSON()"
   ▼
🔧 SERVICE (Resposta)
   │ "Usuário válido! Gerando JWT..."
   │ "Usando user.toJSON() do Model!"
   ▼
🎯 CONTROLLER (Resposta)
   │ "Formatando resposta JSON..."
   ▼
📋 APP.JS (Resposta)
   │ "Enviando resposta..."
   ▼
🌐 HTTP RESPONSE
   │ { "token": "jwt...", "user": {...} }
   ▼
👤 USUÁRIO
   │ "Login realizado com sucesso! 🎉"
```

### 🔍 Exemplo Prático - Login REST

**1. Requisição chega:**
```javascript
// 📥 ENTRADA (Postman/Browser)
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**2. server.js recebe:**
```javascript
// 🚪 server.js - Porta 3000
const restApp = createRestAppWithGraphQLInfo();
const server = restApp.listen(3000, () => {
  console.log('Servidor REST rodando!');
});
```

**3. app.js processa:**
```javascript
// 📋 app.js - Middlewares
app.use(cors());              // ✅ Permite requisições
app.use(express.json());      // ✅ Lê o JSON do body
app.use('/auth', authRoutes); // 🛣️ Direciona para rota
```

**4. Route decide o destino:**
```javascript
// 🛣️ src/routes/authRoutes.js
router.post('/login', authController.login);
//           ↑        ↑
//       endpoint   função do controller
```

**5. Controller processa:**
```javascript
// 🎯 src/controllers/authController.js
async login(req, res) {
  try {
    const { email, password } = req.body; // 📨 Pega dados
    const result = await authService.login(email, password); // 🔧 Chama service
    res.json({ success: true, data: result }); // 📤 Responde
  } catch (error) {
    res.status(401).json({ error: error.message }); // ❌ Erro
  }
}
```

**6. Service coordena:**
```javascript
// 🔧 src/services/authService.js
async login(email, password) {
  // Service importa Model User no topo do arquivo
  const user = findUserByEmail(email);     // 💾 Busca no banco (retorna instância do Model)
  const isValid = await bcrypt.compare(password, user.password); // 🔐 Verifica senha
  const token = jwt.sign({ userId: user.id }, JWT_SECRET); // 🎫 Gera token
  return { token, user: user.toJSON() };   // 🏗️ Usa método do Model
}
```

**7. Database responde:**
```javascript
// 💾 src/database/index.js
const findUserByEmail = (email) => {
  return database.users.find(user => user.email === email);
  //     ↑                          ↑
  //   procura                   encontra (instância do Model User)
};
```

**8. Model processa:**
```javascript
// 🏗️ src/models/User.js
class User {
  constructor(id, name, email, password, account, balance) {
    this.id = id;           // 🆔 ID único
    this.name = name;       // 👤 Nome
    this.email = email;     // 📧 Email
    this.password = password; // 🔐 Senha (hash)
    this.account = account; // 🏦 Conta bancária
    this.balance = balance; // 💰 Saldo
  }

  toJSON() {
    // 🛡️ Remove senha antes de enviar para o usuário
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword; // 📦 Dados seguros para resposta
  }
}
```

**9. Resposta volta:**
```javascript
// 📤 SAÍDA (para o usuário)
HTTP 200 OK
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "account": "123456",
      "balance": 1000.00
    }
  }
}
```

---

## ⚡ Fluxo de Requisição GraphQL

### 📊 Diagrama Visual

```
👤 USUÁRIO
   │ "query { me { name balance } }"
   ▼
🌐 HTTP REQUEST
   │ POST http://localhost:4000/
   ▼
🚪 SERVER.JS (Porta 4000)
   │ "GraphQL chegou!"
   ▼
🔧 APPWITHGRAPHQL.JS
   │ Apollo Server iniciado ⚡
   ▼
📝 TYPEDEFS (src/graphql/typeDefs.js)
   │ "Validando query estrutura..."
   │ ✅ Query 'me' existe
   │ ✅ Campos 'name', 'balance' existem
   ▼
🎯 RESOLVERS (src/graphql/resolvers.js)
   │ "Executando resolver 'me'"
   │ 🔐 Verificando autenticação...
   ▼
🔧 SERVICE (src/services/userService.js)
   │ "Buscando dados do usuário..."
   ▼
💾 DATABASE (src/database/index.js)
   │ "Encontrando usuário por ID..."
   ▼
🏗️ MODEL (src/models/User.js)
   │ "Sou a instância do usuário!"
   │ "Tenho todos os dados organizados"
   ▼
🔧 SERVICE (Resposta)
   │ "Usuário encontrado!"
   │ "Retornando instância do Model"
   ▼
🎯 RESOLVERS (Resposta)
   │ "Formatando campos solicitados..."
   ▼
⚡ APOLLO SERVER (Resposta)
   │ "Montando resposta GraphQL..."
   ▼
🌐 HTTP RESPONSE
   │ { "data": { "me": { "name": "...", "balance": ... } } }
   ▼
👤 USUÁRIO
   │ "Dados recebidos! 🎉"
```

### 🔍 Exemplo Prático - Query GraphQL

**1. Requisição chega:**
```graphql
# 📥 ENTRADA (GraphQL Playground)
POST http://localhost:4000/
Content-Type: application/json

{
  "query": "query { me { name balance } }",
  "variables": {}
}

# Headers:
# Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. server.js inicia GraphQL:**
```javascript
// 🚪 server.js - Cria servidor GraphQL
const { url: graphqlUrl } = await createGraphQLServer();
console.log(`GraphQL rodando em: ${graphqlUrl}`);
```

**3. Apollo Server processa:**
```javascript
// ⚡ appWithGraphQL.js - Apollo Server
const server = new ApolloServer({
  typeDefs,     // 📝 Schema/estrutura
  resolvers,    // 🎯 Lógica de negócio
  context: async ({ req }) => {
    // 🔐 Extrair e verificar JWT
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = authService.verifyToken(token);
    return { user }; // 📦 Contexto para resolvers
  }
});
```

**4. TypeDefs valida estrutura:**
```javascript
// 📝 src/graphql/typeDefs.js
const typeDefs = `
  type Query {
    me: User    # ✅ Query 'me' definida
  }
  
  type User {
    name: String!     # ✅ Campo 'name' existe
    balance: Float!   # ✅ Campo 'balance' existe
  }
`;
```

**5. Resolver executa lógica:**
```javascript
// 🎯 src/graphql/resolvers.js
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // 🔐 Verificar autenticação
      if (!context.user) {
        throw new Error('Você deve estar autenticado!');
      }
      
      // 🔧 Chamar service
      return userService.getUserById(context.user.userId);
      //     ↑                      ↑
      //   chama service         passa ID do token
    }
  }
};
```

**6. Service busca dados:**
```javascript
// 🔧 src/services/userService.js
getUserById(id) {
  const user = findUserById(id);  // 💾 Busca no banco
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  return user; // 🏗️ Retorna instância do Model User
}
```

**7. Database responde:**
```javascript
// 💾 src/database/index.js
const findUserById = (id) => {
  return database.users.find(user => user.id === parseInt(id));
  //     ↑                          ↑
  //   procura                   encontra instância do Model User
};
```

**8. Model está disponível:**
```javascript
// 🏗️ src/models/User.js - A instância retornada
{
  id: 1,
  name: "João Silva",
  email: "joao@email.com", 
  account: "123456",
  balance: 1000.00,
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-01T10:00:00Z",
  // password está presente, mas será filtrada pelo GraphQL
  
  // Métodos disponíveis:
  toJSON() { /* remove senha */ },
  updateBalance(amount) { /* atualiza saldo */ }
}
```

**9. GraphQL monta resposta:**
```javascript
// ⚡ Apollo Server - Seleciona apenas campos solicitados
// Usuário pediu: { name, balance }
// Banco retornou: { id, name, email, account, balance, createdAt, ... }
// GraphQL filtra: { name: "João Silva", balance: 1000.00 }
```

**10. Resposta final:**
```json
// 📤 SAÍDA (para o usuário)
HTTP 200 OK
{
  "data": {
    "me": {
      "name": "João Silva",
      "balance": 1000.00
    }
  }
}
```

---

## 🏗️ Entendendo a Arquitetura: Service, Model e Database

### 🤔 Pergunta Comum: "Qual a ordem: Service→DB→Model ou Service→Model→DB?"

**Resposta:** Depende da operação! Nosso projeto usa ambos os fluxos:

#### 📝 **Cenário 1: CRIANDO dados (Register)**
```
🔧 SERVICE → 🏗️ MODEL → 💾 DATABASE
```
```javascript
// Service cria instância do Model
const user = new User(id, name, email, password, account, balance);
// Service passa Model para Database
return addUser(user); // Database recebe e armazena a instância
```

#### 🔍 **Cenário 2: BUSCANDO dados (Login)**
```
🔧 SERVICE → 💾 DATABASE → 🏗️ MODEL (instância)
```
```javascript
// Service pede para Database buscar
const user = findUserByEmail(email); // Database retorna instância do Model
// Service usa métodos do Model
return { token, user: user.toJSON() }; // Chama método do Model
```

### 🎯 **Por que essa arquitetura?**

1. **Service é o "coordenador"** 🎯
   - Importa Models
   - Chama Database
   - Aplica regras de negócio

2. **Model é o "molde"** 🏗️
   - Define estrutura dos dados
   - Possui métodos úteis (toJSON, updateBalance)
   - Encapsula comportamentos

3. **Database é o "armazém"** 💾
   - Guarda instâncias dos Models
   - Funções de busca/armazenamento
   - Não conhece regras de negócio

### 📋 **Exemplo Prático:**

```javascript
// 🔧 SERVICE
const User = require('../models/User'); // Importa Model
const { addUser, findUserByEmail } = require('../database'); // Importa funções DB

class UserService {
  // 📝 CRIAR: Service → Model → Database
  async createUser(userData) {
    const user = new User(...userData); // Cria instância do Model
    return addUser(user); // Database recebe instância
  }
  
  // 🔍 BUSCAR: Service → Database → Model (retornado)
  getUserByEmail(email) {
    return findUserByEmail(email); // Database retorna instância do Model
  }
}
```

---

## 🔄 Comparando REST vs GraphQL

### 🌐 REST - "Telefone com Menu Fixo"
```
👤 → 🏪 "Olá, quero um sanduíche completo!"
🏪 → 👤 "Aqui está: pão, carne, queijo, alface, tomate, cebola, maionese"
👤 → 🤔 "Eu só queria pão e carne... mas ok, vou jogar o resto fora"
```

**Características:**
- ✅ Simples de entender
- ✅ Cacheable 
- ❌ Pode trazer dados desnecessários
- ❌ Precisa de múltiplas requisições para dados relacionados

### ⚡ GraphQL - "Telefone Inteligente"
```
👤 → 🏪 "Quero só pão e carne do sanduíche"
🏪 → 👤 "Perfeito! Aqui está: pão, carne"
👤 → 😊 "Exatamente o que eu queria!"
```

**Características:**
- ✅ Busca apenas dados necessários
- ✅ Uma requisição para dados relacionados
- ✅ Tipagem forte
- ❌ Mais complexo de cachear
- ❌ Curva de aprendizado maior

---

## 🎯 Exemplo Prático Comparativo

### Cenário: "Quero nome do usuário e suas últimas 3 transferências"

#### 🌐 REST (Múltiplas Requisições)

```bash
# 1ª Requisição - Buscar perfil
GET /users/profile
# Resposta: TODOS os dados do usuário (email, account, balance, etc.)

# 2ª Requisição - Buscar transferências  
GET /transfers?limit=3
# Resposta: TODAS as informações das transferências
```

**Problemas:**
- 🔴 2 requisições HTTP
- 🔴 Dados desnecessários transferidos
- 🔴 Mais lento (latência de rede)

#### ⚡ GraphQL (Uma Requisição)

```graphql
# Uma única requisição
query {
  me {
    name          # Só o nome
  }
  transfers {     # Só as transferências
    amount        # Só valor
    description   # Só descrição  
    createdAt     # Só data
  }
}
```

**Vantagens:**
- 🟢 1 requisição HTTP
- 🟢 Apenas dados necessários
- 🟢 Mais rápido
- 🟢 Menos consumo de dados

---

## 📁 Estrutura de Arquivos Explicada

```
📁 pgats-02-api/
│
├── 🚪 server.js                 # "Porteiro" - Inicia tudo
│   ├── 🌐 REST (porta 3000)
│   └── ⚡ GraphQL (porta 4000)
│
├── 📋 app.js                    # REST puro (para testes)
├── 🔧 appWithGraphQL.js         # Configuração GraphQL
│
├── 📁 src/
│   ├── 📁 routes/               # 🛣️ "Placas de trânsito"
│   │   ├── authRoutes.js        # Rotas de autenticação
│   │   ├── userRoutes.js        # Rotas de usuário
│   │   └── transferRoutes.js    # Rotas de transferência
│   │
│   ├── 📁 controllers/          # 🎯 "Gerentes" - Coordenam
│   │   ├── authController.js    # Gerencia autenticação
│   │   ├── userController.js    # Gerencia usuários
│   │   └── transferController.js # Gerencia transferências
│   │
│   ├── 📁 services/             # 🔧 "Especialistas" - Fazem o trabalho
│   │   ├── authService.js       # Lógica de autenticação
│   │   ├── userService.js       # Lógica de usuários
│   │   └── transferService.js   # Lógica de transferências
│   │
│   ├── 📁 models/               # 🏗️ "Moldes dos dados" - Como os dados se comportam
│   │   ├── User.js              # 👤 Molde do usuário (toJSON, updateBalance)
│   │   ├── Transfer.js          # 💸 Molde da transferência
│   │   └── Favorite.js          # ⭐ Molde do favorito
│   │
│   ├── 📁 graphql/              # ⚡ "Departamento GraphQL"
│   │   ├── typeDefs.js          # 📝 "Manual de instruções"
│   │   ├── resolvers.js         # 🎯 "Executores"
│   │   └── graphqlApp.js        # 🔧 "Configuração"
│   │
│   └── 📁 database/             # 💾 "Arquivo" - Guarda tudo
│       └── index.js             # Banco de dados em memória
```

---

## 🎮 Exercícios Práticos

### 🎯 Exercício 1: Seguir o Fluxo REST
1. Abra o Postman
2. Faça uma requisição: `POST /users/register`
3. **Desafio:** Identifique em qual arquivo cada etapa acontece!

**Gabarito:**
```
📥 Postman → 🚪 server.js → 📋 app.js → 🛣️ userRoutes.js → 
🎯 userController.js → 🔧 userService.js → 💾 database/index.js → 🏗️ User.js (Model)
```

### 🎯 Exercício 2: Seguir o Fluxo GraphQL  
1. Abra http://localhost:4000/
2. Execute: `query { users { name email } }`
3. **Desafio:** Trace o caminho da requisição!

**Gabarito:**
```
🌐 Browser → 🚪 server.js → ⚡ appWithGraphQL.js → 📝 typeDefs.js → 
🎯 resolvers.js → 🔧 userService.js → 💾 database/index.js → 🏗️ User.js (Model)
```

### 🎯 Exercício 3: Comparação de Performance
Execute estas duas operações e compare:

**REST:**
```bash
GET /users/profile
GET /transfers?limit=5
```

**GraphQL:**
```graphql
query {
  me { name balance }
  transfers { amount description }
}
```

**Questão:** Qual é mais eficiente e por quê?

---

## 🏆 Parabéns!

Agora você entende como funciona o **cérebro** da nossa API! 🧠

**Você aprendeu:**
- 🌐 Como REST e GraphQL processam requisições
- 🛣️ O caminho que os dados percorrem
- 🔧 Como os services fazem o trabalho pesado
- 💾 Como o banco de dados armazena tudo
- ⚡ Por que GraphQL pode ser mais eficiente

**Próximos passos:**
1. 🧪 Experimente fazer suas próprias requisições
2. 🔍 Abra os arquivos e veja o código real
3. 🚀 Crie novos endpoints ou queries
4. 🎯 Implemente testes automatizados

---

## 📚 Glossário para Crianças

- **🚪 Server**: Como o porteiro de um prédio - decide quem entra
- **🛣️ Routes**: Como placas de trânsito - mostram o caminho
- **🎯 Controller**: Como um gerente - coordena tudo
- **🔧 Service**: Como um especialista - faz o trabalho difícil  
- **🏗️ Model**: Como um molde de biscoito - define o formato dos dados e como eles se comportam
- **💾 Database**: Como um arquivo gigante - guarda tudo
- **📝 TypeDefs**: Como um manual de instruções do GraphQL
- **🎯 Resolvers**: Como executores que fazem acontecer
- **🔐 JWT**: Como um crachá de identificação
- **⚡ Apollo**: Como um super-herói que cuida do GraphQL

**Lembre-se:** Programação é como construir com LEGO! 🧱 Cada peça tem sua função, e juntas elas criam algo incrível! 🏗️✨
