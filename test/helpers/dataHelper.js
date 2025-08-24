// test/helpers/dataHelper.js
const userService = require('../../src/services/userService');
const { database } = require('../../src/database');
const { createTestToken } = require('./authHelper');

/**
 * Cria um usuário de teste usando o userService
 */
const createTestUser = async (userData = {}) => {
    const defaultData = {
        name: 'Usuário Teste',
        email: `teste${Date.now()}${Math.random()}@email.com`, // Email único
        password: 'senha123',
        ...userData
    };

    try {
        const user = await userService.createUser(defaultData);
        return {
            ...user.toJSON(),
            originalPassword: defaultData.password // Para usar em testes de login
        };
    } catch (error) {
        throw new Error(`Erro ao criar usuário de teste: ${error.message}`);
    }
};

/**
 * Cria múltiplos usuários de teste
 */
const createMultipleTestUsers = async (count = 2) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const user = await createTestUser({
            name: `Usuário ${i + 1}`,
            email: `usuario${i + 1}${Date.now()}@teste.com`
        });
        users.push(user);
    }
    return users;
};

/**
 * Cria um usuário com saldo específico
 */
const createUserWithBalance = async (balance, userData = {}) => {
    const user = await createTestUser(userData);
    const userInDb = database.users.find(u => u.id === user.id);
    if (userInDb) {
        userInDb.balance = balance;
        userInDb.updatedAt = new Date();
    }
    return { ...user, balance };
};

/**
 * Cria um usuário "rico" com muito saldo
 */
const createRichUser = async (userData = {}) => {
    return await createUserWithBalance(50000, {
        name: 'Usuário Rico',
        email: `rico${Date.now()}@teste.com`,
        ...userData
    });
};

/**
 * Cria um usuário "pobre" com pouco saldo
 */
const createPoorUser = async (userData = {}) => {
    return await createUserWithBalance(10, {
        name: 'Usuário Pobre',
        email: `pobre${Date.now()}@teste.com`,
        ...userData
    });
};

/**
 * Cria usuário com token já gerado
 */
const createUserWithToken = async (userData = {}) => {
    const user = await createTestUser(userData);
    const token = createTestToken(user.id, user.email, user.account);
    return { user, token };
};

/**
 * Dados de transferência válidos
 */
const getValidTransferData = (toAccount = '123456') => ({
    toAccount,
    amount: 100,
    description: 'Transferência de teste'
});

/**
 * Dados de transferência inválidos
 */
const getInvalidTransferData = () => [
    { toAccount: '', amount: 100 }, // Conta vazia
    { toAccount: '123456' }, // Sem amount
    { toAccount: '123456', amount: 0 }, // Amount zero
    { toAccount: '123456', amount: -100 }, // Amount negativo
    { toAccount: '12345', amount: 100 }, // Conta com tamanho errado
    { toAccount: 'abcdef', amount: 100 }, // Conta não numérica
];

/**
 * Dados de usuário válidos
 */
const getValidUserData = () => ({
    name: 'Usuário Teste',
    email: `teste${Date.now()}@email.com`,
    password: 'senha123'
});

/**
 * Dados de usuário inválidos
 */
const getInvalidUserData = () => [
    { name: '', email: 'test@email.com', password: 'senha123' }, // Nome vazio
    { name: 'Teste', email: '', password: 'senha123' }, // Email vazio
    { name: 'Teste', email: 'test@email.com', password: '' }, // Senha vazia
    { name: 'Teste', email: 'email-invalido', password: 'senha123' }, // Email inválido
    { name: 'T', email: 'test@email.com', password: 'senha123' }, // Nome muito curto
    { name: 'Teste', email: 'test@email.com', password: '123' }, // Senha muito curta
];

/**
 * Limpa todo o banco de dados
 */
const clearDatabase = () => {
    database.users.length = 0;
    database.transfers.length = 0;
    database.favorites.length = 0;
    database.nextUserId = 1;
    database.nextTransferId = 1;
    database.nextFavoriteId = 1;
};

/**
 * Obtém estatísticas do banco
 */
const getDatabaseStats = () => ({
    users: database.users.length,
    transfers: database.transfers.length,
    favorites: database.favorites.length,
    nextUserId: database.nextUserId,
    nextTransferId: database.nextTransferId,
    nextFavoriteId: database.nextFavoriteId
});

module.exports = {
    // Criação de usuários
    createTestUser,
    createMultipleTestUsers,
    createUserWithBalance,
    createRichUser,
    createPoorUser,
    createUserWithToken,
    
    // Dados de teste
    getValidTransferData,
    getInvalidTransferData,
    getValidUserData,
    getInvalidUserData,
    
    // Utilitários
    clearDatabase,
    getDatabaseStats
};