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

- **Node.js + Express** - API REST
- **Apollo Server + GraphQL** - API GraphQL  
- **JWT + bcryptjs** - Autenticação segura
- **Mocha + Chai + Supertest** - Testes automatizados
- **Swagger** - Documentação interativa

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
- **`npm start`** - Inicia ambos os servidores (REST:3000 + GraphQL:4000)
- **`npm run dev`** - Desenvolvimento com hot reload

### 🧪 Scripts de Teste
- **`npm test`** - Executa todos os testes
- **`npm run test-controller`** - Testes de controllers
- **`npm run test-external`** - Testes end-to-end (precisa do servidor rodando)
- **`npm run test-externalRest`** - Apenas testes REST externos
- **`npm run test-externalGraphql`** - Apenas testes GraphQL externos

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