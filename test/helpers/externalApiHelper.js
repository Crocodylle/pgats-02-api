// test/helpers/externalApiHelper.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

/**
 * 🌐 Helper para testes com API externa real
 * Substitui o Supertest por chamadas HTTP reais usando Axios
 * 
 * IMPORTANTE: A API deve estar rodando em http://localhost:3000
 */

/**
 * Cria uma requisição autenticada para API externa
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - Endpoint path (ex: '/transfers')
 * @param {object} data - Request body data
 * @param {string} token - JWT token for authorization
 * @returns {object} Response object with status, body, headers
 */
const authenticatedRequest = async (method, url, data = null, token = null) => {
    const config = {
        method: method.toUpperCase(),
        url: `${BASE_URL}${url}`,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        // Timeout para evitar testes infinitos
        timeout: 10000,
        // Não validar SSL em desenvolvimento
        validateStatus: function (status) {
            return true; // Aceitar qualquer status (não lançar erro)
        }
    };

    // Adicionar data apenas para métodos que suportam body
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.data = data;
    }

    try {
        const response = await axios(config);
        return {
            status: response.status,
            body: response.data,
            headers: response.headers
        };
    } catch (error) {
        // Se for erro de timeout ou conexão
        if (error.code === 'ECONNREFUSED') {
            throw new Error(`❌ Não foi possível conectar à API em ${BASE_URL}. Certifique-se de que o servidor está rodando.`);
        }
        if (error.code === 'ETIMEDOUT') {
            throw new Error(`⏰ Timeout ao conectar à API em ${BASE_URL}`);
        }
        throw error;
    }
};

/**
 * POST autenticado para API externa
 */
const authenticatedPost = async (url, data = {}, token = null) => {
    return authenticatedRequest('POST', url, data, token);
};

/**
 * GET autenticado para API externa
 */
const authenticatedGet = async (url, token = null) => {
    return authenticatedRequest('GET', url, null, token);
};

/**
 * PUT autenticado para API externa
 */
const authenticatedPut = async (url, data = {}, token = null) => {
    return authenticatedRequest('PUT', url, data, token);
};

/**
 * DELETE autenticado para API externa
 */
const authenticatedDelete = async (url, token = null) => {
    return authenticatedRequest('DELETE', url, null, token);
};

/**
 * Cria uma transferência via API externa
 */
const createTransfer = async (token, transferData) => {
    return authenticatedPost('/transfers', transferData, token);
};

/**
 * Adiciona favorito via API externa
 */
const addFavorite = async (token, account) => {
    return authenticatedPost('/transfers/favorites', { account }, token);
};

/**
 * Lista favoritos via API externa
 */
const listFavorites = async (token) => {
    return authenticatedGet('/transfers/favorites', token);
};

/**
 * Remove favorito via API externa
 */
const removeFavorite = async (token, account) => {
    return authenticatedDelete(`/transfers/favorites/${account}`, token);
};

/**
 * Registra usuário via API externa
 */
const registerUser = async (userData = {}) => {
    const defaultData = {
        name: 'Usuário Teste Externo',
        email: `teste.externo.${Date.now()}@email.com`,
        password: 'senha123'
        // ✅ Removido: account e balance (não aceitos pela API)
        // A API gera account automaticamente e define balance = 1000
    };

    // ✅ Filtrar apenas campos aceitos pelo schema da API
    const allowedFields = ['name', 'email', 'password'];
    const filteredUserData = Object.keys(userData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
            obj[key] = userData[key];
            return obj;
        }, {});

    const finalData = { ...defaultData, ...filteredUserData };
    return authenticatedRequest('POST', '/users/register', finalData);
};

/**
 * Faz login via API externa
 */
const loginUser = async (email, password) => {
    return authenticatedRequest('POST', '/auth/login', { email, password });
};

/**
 * Lista usuários via API externa
 */
const listUsers = async (token) => {
    return authenticatedGet('/users', token);
};

/**
 * Busca usuário específico via API externa
 */
const getUser = async (token, userId) => {
    return authenticatedGet(`/users/${userId}`, token);
};

/**
 * Verifica se a API está rodando
 */
const checkApiHealth = async () => {
    try {
        const response = await authenticatedRequest('GET', '/health');
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

/**
 * Verifica informações da API
 */
const getApiInfo = async () => {
    try {
        const response = await authenticatedRequest('GET', '/info');
        return response;
    } catch (error) {
        return { status: 500, body: { error: 'API não disponível' } };
    }
};

/**
 * Helper para criar usuários de teste com diferentes perfis
 * ✅ Todos os usuários terão saldo inicial de 1000 (definido pela API)
 */
const createTestUsers = async () => {
    const users = {
        user1: await registerUser({ 
            name: 'Usuario Teste 1', 
            email: `user1.${Date.now()}@email.com`
            // ✅ Saldo será 1000 (padrão da API)
        }),
        user2: await registerUser({ 
            name: 'Usuario Teste 2', 
            email: `user2.${Date.now()}@email.com`
        }),
        user3: await registerUser({ 
            name: 'Usuario Teste 3', 
            email: `user3.${Date.now()}@email.com`
        })
    };

    // Fazer login para obter tokens
    for (const [key, user] of Object.entries(users)) {
        if (user.status === 201) {
            const loginResponse = await loginUser(user.body.data.email, 'senha123');
            if (loginResponse.status === 200) {
                users[key].token = loginResponse.body?.data?.token;
            }
        }
    }

    return users;
};

/**
 * Limpa dados de teste (se a API suportar)
 */
const cleanupTestData = async () => {
    // Esta função dependeria de um endpoint específico na API para limpeza
    // Por enquanto, apenas um placeholder
    console.log('⚠️  Limpeza automática não implementada. Dados de teste podem acumular.');
};

module.exports = {
    // Funções principais
    authenticatedRequest,
    authenticatedPost,
    authenticatedGet,
    authenticatedPut,
    authenticatedDelete,
    
    // Funcionalidades específicas
    createTransfer,
    addFavorite,
    listFavorites,
    removeFavorite,
    registerUser,
    loginUser,
    listUsers,
    getUser,
    
    // Utilitários
    checkApiHealth,
    getApiInfo,
    createTestUsers,
    cleanupTestData,
    
    // Constantes
    BASE_URL
};