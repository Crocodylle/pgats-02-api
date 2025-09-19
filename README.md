# PGATS-02 API

API REST e GraphQL para aprendizado de testes e automação. Simula um sistema de transferências bancárias com autenticação JWT.

> 📖 **Para detalhes técnicos aprofundados:** [DOCUMENTACAO-TECNICA.md](./DOCUMENTACAO-TECNICA.md)  
> 🎓 **Para entender o fluxo de requisições:** [FLUXO-REQUISICOES.md](./FLUXO-REQUISICOES.md)

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

- **Autenticação**: Email e senha obrigatórios
- **Saldo inicial**: R$ 1.000,00 para novos usuários
- **Transferências**: Limitadas a R$ 5.000,00 para não favorecidos
- **Favoritos**: Transferências ilimitadas para usuários favorecidos

## 🛠️ Tecnologias

### Core
- **Node.js** (v14+) - Runtime JavaScript
- **Express** (v4.18.2) - Framework web para API REST
- **Apollo Server** (v5.0.0) - Servidor GraphQL
- **GraphQL** (v16.11.0) - Linguagem de consulta

### Segurança & Autenticação
- **bcryptjs** (v2.4.3) - Hash de senhas
- **jsonwebtoken** (v9.0.2) - JWT para autenticação
- **joi** (v17.11.0) - Validação de dados
- **cors** (v2.8.5) - Cross-Origin Resource Sharing

### Testes & Qualidade
- **Mocha** (v11.7.1) - Framework de testes
- **Chai** (v6.0.1) - Biblioteca de assertions
- **Supertest** (v6.3.4) - Testes HTTP para Express
- **Axios** (v1.11.0) - Cliente HTTP para testes externos
- **Sinon** (v21.0.0) - Mocks, spies e stubs
- **Mochawesome** (v7.1.3) - Relatórios HTML de testes

### Documentação & Desenvolvimento
- **Swagger** (swagger-jsdoc + swagger-ui-express) - Documentação API
- **Nodemon** (v3.0.2) - Hot reload em desenvolvimento

## 🚀 Como Executar

### Pré-requisitos
- **Node.js** (versão 14+)
- **npm** (v6+)

### Instalação

1. **Clone o repositório:**
   ```bash
   cd pgats-02-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
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

## 📚 Documentação das APIs

### API REST
Documentação completa via Swagger UI: **http://localhost:3000/api-docs**

### API GraphQL
Interface interativa: **http://localhost:4000/**

#### Endpoints REST Principais

**Autenticação**
- `POST /auth/login` - Realizar login

**Usuários**
- `POST /users/register` - Registrar usuário
- `GET /users` - Listar usuários (autenticado)
- `GET /users/profile` - Perfil do usuário (autenticado)
- `GET /users/balance` - Saldo do usuário (autenticado)

**Transferências**
- `POST /transfers` - Realizar transferência (autenticado)
- `GET /transfers` - Listar transferências (autenticado)

**Favoritos**
- `POST /transfers/favorites` - Adicionar favorito (autenticado)
- `GET /transfers/favorites` - Listar favoritos (autenticado)
- `DELETE /transfers/favorites/:id` - Remover favorito (autenticado)

## 🧪 Exemplos de Uso

### REST - Registrar Usuário
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### REST - Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

### GraphQL - Registrar Usuário
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

### GraphQL - Consultar Perfil (requer autenticação)
```graphql
# Headers: {"Authorization": "Bearer SEU_TOKEN_JWT"}
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

## 🔑 Autenticação

A API utiliza JWT (JSON Web Token). Para endpoints protegidos:

1. Faça login para obter o token
2. Inclua o token no header: `Authorization: Bearer SEU_TOKEN_JWT`

## 📝 Scripts Disponíveis

### 🚀 Scripts Principais
```bash
npm start                     # Inicia servidores (REST:3000 + GraphQL:4000)
npm run dev                   # Desenvolvimento com hot reload
```

### 🧪 Scripts de Teste

#### Todos os Testes
```bash
npm test                      # Executa todos os testes (REST + GraphQL)
```

#### Testes por Categoria
```bash
npm run test-controller       # Todos os testes de controllers
npm run test-external         # Todos os testes externos (precisa servidor rodando)
```

#### Testes Específicos por Tipo
```bash
# Controllers (Testes rápidos com Supertest)
npm run test-controllerRest      # Apenas controllers REST
npm run test-controllerGraphql   # Apenas controllers GraphQL

# Externos (Testes end-to-end com Axios)
npm run test-externalRest        # Apenas externos REST
npm run test-externalGraphql     # Apenas externos GraphQL
```

### 📊 Relatórios de Teste
Todos os testes geram relatórios HTML via Mochawesome:
- **Arquivo**: `mochawesome-report/mochawesome.html`
- **Localização**: Pasta raiz do projeto
- **Conteúdo**: Resultados detalhados, tempo de execução, estatísticas

## 🧪 Estratégias de Teste

### Testes Unitários/Integração (Supertest)
- **Controllers REST**: Importa `app.js` diretamente
- **Velocidade**: Rápido (sem servidor HTTP)
- **Uso**: Validação de lógica de negócio

### Testes End-to-End (Axios)
- **REST**: Requisições HTTP reais para `localhost:3000`
- **GraphQL**: Requisições HTTP reais para `localhost:4000`
- **Pré-requisito**: `npm start` deve estar rodando
- **Uso**: Validação de comportamento real

### Helpers Especializados
- **`authHelper.js`**: Tokens JWT para testes
- **`dataHelper.js`**: Criação de dados de teste
- **`requestHelper.js`**: Requisições REST com Supertest
- **`externalApiHelper.js`**: Requisições REST com Axios
- **`graphqlApiHelper.js`**: Requisições GraphQL com Axios

## 💾 Banco de Dados

A aplicação utiliza banco de dados **em memória** para simplicidade:
- Usuários começam com saldo de R$ 1.000,00
- Contas são geradas automaticamente (6 dígitos)
- Dados são perdidos quando a aplicação é reiniciada

## 🔧 Configuração

### Variáveis de Ambiente (opcionais)
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Estrutura de Pastas
```
pgats-02-api/
├── src/                     # Código fonte
│   ├── controllers/         # Controllers REST
│   ├── graphql/            # Configuração GraphQL
│   ├── services/           # Lógica de negócio
│   ├── models/             # Modelos de dados
│   ├── routes/             # Rotas REST
│   └── middlewares/        # Middlewares
├── test/                   # Testes organizados
│   ├── controller/         # Testes de controllers
│   │   ├── rest/           # Controllers REST
│   │   └── graphql/        # Controllers GraphQL
│   ├── external/           # Testes end-to-end
│   │   ├── rest/           # Externos REST
│   │   └── graphql/        # Externos GraphQL
│   ├── helpers/            # Utilitários de teste
│   └── fixtures/           # Dados de teste
├── examples.http           # Exemplos de requisições REST
├── examples.graphql        # Exemplos de queries GraphQL
└── mochawesome-report/     # Relatórios de teste
```

## 📊 Status Codes

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `409` - Conflito (duplicação)
- `500` - Erro interno do servidor

## 🔗 Arquivos de Exemplo

### REST (examples.http)
Exemplos prontos para usar com REST Client:
- Registrar usuários
- Fazer login
- Realizar transferências
- Gerenciar favoritos

### GraphQL (examples.graphql)
Queries e mutations prontas para usar:
- Autenticação
- Consultas de dados
- Operações complexas

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