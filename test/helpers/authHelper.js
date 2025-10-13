// test/helpers/authHelper.js
const jwt = require('jsonwebtoken');
const config = require('../../src/config/environment');

const JWT_SECRET = config.security.jwtSecret;

/**
 * Cria um token JWT válido para testes
 */
const createTestToken = (userId = 1, email = 'test@email.com', account = '123456') => {
    return jwt.sign(
        { userId, email, account },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

/**
 * Cria um token JWT expirado para testes
 */
const createExpiredToken = (userId = 1, email = 'test@email.com', account = '123456') => {
    return jwt.sign(
        { userId, email, account },
        JWT_SECRET,
        { expiresIn: '-1h' }
    );
};

/**
 * Cria um token inválido para testes
 */
const createInvalidToken = () => {
    return 'token-invalido-para-teste';
};

/**
 * Cria um token com secret incorreto
 */
const createTokenWithWrongSecret = (userId = 1, email = 'test@email.com', account = '123456') => {
    return jwt.sign(
        { userId, email, account },
        'wrong-secret',
        { expiresIn: '1h' }
    );
};

/**
 * Cria um token sem dados obrigatórios
 */
const createIncompleteToken = () => {
    return jwt.sign(
        { email: 'test@email.com' }, // Falta userId e account
        JWT_SECRET,
        { expiresIn: '1h' }
    );
};

/**
 * Verifica se um token é válido
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    createTestToken,
    createExpiredToken,
    createInvalidToken,
    createTokenWithWrongSecret,
    createIncompleteToken,
    verifyToken
};