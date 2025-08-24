// test/helpers/requestHelper.js
const request = require('supertest');
const app = require('../../app');
const { createTestToken } = require('./authHelper');
const { createTestUser } = require('./dataHelper');

/**
 * Cria uma requisição autenticada
 */
const authenticatedRequest = (method, url, token = null) => {
    const authToken = token || createTestToken();
    return request(app)[method](url).set('Authorization', `Bearer ${authToken}`);
};

/**
 * Cria uma requisição POST autenticada
 */
const authenticatedPost = (url, data = {}, token = null) => {
    return authenticatedRequest('post', url, token).send(data);
};

/**
 * Cria uma requisição GET autenticada
 */
const authenticatedGet = (url, token = null) => {
    return authenticatedRequest('get', url, token);
};

/**
 * Cria uma requisição PUT autenticada
 */
const authenticatedPut = (url, data = {}, token = null) => {
    return authenticatedRequest('put', url, token).send(data);
};

/**
 * Cria uma requisição DELETE autenticada
 */
const authenticatedDelete = (url, token = null) => {
    return authenticatedRequest('delete', url, token);
};

/**
 * Registra um usuário via API
 */
const registerUser = (userData = {}) => {
    const defaultData = {
        name: 'Usuário Teste',
        email: `teste${Date.now()}@email.com`,
        password: 'senha123',
        ...userData
    };
    
    return request(app)
        .post('/users/register')
        .send(defaultData);
};

/**
 * Faz login via API e retorna o token
 */
const loginUser = async (email, password) => {
    const response = await request(app)
        .post('/auth/login')
        .send({ email, password });
    
    if (response.status === 200) {
        return response.body.data.token;
    }
    throw new Error(`Login falhou: ${response.body.error}`);
};

/**
 * Registra usuário e faz login automaticamente
 */
const registerAndLogin = async (userData = {}) => {
    const registerResponse = await registerUser(userData);
    
    if (registerResponse.status !== 201) {
        throw new Error(`Registro falhou: ${registerResponse.body.error}`);
    }
    
    const user = registerResponse.body.data;
    const email = userData.email || `teste${Date.now()}@email.com`;
    const password = userData.password || 'senha123';
    
    const token = await loginUser(email, password);
    
    return { user, token };
};

/**
 * Cria transferência via API
 */
const createTransfer = (fromToken, transferData) => {
    return authenticatedPost('/transfers', transferData, fromToken);
};

/**
 * Adiciona favorito via API
 */
const addFavorite = (token, account) => {
    return authenticatedPost('/transfers/favorites', { account }, token);
};

/**
 * Lista transferências via API
 */
const getTransfers = (token) => {
    return authenticatedGet('/transfers', token);
};

/**
 * Lista favoritos via API
 */
const getFavorites = (token) => {
    return authenticatedGet('/transfers/favorites', token);
};

/**
 * Lista usuários via API
 */
const getUsers = (token) => {
    return authenticatedGet('/users', token);
};

/**
 * Obtém perfil do usuário via API
 */
const getUserProfile = (token) => {
    return authenticatedGet('/users/profile', token);
};

/**
 * Obtém saldo do usuário via API
 */
const getUserBalance = (token) => {
    return authenticatedGet('/users/balance', token);
};

/**
 * Testa endpoint de health
 */
const checkHealth = () => {
    return request(app).get('/health');
};

/**
 * Testa endpoint não existente
 */
const testNotFound = (path = '/rota-inexistente') => {
    return request(app).get(path);
};

/**
 * Wrapper para testes de erro sem autenticação
 */
const testUnauthorized = (method, url, data = {}) => {
    const req = request(app)[method](url);
    return data && Object.keys(data).length > 0 ? req.send(data) : req;
};

module.exports = {
    // Requisições básicas
    authenticatedRequest,
    authenticatedPost,
    authenticatedGet,
    authenticatedPut,
    authenticatedDelete,
    
    // Autenticação
    registerUser,
    loginUser,
    registerAndLogin,
    
    // Operações específicas
    createTransfer,
    addFavorite,
    getTransfers,
    getFavorites,
    getUsers,
    getUserProfile,
    getUserBalance,
    
    // Utilitários
    checkHealth,
    testNotFound,
    testUnauthorized
};