# 🔧 Environment Configuration Guide

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp env.template .env
   ```

2. **Install dotenv dependency:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

## Environment Variables

### 🚀 Server Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | REST API server port |
| `NODE_ENV` | `development` | Application environment |

### 🔐 Security Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `pgats-api-secret-key-2024-development` | JWT signing secret |
| `JWT_EXPIRES_IN` | `24h` | JWT token expiration time |
| `BCRYPT_ROUNDS` | `10` | Bcrypt hashing rounds |

### 🧪 Testing Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_PORT` | `3000` | Port for external tests |
| `GRAPHQL_PORT` | `4000` | GraphQL server port |
| `TEST_TIMEOUT` | `30000` | Test timeout in milliseconds |

### 📝 Logging Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Logging level |
| `VERBOSE_LOGGING` | `false` | Enable verbose logging |
| `DEBUG` | `false` | Enable debug mode |

### 🌐 CORS Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:4000,http://localhost:8080` | Comma-separated allowed origins |

### 🚀 Performance Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `REQUEST_TIMEOUT` | `30000` | Request timeout in milliseconds |
| `MAX_REQUEST_SIZE` | `50mb` | Maximum request body size |

### 📈 Monitoring Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `HEALTH_CHECK_ENABLED` | `true` | Enable health check endpoint |
| `METRICS_ENABLED` | `false` | Enable metrics collection |

### 🔒 Rate Limiting Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_WINDOW` | `15` | Rate limit window in minutes |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Maximum requests per window |

## Environment-Specific Configurations

### Development Environment
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=pgats-api-secret-key-2024-development
DEBUG=true
VERBOSE_LOGGING=true
```

### Testing Environment
```env
NODE_ENV=test
PORT=3001
JWT_SECRET=pgats-api-secret-key-2024-testing
LOG_LEVEL=error
HEALTH_CHECK_ENABLED=false
```

### Production Environment
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-production-secret-key
LOG_LEVEL=warn
METRICS_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=50
```

## Configuration Access

The application uses a centralized configuration system located at `src/config/environment.js`.

### Usage Example:
```javascript
const config = require('./src/config/environment');

// Server configuration
console.log(config.server.port); // 3000
console.log(config.server.isDevelopment); // true

// Security configuration
console.log(config.security.jwtSecret); // JWT secret
console.log(config.security.jwtExpiresIn); // 24h

// Testing configuration
console.log(config.testing.testPort); // 3000
console.log(config.testing.graphqlPort); // 4000
```

## Validation

The configuration system automatically validates required environment variables:

- **Production**: Requires a custom `JWT_SECRET` (not the default development key)
- **Missing Variables**: Throws descriptive errors for missing required variables

## Security Best Practices

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters, random
3. **Rotate secrets regularly** - Especially in production
4. **Use environment-specific values** - Different secrets for dev/test/prod
5. **Limit CORS origins** - Only allow necessary domains

## Troubleshooting

### Common Issues

#### "Missing required environment variables"
- **Cause**: Required variables not set in production
- **Solution**: Set all required environment variables

#### "Invalid JWT secret"
- **Cause**: Using default development secret in production
- **Solution**: Set a custom `JWT_SECRET` for production

#### "Port already in use"
- **Cause**: Another process is using the configured port
- **Solution**: Change `PORT` in `.env` or stop the conflicting process

#### "CORS errors"
- **Cause**: Frontend origin not in `ALLOWED_ORIGINS`
- **Solution**: Add your frontend URL to `ALLOWED_ORIGINS`

## Future Enhancements

The configuration system is prepared for future features:

- **Email Service**: SMTP configuration for notifications
- **Redis**: Caching and session storage
- **Database**: PostgreSQL connection for persistent storage
- **External APIs**: Third-party service integrations

## Support

For configuration issues, check:
1. Environment variable spelling and values
2. `.env` file location (project root)
3. Configuration validation messages
4. Application startup logs

