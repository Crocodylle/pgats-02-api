# 📖 Technical Documentation - PGATS-02 API

> **For basic information and quick start, see [README.md](./README.md)**

This documentation contains in-depth technical details about the architecture, technologies, and testing structure of the API.

## 🛠️ Technologies and Frameworks Used

### Runtime and Main Framework
- **Node.js** - JavaScript runtime for server-side code execution
- **Express.js** - Minimalist and flexible web framework for Node.js, used to create REST APIs quickly and efficiently
- **Apollo Server** - High-performance GraphQL server for Node.js, offering a modern and flexible interface for data queries
- **GraphQL** - Query language for APIs that allows fetching exactly the needed data

### Security and Authentication
- **bcryptjs** - Library for password hashing, ensuring passwords are stored securely through encryption
- **jsonwebtoken (JWT)** - JSON Web Tokens implementation for stateless authentication, enabling secure authentication between client and server
- **cors** - Middleware for enabling Cross-Origin Resource Sharing, allowing the API to be accessed by different domains

### Validation and Documentation
- **joi** - Powerful data validation library for JavaScript, used to validate request data before processing
- **swagger-jsdoc + swagger-ui-express** - Tools for generating and displaying interactive API documentation directly from code comments

### Testing and Quality
- **Mocha** - Flexible testing framework that supports asynchronous testing and offers a simple and clean API for test writing
- **Chai** - Assertion library that provides natural language assertions, making tests more readable and expressive
- **Supertest** - Library for HTTP testing in Node.js applications, allowing simulation of requests without starting an actual server
- **Axios** - HTTP client for making real requests to external APIs, used in end-to-end tests
- **Sinon** - Library for creating mocks, spies, and stubs, essential for isolated unit testing
- **Mochawesome** - Reporter that generates beautiful HTML reports with detailed test statistics and execution history

### Development
- **Nodemon** - Tool that monitors file changes and automatically restarts the server, improving development efficiency

## 🏗️ Application Architecture

### Architectural Pattern
The application follows a **layered architecture** with clear separation of responsibilities:

```
┌─────────────────┐    ┌─────────────────┐
│   REST Routes   │    │  GraphQL Types  │
│   + Controllers │    │  + Resolvers    │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
            ┌────────▼────────┐
            │    Services     │ ← Business Logic
            │   (Business)    │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │     Models      │ ← Data Layer
            │  (Data Access)  │
            └─────────────────┘
```

### Folder Structure Details

#### `/src/controllers/`
Controllers responsible for handling HTTP requests and delegating business logic to services.

- **`authController.js`** - Authentication and login operations
- **`userController.js`** - User management (registration, profile, balance)
- **`transferController.js`** - Transfer operations and favorites

#### `/src/services/`
Business layer containing the application's core logic.

- **`authService.js`** - Authentication logic, token generation and validation
- **`userService.js`** - User operations, balance validation, account management
- **`transferService.js`** - Transfer logic, business validations, favorites management

#### `/src/models/`
Data models defining the structure and behavior of entities.

- **`User.js`** - User model with methods for creation, search, and validation
- **`Transfer.js`** - Transfer model with history and validation logic
- **`Favorite.js`** - Favorites model for managing preferred accounts

#### `/src/routes/`
Route definitions connecting HTTP endpoints to controllers.

- **`authRoutes.js`** - Authentication routes (`/auth/*`)
- **`userRoutes.js`** - User routes (`/users/*`)
- **`transferRoutes.js`** - Transfer and favorites routes (`/transfers/*`)

#### `/src/middlewares/`
Middleware functions for request processing.

- **`auth.js`** - JWT authentication middleware for protected routes
- **`validation.js`** - Request data validation middleware using Joi

#### `/src/graphql/`
GraphQL configuration and implementation.

- **`graphqlApp.js`** - Apollo Server configuration and context setup
- **`typeDefs.js`** - GraphQL schema definitions (types, queries, mutations)
- **`resolvers.js`** - GraphQL resolvers implementing query and mutation logic

#### `/src/config/`
Application configurations.

- **`swagger.js`** - Swagger documentation configuration and endpoint definitions

#### `/src/database/`
Database configuration and connection management.

- **`index.js`** - In-memory database configuration and initialization

## 🧪 Complete Testing Architecture

### Test Organization Philosophy

The tests are organized into two main categories, each with a specific purpose:

#### 1. Controller Tests (`/test/controller/`)
**Purpose**: Unit and integration testing
**Method**: Import application directly (no HTTP server)
**Speed**: Fast execution
**Tool**: Supertest

#### 2. External Tests (`/test/external/`)
**Purpose**: End-to-end testing
**Method**: Real HTTP requests to running server
**Speed**: Slower but more realistic
**Tool**: Axios

### Detailed Directory Structure

```
test/
├── controller/              # Fast tests (no server)
│   ├── rest/               # REST controller tests
│   │   ├── userController.test.js
│   │   └── transferController.test.js
│   └── graphql/            # GraphQL controller tests
│       ├── userControllerGraphql.test.js
│       └── transferControllerGraphql.test.js
├── external/               # End-to-end tests (requires server)
│   ├── rest/               # REST external tests
│   │   ├── userExternal.test.js
│   │   └── transferExternal.test.js
│   └── graphql/            # GraphQL external tests
│       └── transfersExternalGraphql.test.js
├── helpers/                # Test utilities
│   ├── authHelper.js       # JWT token generation
│   ├── dataHelper.js       # Test data creation
│   ├── requestHelper.js    # Supertest utilities
│   ├── externalApiHelper.js # Axios utilities for REST
│   └── graphqlApiHelper.js # Axios utilities for GraphQL
└── fixtures/               # Test data
    └── response/
        └── TransferenciaComSucesso.json
```

### Specialized Test Helpers

#### `authHelper.js`
Generates JWT tokens for different test scenarios:
```javascript
// Generate token for existing user
generateTokenForUser(userId, email, account)

// Generate token for new user with default data
generateTokenForNewUser()

// Generate expired token for authentication tests
generateExpiredToken()
```

#### `dataHelper.js`
Creates consistent test data:
```javascript
// Create test user with random data
createTestUser()

// Create transfer data with validation
createTransferData(fromAccount, toAccount, amount)

// Generate random account numbers
generateRandomAccount()
```

#### `requestHelper.js` (Supertest)
Simplifies authenticated requests for controller tests:
```javascript
// Authenticated GET request
authenticatedGet(app, endpoint, token)

// Authenticated POST request with data
authenticatedPost(app, endpoint, data, token)

// Login and get token for tests
loginAndGetToken(app, credentials)
```

#### `externalApiHelper.js` (Axios - REST)
Handles real HTTP requests for external REST tests:
```javascript
// Register user and get token
registerAndLogin()

// Make authenticated request
makeAuthenticatedRequest(method, endpoint, data, token)

// Health check
checkApiHealth()
```

#### `graphqlApiHelper.js` (Axios - GraphQL)
Specializes in GraphQL operations:
```javascript
// Execute GraphQL query/mutation
executeGraphQL(query, variables, token)

// User operations
registerUserGraphQL(userData)
loginUserGraphQL(credentials)
getUserProfile(token)
getUserBalance(token)

// Transfer operations
createTransfer(transferData, token)
getUserTransfers(token)

// Favorites operations
addFavorite(favoriteData, token)
getFavorites(token)
```

### Test Execution Strategies

#### Fast Development Cycle (Controller Tests)
```bash
npm run test-controllerRest     # ~2-3 seconds
npm run test-controllerGraphql  # ~2-3 seconds
```
- Import `app.js` directly
- No HTTP server startup
- Immediate feedback
- Ideal for TDD (Test-Driven Development)

#### Production Validation (External Tests)
```bash
# Requires: npm start (in another terminal)
npm run test-externalRest       # ~10-15 seconds
npm run test-externalGraphql    # ~10-15 seconds
```
- Tests against real running server
- Validates complete request/response cycle
- Tests authentication middleware, CORS, etc.
- Simulates real production environment

### Mochawesome Reports

Every test execution generates detailed HTML reports:

**Location**: `mochawesome-report/mochawesome.html`

**Content includes**:
- ✅ Test summary (passed/failed/pending)
- ⏱️ Execution time for each test
- 📊 Visual statistics and charts
- 🔍 Detailed failure information
- 📈 Historical trends (when run multiple times)

## 🔄 Request Flow and Processing

### REST API Flow
```
Client Request → Express Router → Middleware Chain → Controller → Service → Model → Response
```

**Middleware Chain**:
1. **CORS** - Enable cross-origin requests
2. **JSON Parser** - Parse request body
3. **Authentication** - Validate JWT token (protected routes)
4. **Validation** - Validate request data with Joi
5. **Controller** - Route to appropriate controller

### GraphQL API Flow
```
Client Query → Apollo Server → Context Setup → Resolver → Service → Model → Response
```

**Context Setup**:
1. **Token Extraction** - Extract JWT from Authorization header
2. **Token Validation** - Verify token signature and expiration
3. **User Context** - Add user information to context
4. **Resolver Execution** - Execute requested query/mutation

### Authentication Flow (Both APIs)

#### Registration Flow
```
1. Client sends: { name, email, password }
2. Validation: Check required fields
3. Existence check: Verify email not already registered
4. Password hashing: bcrypt hash generation
5. Account generation: Random 6-digit account number
6. User creation: Save to in-memory database
7. Token generation: Create JWT with user data
8. Response: { token, user }
```

#### Login Flow
```
1. Client sends: { email, password }
2. User lookup: Find user by email
3. Password verification: Compare with bcrypt
4. Token generation: Create new JWT
5. Response: { token, user }
```

#### Protected Route Access
```
1. Client sends: Authorization: Bearer <token>
2. Token extraction: Get token from header
3. Token verification: Validate signature and expiration
4. User context: Add user info to request/context
5. Route execution: Proceed with business logic
```

## 🔐 Security Implementation

### Password Security
- **Hashing**: bcryptjs with salt rounds
- **Storage**: Only hashed passwords stored
- **Validation**: Original password never stored or logged

### JWT Security
- **Signature**: HMAC SHA-256 with secret key
- **Expiration**: 24-hour token lifetime
- **Payload**: Minimal user information (id, email, account)
- **Stateless**: No server-side session storage

### Input Validation
- **Joi Schemas**: Comprehensive validation rules
- **Type Checking**: Ensure correct data types
- **Format Validation**: Email format, password strength
- **Sanitization**: Clean input data before processing

### CORS Configuration
- **Origin Control**: Configurable allowed origins
- **Method Restriction**: Specific HTTP methods allowed
- **Header Control**: Allowed request headers

## 📊 Performance Considerations

### Database Performance
- **In-Memory Storage**: Ultra-fast read/write operations
- **No Disk I/O**: Eliminates file system bottlenecks
- **Simple Queries**: Array operations for data retrieval

### Authentication Performance
- **Stateless JWTs**: No database lookups for authentication
- **Bcrypt Optimization**: Balanced security vs. performance
- **Token Caching**: Client-side token storage

### API Performance
- **Express Efficiency**: Minimal middleware chain
- **GraphQL Optimization**: Efficient resolvers
- **Response Compression**: Built-in gzip support

### Testing Performance
- **Parallel Execution**: Mocha concurrent test runs
- **Fast Assertions**: Chai optimized assertions
- **Memory Cleanup**: Proper test isolation

## 🚀 Deployment and Production

### Environment Configuration
```javascript
// Production optimizations
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret-key>
```

### Production Considerations
- **Secret Management**: Use environment variables for secrets
- **Database**: Replace in-memory with persistent storage
- **Logging**: Implement comprehensive logging
- **Monitoring**: Add health checks and metrics
- **Security**: Implement rate limiting and input sanitization

### Scaling Strategies
- **Horizontal Scaling**: Stateless design enables multiple instances
- **Load Balancing**: Distribute requests across instances
- **Caching**: Implement Redis for session/data caching
- **Database Optimization**: Use appropriate database indexes

## 🔍 Troubleshooting Guide

### Common Issues

#### "Cannot find module" Errors
- **Cause**: Incorrect relative paths after file moves
- **Solution**: Check and update import paths
- **Prevention**: Use absolute paths or path aliases

#### Authentication Failures
- **Cause**: Malformed tokens or expired sessions
- **Solution**: Check token format and expiration
- **Debug**: Log token content and validation steps

#### Test Failures
- **Controller Tests**: Check if app.js imports correctly
- **External Tests**: Ensure server is running (`npm start`)
- **Port Conflicts**: Verify ports 3000 and 4000 are available

#### GraphQL Errors
- **Schema Issues**: Validate typeDefs syntax
- **Resolver Errors**: Check resolver function signatures
- **Context Problems**: Verify authentication context setup

### Debug Tools

#### REST API Debugging
```bash
# Test endpoints with curl
curl -X GET http://localhost:3000/health

# Check authentication
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/users/profile
```

#### GraphQL Debugging
```bash
# Access GraphQL Playground
open http://localhost:4000/

# Test queries in playground
query { me { id name email } }
```

#### Test Debugging
```bash
# Run specific test file
npm test -- --grep "specific test name"

# Debug mode with detailed output
DEBUG=* npm test
```

## 📈 Future Enhancements

### Planned Features
- **Database Integration**: PostgreSQL or MongoDB
- **Real-time Updates**: WebSocket implementation
- **File Uploads**: Multi-part file handling
- **Advanced Auth**: OAuth2 and SSO integration
- **API Versioning**: Version management strategy

### Testing Improvements
- **Coverage Reports**: Code coverage analysis
- **Performance Tests**: Load and stress testing
- **Contract Testing**: API contract validation
- **Visual Testing**: UI component testing

### DevOps Integration
- **CI/CD Pipeline**: Automated testing and deployment
- **Docker Containers**: Containerization for consistency
- **Monitoring**: Application performance monitoring
- **Documentation**: Auto-generated API docs

---

**This technical documentation is maintained alongside the codebase to ensure accuracy and relevance.** 📚
