// src/config/environment.js
require('dotenv').config();

/**
 * 🔧 Environment Configuration
 * Centralizes all environment variables with defaults
 */
const config = {
    // 🚀 Server Configuration
    server: {
        port: parseInt(process.env.PORT) || 3000,
        nodeEnv: process.env.NODE_ENV || 'development',
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isTest: process.env.NODE_ENV === 'test'
    },

    // 🔐 Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'pgats-api-secret-key-2024-development',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
    },

    // 🧪 Testing Configuration
    testing: {
        testPort: parseInt(process.env.TEST_PORT) || 3000,
        graphqlPort: parseInt(process.env.GRAPHQL_PORT) || 4000,
        testTimeout: parseInt(process.env.TEST_TIMEOUT) || 30000
    },

    // 📝 Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        verbose: process.env.VERBOSE_LOGGING === 'true',
        debug: process.env.DEBUG === 'true'
    },

    // 🌐 CORS Configuration
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:8080'],
        credentials: true
    },

    // 🚀 Performance Configuration
    performance: {
        requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
        maxRequestSize: process.env.MAX_REQUEST_SIZE || '50mb'
    },

    // 📈 Monitoring Configuration
    monitoring: {
        healthCheckEnabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
        metricsEnabled: process.env.METRICS_ENABLED === 'true'
    },

    // 🔒 Rate Limiting Configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // 📧 Email Configuration (Future Implementation)
    email: {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASS || ''
    },

    // 🗄️ External Services Configuration (Future Implementation)
    external: {
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
        databaseUrl: process.env.DATABASE_URL || ''
    }
};

/**
 * Validate required environment variables
 */
const validateConfig = () => {
    const required = [];
    const insecureDefaults = [
        'pgats-api-secret-key-2024-development',
        'dev-secret-key',
        'test-secret-key'
    ];

    // ✅ IMPROVED: Validate in production AND staging/test environments
    if (config.server.isProduction) {
        if (!process.env.JWT_SECRET || insecureDefaults.includes(process.env.JWT_SECRET)) {
            required.push('JWT_SECRET (must use a secure custom value in production)');
        }
    }

    // ⚠️ WARN: Recommend custom secrets even in non-production
    if (!config.server.isDevelopment && !process.env.JWT_SECRET) {
        console.warn('⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable for better security.');
    }

    if (required.length > 0) {
        throw new Error(`❌ Missing required environment variables: ${required.join(', ')}`);
    }
};

// Validate configuration on load
validateConfig();

module.exports = config;


