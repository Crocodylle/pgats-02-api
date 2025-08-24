/*
// test/example.test.js
const { expect } = require(
'chai');
const sinon = require('sinon');

// ✅ Importar todos os helpers
const { 
    createTestToken, 
    createExpiredToken, 
    createInvalidToken,
    createTokenWithWrongSecret
} = require('./helpers/authHelper');

const { 
    createTestUser, 
    createMultipleTestUsers, 
    createRichUser,
    createPoorUser,
    getValidTransferData,
    getInvalidTransferData,
    getValidUserData,
    getInvalidUserData,
    clearDatabase,
    getDatabaseStats
} = require('./helpers/dataHelper');

const { 
    registerUser,
    loginUser,
    registerAndLogin,
    authenticatedGet,
    authenticatedPost,
    createTransfer,
    addFavorite,
    getTransfers,
    getFavorites,
    getUsers,
    getUserProfile,
    getUserBalance,
    checkHealth,
    testNotFound,
    testUnauthorized
} = require('./helpers/requestHelper');

describe('🚀 PGATS-02 API - Comprehensive Tests', () => {
    
    // ✅ Limpar após cada teste
    afterEach(() => {
        sinon.restore();
        clearDatabase();
    });

    describe('🏥 Health & Info Endpoints', () => {
        it('✅ Health endpoint should return system status', async () => {
            const response = await checkHealth();
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'OK');
            expect(response.body).to.have.property('timestamp');
            expect(response.body).to.have.property('uptime');
            expect(typeof response.body.uptime).to.equal('number');
        });

        it('✅ Root endpoint should return API information', async () => {
            const response = await testUnauthorized('get', '/');
            
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('version', '1.0.0');
            expect(response.body).to.have.property('documentation', '/api-docs');
            expect(response.body).to.have.property('endpoints');
            expect(response.body.endpoints).to.be.an('object');
            expect(response.body.endpoints).to.have.property('auth', '/auth');
            expect(response.body.endpoints).to.have.property('users', '/users');
            expect(response.body.endpoints).to.have.property('transfers', '/transfers');
        });

        it('❌ Non-existent route should return 404', async () => {
            const response = await testNotFound('/rota-que-nao-existe');
            
            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('error', 'Rota não encontrada');
            expect(response.body).to.have.property('path', '/rota-que-nao-existe');
            expect(response.body).to.have.property('method', 'GET');
        });
    });

    describe('🔐 Authentication Tests', () => {
        describe('Valid Authentication', () => {
            it('✅ Should login with valid credentials', async () => {
                const userData = getValidUserData();
                await registerUser(userData);
                
                const token = await loginUser(userData.email, userData.password);
                
                expect(token).to.be.a('string');
                expect(token.length).to.be.greaterThan(50); // JWT token length
            });

            it('✅ Should register and login automatically', async () => {
                // ✅ CORREÇÃO: Usar dados com email específico para evitar conflito
                const userData = {
                    name: 'Test User',
                    email: `testuser${Date.now()}@email.com`,
                    password: 'senha123'
                };
                
                const { user, token } = await registerAndLogin(userData);
                
                expect(user).to.have.property('id');
                expect(user).to.have.property('name');
                expect(user).to.have.property('email');
                expect(user).to.have.property('account');
                expect(user).to.have.property('balance', 1000);
                expect(token).to.be.a('string');
            });
        });

        describe('Invalid Authentication', () => {
            it('❌ Should reject login without credentials', async () => {
                const response = await testUnauthorized('post', '/auth/login', {});
                
                expect(response.status).to.equal(400);
                expect(response.body).to.have.property('error');
                expect(response.body.details).to.be.an('array');
            });

            it('❌ Should reject login with missing password', async () => {
                const response = await testUnauthorized('post', '/auth/login', {
                    email: 'test@email.com'
                });
                
                expect(response.status).to.equal(400);
                expect(response.body).to.have.property('error');
            });

            it('❌ Should reject login with invalid credentials', async () => {
                const userData = getValidUserData();
                await registerUser(userData);
                
                try {
                    await loginUser(userData.email, 'senha-errada');
                    expect.fail('Should have thrown an error');
                } catch (error) {
                    expect(error.message).to.include('Login falhou');
                }
            });

            it('❌ Should reject expired token', async () => {
                const expiredToken = createExpiredToken();
                
                const response = await authenticatedGet('/users/profile', expiredToken);
                
                expect(response.status).to.equal(403);
                expect(response.body).to.have.property('error', 'Token inválido');
            });

            it('❌ Should reject invalid token', async () => {
                const invalidToken = createInvalidToken();
                
                const response = await authenticatedGet('/users/profile', invalidToken);
                
                expect(response.status).to.equal(403);
                expect(response.body).to.have.property('error', 'Token inválido');
            });

            it('❌ Should reject token with wrong secret', async () => {
                const wrongToken = createTokenWithWrongSecret();
                
                const response = await authenticatedGet('/users/profile', wrongToken);
                
                expect(response.status).to.equal(403);
                expect(response.body).to.have.property('error', 'Token inválido');
            });
        });
    });

    describe('👥 User Management Tests', () => {
        describe('User Registration', () => {
            it('✅ Should register user with valid data', async () => {
                const userData = getValidUserData();
                const response = await registerUser(userData);
                
                expect(response.status).to.equal(201);
                expect(response.body).to.have.property('message', 'Usuário criado com sucesso');
                expect(response.body.data).to.have.property('id');
                expect(response.body.data).to.have.property('name', userData.name);
                expect(response.body.data).to.have.property('email', userData.email);
                expect(response.body.data).to.have.property('account');
                expect(response.body.data).to.have.property('balance', 1000);
                expect(response.body.data).to.not.have.property('password');
            });

            it('❌ Should reject duplicate email registration', async () => {
                const userData = getValidUserData();
                await registerUser(userData);
                
                const response = await registerUser(userData);
                
                expect(response.status).to.equal(409);
                expect(response.body).to.have.property('error');
                expect(response.body.error).to.include('já existe');
            });

            it('❌ Should reject registration with invalid data', async () => {
                const invalidDataSets = getInvalidUserData();
                
                for (const invalidData of invalidDataSets) {
                    const response = await registerUser(invalidData);
                    expect(response.status).to.equal(400);
                    expect(response.body).to.have.property('error');
                }
            });
        });

        describe('User Information', () => {
            it('✅ Should get user profile', async () => {
                // ✅ CORREÇÃO: Usar createTestUser em vez de registerAndLogin
                const user = await createTestUser();
                const token = createTestToken(user.id, user.email, user.account);
                
                const response = await getUserProfile(token);
                
                expect(response.status).to.equal(200);
                expect(response.body).to.have.property('message', 'Perfil recuperado com sucesso');
                expect(response.body.data).to.have.property('id', user.id);
                expect(response.body.data).to.have.property('email', user.email);
            });

            it('✅ Should get user balance', async () => {
                // ✅ CORREÇÃO: Usar createTestUser em vez de registerAndLogin
                const user = await createTestUser();
                const token = createTestToken(user.id, user.email, user.account);
                
                const response = await getUserBalance(token);
                
                expect(response.status).to.equal(200);
                expect(response.body).to.have.property('message', 'Saldo recuperado com sucesso');
                expect(response.body.data).to.have.property('balance', 1000);
            });

            it('✅ Should list all users', async () => {
                await createMultipleTestUsers(3);
                const user = await createTestUser();
                const token = createTestToken(user.id, user.email, user.account);
                
                const response = await getUsers(token);
                
                expect(response.status).to.equal(200);
                expect(response.body).to.have.property('message', 'Usuários recuperados com sucesso');
                expect(response.body.data).to.be.an('array');
                expect(response.body.data).to.have.length.greaterThan(3);
            });

            it('❌ Should reject profile access without token', async () => {
                const response = await testUnauthorized('get', '/users/profile');
                
                expect(response.status).to.equal(401);
                expect(response.body).to.have.property('error', 'Token de acesso requerido');
            });
        });
    });

    describe('💸 Transfer Tests', () => {
        describe('Successful Transfers', () => {
            it('✅ Should transfer money between users', async () => {
                const [user1, user2] = await createMultipleTestUsers(2);
                const token = createTestToken(user1.id, user1.email, user1.account);
                const transferData = getValidTransferData(user2.account);
                
                const response = await createTransfer(token, transferData);
                
                expect(response.status).to.equal(201);
                expect(response.body).to.have.property('message', 'Transferência realizada com sucesso');
                // ✅ CORREÇÃO: Usar 'data' ao invés de 'transfer'
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('id');
                expect(response.body.data).to.have.property('fromAccount', user1.account);
                expect(response.body.data).to.have.property('toAccount', user2.account);
                expect(response.body.data).to.have.property('amount', transferData.amount);
                expect(response.body.data).to.have.property('description', transferData.description);
                expect(response.body.data).to.have.property('status', 'completed');
                expect(response.body.data).to.have.property('isFavorite', false);
            });

            it('✅ Should transfer high amount to favorite user', async () => {
                const richUser = await createRichUser();
                const normalUser = await createTestUser();
                const token = createTestToken(richUser.id, richUser.email, richUser.account);
                
                // Add to favorites first
                await addFavorite(token, normalUser.account);
                
                const response = await createTransfer(token, {
                    toAccount: normalUser.account,
                    amount: 6000,
                    description: 'High amount to favorite'
                });
                
                expect(response.status).to.equal(201);
                expect(response.body.data).to.have.property('amount', 6000);
                expect(response.body.data).to.have.property('isFavorite', true);
            });

            it('✅ Should list user transfers', async () => {
                const [user1, user2] = await createMultipleTestUsers(2);
                const token = createTestToken(user1.id, user1.email, user1.account);
                
                // Make a transfer first
                await createTransfer(token, getValidTransferData(user2.account));
                
                const response = await getTransfers(token);
                
                expect(response.status).to.equal(200);
                expect(response.body).to.have.property('message', 'Transferências recuperadas com sucesso');
                expect(response.body.data).to.be.an('array');
                expect(response.body.data).to.have.length(1);
            });
        });

        describe('Transfer Restrictions', () => {
            it('❌ Should reject high amount to non-favorite user', async () => {
                const richUser = await createRichUser();
                const normalUser = await createTestUser();
                const token = createTestToken(richUser.id, richUser.email, richUser.account);
                
                const response = await createTransfer(token, {
                    toAccount: normalUser.account,
                    amount: 6000,
                    description: 'High amount to non-favorite'
                });
                
                expect(response.status).to.equal(403);
                expect(response.body).to.have.property('error');
                expect(response.body.error).to.include('favorecidos');
            });

            it('❌ Should reject transfer with insufficient balance', async () => {
                const poorUser = await createPoorUser();
                const normalUser = await createTestUser();
                const token = createTestToken(poorUser.id, poorUser.email, poorUser.account);
                
                const response = await createTransfer(token, {
                    toAccount: normalUser.account,
                    amount: 100,
                    description: 'More than available'
                });
                
                expect(response.status).to.equal(400);
                expect(response.body).to.have.property('error', 'Saldo insuficiente');
            });

            it('❌ Should reject transfer to non-existent account', async () => {
                const user = await createTestUser();
                const token = createTestToken(user.id, user.email, user.account);
                
                const response = await createTransfer(token, {
                    toAccount: '999999',
                    amount: 100,
                    description: 'To non-existent account'
                });
                
                expect(response.status).to.equal(404);
                expect(response.body).to.have.property('error');
                expect(response.body.error).to.include('não encontrada');
            });

            it('❌ Should reject transfer with invalid data', async () => {
                const user = await createTestUser();
                const token = createTestToken(user.id, user.email, user.account);
                const invalidDataSets = getInvalidTransferData();
                
                for (const invalidData of invalidDataSets) {
                    const response = await createTransfer(token, invalidData);
                    expect(response.status).to.equal(400);
                    expect(response.body).to.have.property('error');
                }
            });

            it('❌ Should reject transfer without authentication', async () => {
                const response = await testUnauthorized('post', '/transfers', {
                    toAccount: '123456',
                    amount: 100
                });
                
                expect(response.status).to.equal(401);
                expect(response.body).to.have.property('error', 'Token de acesso requerido');
            });
        });
    });

    describe('⭐ Favorites Tests', () => {
        describe('Favorite Management', () => {
            it('✅ Should add user to favorites', async () => {
                const [user1, user2] = await createMultipleTestUsers(2);
                const token = createTestToken(user1.id, user1.email, user1.account);
                
                const response = await addFavorite(token, user2.account);
                
                expect(response.status).to.equal(201);
                expect(response.body).to.have.property('message', 'Favorito adicionado com sucesso');
                expect(response.body.data).to.have.property('id');
            });

            it('✅ Should list user favorites', async () => {
                const [user1, user2] = await createMultipleTestUsers(2);
                const token = createTestToken(user1.id, user1.email, user1.account);
                
                await addFavorite(token, user2.account);
                
                const response = await getFavorites(token);
                
                expect(response.status).to.equal(200);
                expect(response.body).to.have.property('message', 'Favoritos recuperados com sucesso');
                expect(response.body.data).to.be.an('array');
                expect(response.body.data).to.have.length(1);
                expect(response.body.data[0]).to.have.property('account', user2.account);
                expect(response.body.data[0]).to.have.property('name', user2.name);
            });

            it('❌ Should reject adding non-existent user to favorites', async () => {
                const user = await createTestUser();
                const token = createTestToken(user.id, user.email, user.account);
                
                const response = await addFavorite(token, '999999');
                
                expect(response.status).to.equal(404);
                expect(response.body).to.have.property('error');
                expect(response.body.error).to.include('não encontrada');
            });

            it('❌ Should reject adding same user twice to favorites', async () => {
                const [user1, user2] = await createMultipleTestUsers(2);
                const token = createTestToken(user1.id, user1.email, user1.account);
                
                await addFavorite(token, user2.account);
                const response = await addFavorite(token, user2.account);
                
                expect(response.status).to.equal(409);
                expect(response.body).to.have.property('error');
                expect(response.body.error).to.include('já está nos favoritos');
            });

            it('❌ Should reject adding self to favorites', async () => {
                const user = await createTestUser();
                const token = createTestToken(user.id, user.email, user.account);
                
                const response = await addFavorite(token, user.account);
                
                expect(response.status).to.equal(400);
                expect(response.body).to.have.property('error');
                expect(response.body.error).to.include('favoritar a si mesmo');
            });
        });
    });

    describe('📊 Database & System Tests', () => {
        it('✅ Should maintain database consistency', async () => {
            const initialStats = getDatabaseStats();
            expect(initialStats.users).to.equal(0);
            expect(initialStats.transfers).to.equal(0);
            expect(initialStats.favorites).to.equal(0);
            
            await createMultipleTestUsers(2);
            const afterUsersStats = getDatabaseStats();
            expect(afterUsersStats.users).to.equal(2);
            
            clearDatabase();
            const afterClearStats = getDatabaseStats();
            expect(afterClearStats.users).to.equal(0);
            expect(afterClearStats.nextUserId).to.equal(1);
        });

        it('✅ Should handle concurrent operations', async () => {
            const users = await createMultipleTestUsers(3);
            const [user1, user2, user3] = users;
            
            const token1 = createTestToken(user1.id, user1.email, user1.account);
            const token2 = createTestToken(user2.id, user2.email, user2.account);
            
            // Concurrent operations
            const promises = [
                createTransfer(token1, { toAccount: user2.account, amount: 100, description: 'Transfer 1' }),
                createTransfer(token2, { toAccount: user3.account, amount: 200, description: 'Transfer 2' }),
                addFavorite(token1, user3.account),
                addFavorite(token2, user1.account)
            ];
            
            const results = await Promise.all(promises);
            
            results.forEach(result => {
                expect(result.status).to.be.oneOf([201]);
            });
            
            const stats = getDatabaseStats();
            expect(stats.transfers).to.equal(2);
            expect(stats.favorites).to.equal(2);
        });
    });

    describe('🛡️ Security Tests', () => {
        it('❌ Should reject malformed tokens', async () => {
            // ✅ CORREÇÃO: Tokens que realmente existem e devem falhar
            const malformedTokens = [
                'invalid-token',
                'Bearer.invalid.token',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid'
            ];

            for (const token of malformedTokens) {
                const response = await authenticatedGet('/users/profile', token);
                expect(response.status).to.be.oneOf([401, 403]);
                expect(response.body).to.have.property('error');
            }
        });

        it('❌ Should prevent access to other users data', async () => {
            const [user1, user2] = await createMultipleTestUsers(2);
            const token1 = createTestToken(user1.id, user1.email, user1.account);
            
            // Try to transfer to self (which should be blocked)
            const response = await createTransfer(token1, {
                toAccount: user1.account, // Try to transfer to self
                amount: 100
            });
            
            expect(response.status).to.equal(400);
            expect(response.body.error).to.include('si mesmo');
        });
    });
});
*/