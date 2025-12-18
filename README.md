# PGATS-02 API

REST and GraphQL API for learning testing and automation. Simulates a banking transfer system with JWT authentication.

> 📚 **[Complete Documentation](./docs/)** - All project documentation organized in the docs folder  
> 📖 **Technical Details:** [TECHNICAL-DOCUMENTATION.md](./docs/TECHNICAL-DOCUMENTATION.md)  
> 🎓 **Request Flow:** [REQUEST-FLOW.md](./docs/REQUEST-FLOW.md)  
> 🧪 **Testing Framework:** [FRAMEWORK-IMPROVEMENTS.md](./docs/FRAMEWORK-IMPROVEMENTS.md)

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
- **K6** - Performance testing tool

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

### 🚀 Performance Tests (K6)
```bash
npm run test-k6                  # Run K6 performance tests
npm run test-k6:report           # Run with JSON output for reports
npm run test-k6:generate-report  # Generate HTML report from results
```

> **Note:** Requires [K6 installed](https://k6.io/docs/get-started/installation/) and API running (`npm start`)

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

### 🆕 Enhanced Helpers with Fixtures
- **`fixtureHelper.js`**: Advanced fixture loading and processing
- **`enhancedDataHelper.js`**: Data creation using fixture templates
- **`enhancedRequestHelper.js`**: HTTP requests with fixture integration
- **`enhancedGraphQLHelper.js`**: GraphQL operations with fixtures
- **`testSuite.js`**: Complete scenario orchestration

## 💾 Database

The application uses **in-memory** database for simplicity:
- Users start with $1,000.00 balance
- Accounts are automatically generated (6 digits)
- Data is lost when application restarts

## 🔧 Configuration

### Environment Setup
1. **Copy environment template:**
   ```bash
   cp env.template .env
   ```

2. **Edit `.env` file** with your preferred values

3. **Key variables:**
   ```env
   PORT=3000
   JWT_SECRET=your-secure-secret-key
   NODE_ENV=development
   ```

📖 **Full configuration guide:** [ENVIRONMENT-SETUP.md](./docs/ENVIRONMENT-SETUP.md)

### 🔐 Security & CI/CD Setup

#### For Local Development
The application works with default values (no `.env` required) for quick learning.

#### For GitHub Actions / CI/CD
Set up secure secrets for better security:

1. **Generate a secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Add to GitHub Secrets:**
   - Go to: Repository → Settings → Secrets → Actions
   - Create: `JWT_SECRET_TEST` with your generated value

3. **Benefits:**
   - ✅ Secure secret management
   - ✅ Environment-specific configuration
   - ✅ Audit trail and access control
   - ✅ Industry best practices

🔐 **Complete security guide:** [GITHUB-SECRETS-SETUP.md](./docs/GITHUB-SECRETS-SETUP.md)  
⚡ **Quick reference:** [SECURITY-QUICK-REFERENCE.md](./docs/SECURITY-QUICK-REFERENCE.md)

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
│   │   ├── authHelper.js   # JWT operations
│   │   ├── dataHelper.js   # Data creation
│   │   ├── fixtureHelper.js # 🆕 Fixture management
│   │   ├── enhancedDataHelper.js # 🆕 Data + Fixtures
│   │   ├── enhancedRequestHelper.js # 🆕 Requests + Fixtures
│   │   ├── enhancedGraphQLHelper.js # 🆕 GraphQL + Fixtures
│   │   └── testSuite.js    # 🆕 Complete scenarios
│   ├── fixtures/           # 🆕 Test data & templates
│   │   ├── request/        # Input data templates
│   │   ├── response/       # Expected output templates
│   │   ├── graphql/        # GraphQL queries & mutations
│   │   ├── scenarios/      # Complete test scenarios
│   │   └── testSuites/     # Test suite configurations
│   └── k6/                 # 🚀 Performance tests
│       ├── config/         # K6 options, thresholds, stages
│       ├── data/           # Data-driven test scenarios
│       ├── helpers/        # Auth, generators, HTTP helpers
│       ├── tests/          # Main test files
│       └── reports/        # Generated HTML reports
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

## 🆕 Advanced Testing with Fixtures

### Fixture-Based Testing
```javascript
// Create users from fixture template
const users = await EnhancedDataHelper.createUsersFromFixture(
    'request/users/ValidUser.json',
    2
);

// Test endpoint with fixtures
const response = await EnhancedRequestHelper.requestWithFixture(
    'POST',
    '/transfers',
    'request/transfers/ValidTransfer.json',
    users[0].token,
    { toAccount: users[1].user.account }
);
```

### Complete Scenario Testing
```javascript
// Run complete test scenario
const result = await TestSuite.runCompleteScenario('TransferBetweenUsers');

// Run entire test suite
const suiteResults = await TestSuite.runAPITestSuite(
    'testSuites/ComprehensiveAPISuite.json'
);
```

### GraphQL with Fixtures
```javascript
// Execute GraphQL query from fixture
const response = await EnhancedGraphQLHelper.queryFromFixture(
    'graphql/queries/GetUserProfile.json',
    { userId: user.id },
    token
);

// Test GraphQL with expected response
const result = await EnhancedGraphQLHelper.testGraphQLWithFixtures(
    'graphql/queries/GetUserProfile.json',
    'graphql/responses/UserProfile.json',
    { userId: user.id },
    token
);
```

## 🚀 Performance Testing with K6

The project includes comprehensive performance tests using K6, demonstrating all key concepts:

### Concepts Implemented

| Concept | File | Description |
|---------|------|-------------|
| **Thresholds** | `config/options.js` | Performance limits (p95<500ms, rate<1%) |
| **Checks** | `banking-api.test.js` | Response validations |
| **Helpers** | `helpers/*.js` | Reusable functions (login, http, generators) |
| **Trends** | `banking-api.test.js` | Custom metrics per endpoint |
| **Faker** | `helpers/generators.js` | Dynamic data generation |
| **Environment Variables** | `config/options.js` | K6_BASE_URL, K6_VUS configuration |
| **Stages** | `config/options.js` | Load phases (ramp-up, sustain, stress, ramp-down) |
| **Response Reuse** | `banking-api.test.js` | Token and account reuse between requests |
| **JWT Token** | `helpers/auth.js` | Bearer token authentication |
| **Data-Driven** | `data/users.json` | SharedArray with test scenarios |
| **Groups** | `banking-api.test.js` | Logical grouping of operations |

### K6 Test Structure

```
test/k6/
├── config/options.js        # Thresholds, Stages, Environment Variables
├── data/users.json          # Data-Driven Testing scenarios
├── helpers/
│   ├── auth.js              # Authentication helpers
│   ├── generators.js        # Faker data generation
│   └── http.js              # HTTP request helpers
├── tests/
│   └── banking-api.test.js  # Main test file
├── README.md                # Detailed K6 documentation
└── report.html              # Generated HTML report
```

### Running K6 Tests

```bash
# Install K6 first: https://k6.io/docs/get-started/installation/

# Start the API
npm start

# Run performance tests
npm run test-k6

# Run with custom configuration
K6_BASE_URL=http://localhost:3000 K6_VUS=20 npm run test-k6
```

> 📖 **Full K6 documentation:** [test/k6/README.md](./test/k6/README.md)

---

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