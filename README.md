# PGATS-02 API

REST and GraphQL API for learning testing and automation. Simulates a banking transfer system with JWT authentication.

> 📖 **For detailed technical information:** [TECHNICAL-DOCUMENTATION.md](./TECHNICAL-DOCUMENTATION.md)  
> 🎓 **To understand the request flow:** [REQUEST-FLOW.md](./REQUEST-FLOW.md)

## 📋 Features

### Authentication
- ✅ Login with email and password
- ✅ JWT token generation
- ✅ Authentication middleware

### Users
- ✅ New user registration
- ✅ User queries
- ✅ Logged user profile
- ✅ Balance inquiry
- ✅ Duplicate user prevention

### Transfers
- ✅ Account-to-account transfers
- ✅ Transfer history
- ✅ Balance validation
- ✅ Specific rules for high amounts

### Favorites
- ✅ Add favorite accounts
- ✅ List favorites
- ✅ Remove favorites
- ✅ Privileged transfers to favorites

## 🔐 Business Rules

- **Authentication**: Email and password required
- **Initial balance**: $1,000.00 for new users
- **Transfers**: Limited to $5,000.00 for non-favorites
- **Favorites**: Unlimited transfers to favorite users

## 🛠️ Technologies

### Core
- **Node.js** (v14+) - JavaScript runtime
- **Express** (v4.18.2) - Web framework for REST API
- **Apollo Server** (v5.0.0) - GraphQL server
- **GraphQL** (v16.11.0) - Query language

### Security & Authentication
- **bcryptjs** (v2.4.3) - Password hashing
- **jsonwebtoken** (v9.0.2) - JWT for authentication
- **joi** (v17.11.0) - Data validation
- **cors** (v2.8.5) - Cross-Origin Resource Sharing

### Testing & Quality
- **Mocha** (v11.7.1) - Testing framework
- **Chai** (v6.0.1) - Assertion library
- **Supertest** (v6.3.4) - HTTP testing for Express
- **Axios** (v1.11.0) - HTTP client for external tests
- **Sinon** (v21.0.0) - Mocks, spies and stubs
- **Mochawesome** (v7.1.3) - HTML test reports

### Documentation & Development
- **Swagger** (swagger-jsdoc + swagger-ui-express) - API documentation
- **Nodemon** (v3.0.2) - Hot reload in development

## 🚀 How to Run

### Prerequisites
- **Node.js** (version 14+)
- **npm** (v6+)

### Installation

1. **Clone the repository:**
   ```bash
   cd pgats-02-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start                  # Production
   npm run dev               # Development
   ```

4. **Access the applications:**

   **REST API (port 3000):**
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health
   
   **GraphQL API (port 4000):**
   - GraphQL Endpoint: http://localhost:4000/
   - GraphQL Playground: http://localhost:4000/ (access in browser)

## 📚 API Documentation

### REST API
Complete documentation via Swagger UI: **http://localhost:3000/api-docs**

### GraphQL API
Interactive interface: **http://localhost:4000/**

#### Main REST Endpoints

**Authentication**
- `POST /auth/login` - Perform login

**Users**
- `POST /users/register` - Register user
- `GET /users` - List users (authenticated)
- `GET /users/profile` - User profile (authenticated)
- `GET /users/balance` - User balance (authenticated)

**Transfers**
- `POST /transfers` - Perform transfer (authenticated)
- `GET /transfers` - List transfers (authenticated)

**Favorites**
- `POST /transfers/favorites` - Add favorite (authenticated)
- `GET /transfers/favorites` - List favorites (authenticated)
- `DELETE /transfers/favorites/:id` - Remove favorite (authenticated)

## 🧪 Usage Examples

### REST - Register User
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Silva",
    "email": "john@email.com",
    "password": "password123"
  }'
```

### REST - Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@email.com",
    "password": "password123"
  }'
```

### GraphQL - Register User
```graphql
# Access http://localhost:4000/ in browser and execute:
mutation {
  register(input: {
    name: "John Silva"
    email: "john@email.com"
    password: "password123"
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

### GraphQL - Query Profile (requires authentication)
```graphql
# Headers: {"Authorization": "Bearer YOUR_JWT_TOKEN"}
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

## 🔑 Authentication

The API uses JWT (JSON Web Token). For protected endpoints:

1. Login to get the token
2. Include the token in header: `Authorization: Bearer YOUR_JWT_TOKEN`

## 📝 Available Scripts

### 🚀 Main Scripts
```bash
npm start                     # Start servers (REST:3000 + GraphQL:4000)
npm run dev                   # Development with hot reload
```

### 🧪 Test Scripts

#### All Tests
```bash
npm test                      # Run all tests (REST + GraphQL)
```

#### Tests by Category
```bash
npm run test-controller       # All controller tests
npm run test-external         # All external tests (requires server running)
```

#### Specific Tests by Type
```bash
# Controllers (Fast tests with Supertest)
npm run test-controllerRest      # REST controllers only
npm run test-controllerGraphql   # GraphQL controllers only

# External (End-to-end tests with Axios)
npm run test-externalRest        # REST external only
npm run test-externalGraphql     # GraphQL external only
```

### 📊 Test Reports
All tests generate HTML reports via Mochawesome:
- **File**: `mochawesome-report/mochawesome.html`
- **Location**: Project root folder
- **Content**: Detailed results, execution time, statistics

## 🧪 Testing Strategies

### Unit/Integration Tests (Supertest)
- **REST Controllers**: Imports `app.js` directly
- **Speed**: Fast (no HTTP server)
- **Usage**: Business logic validation

### End-to-End Tests (Axios)
- **REST**: Real HTTP requests to `localhost:3000`
- **GraphQL**: Real HTTP requests to `localhost:4000`
- **Prerequisite**: `npm start` must be running
- **Usage**: Real behavior validation

### Specialized Helpers
- **`authHelper.js`**: JWT tokens for tests
- **`dataHelper.js`**: Test data creation
- **`requestHelper.js`**: REST requests with Supertest
- **`externalApiHelper.js`**: REST requests with Axios
- **`graphqlApiHelper.js`**: GraphQL requests with Axios

## 💾 Database

The application uses **in-memory** database for simplicity:
- Users start with $1,000.00 balance
- Accounts are automatically generated (6 digits)
- Data is lost when application restarts

## 🔧 Configuration

### Environment Variables (optional)
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Folder Structure
```
pgats-02-api/
├── src/                     # Source code
│   ├── controllers/         # REST controllers
│   ├── graphql/            # GraphQL configuration
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   ├── routes/             # REST routes
│   └── middlewares/        # Middlewares
├── test/                   # Organized tests
│   ├── controller/         # Controller tests
│   │   ├── rest/           # REST controllers
│   │   └── graphql/        # GraphQL controllers
│   ├── external/           # End-to-end tests
│   │   ├── rest/           # REST external
│   │   └── graphql/        # GraphQL external
│   ├── helpers/            # Test utilities
│   └── fixtures/           # Test data
├── examples.http           # REST request examples
├── examples.graphql        # GraphQL query examples
└── mochawesome-report/     # Test reports
```

## 📊 Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Invalid data
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict (duplication)
- `500` - Internal server error

## 🔗 Example Files

### REST (examples.http)
Ready-to-use examples with REST Client:
- Register users
- Login
- Perform transfers
- Manage favorites

### GraphQL (examples.graphql)
Ready-to-use queries and mutations:
- Authentication
- Data queries
- Complex operations

## 👥 Contributing

This project was developed for educational purposes. Feel free to:
- Report bugs
- Suggest improvements
- Add new features
- Improve documentation

## 📄 License

MIT License - see the LICENSE file for details.

---

**Developed for PGATS-02 course - Learning API Testing and Automation with REST and GraphQL** 🚀