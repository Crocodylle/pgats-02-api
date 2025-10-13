// test/controller/graphql/userControllerGraphql.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const userService = require('../../../src/services/userService');
const authService = require('../../../src/services/authService');
const resolvers = require('../../../src/graphql/resolvers');

describe('🧪 GraphQL User Controller - Unit Tests', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Query: me', () => {
        it('✅ Should return authenticated user profile', async () => {
            const mockUser = {
                id: 1,
                name: 'Test User',
                email: 'test@email.com',
                account: '123456',
                balance: 1000,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(userService, 'getUserById').resolves(mockUser);

            const result = await resolvers.Query.me(null, {}, mockContext);

            expect(result).to.deep.equal(mockUser);
            expect(userService.getUserById.calledWith(1)).to.be.true;
        });

        it('❌ Should throw error when user is not authenticated', async () => {
            const mockContext = {}; // No user in context

            try {
                await resolvers.Query.me(null, {}, mockContext);
                expect.fail('Should have thrown authentication error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('❌ Should handle user not found', async () => {
            const mockContext = {
                user: { userId: 999 }
            };

            sandbox.stub(userService, 'getUserById').resolves(null);

            const result = await resolvers.Query.me(null, {}, mockContext);

            expect(result).to.be.null;
        });
    });

    describe('Query: users', () => {
        it('✅ Should return all users when authenticated', async () => {
            const mockUsers = [
                { id: 1, name: 'User 1', email: 'user1@email.com', account: '111111', balance: 1000 },
                { id: 2, name: 'User 2', email: 'user2@email.com', account: '222222', balance: 500 }
            ];

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(userService, 'getAllUsers').resolves(mockUsers);

            const result = await resolvers.Query.users(null, {}, mockContext);

            expect(result).to.deep.equal(mockUsers);
            expect(userService.getAllUsers.called).to.be.true;
        });

        it('❌ Should throw error when not authenticated', async () => {
            const mockContext = {}; // No user

            try {
                await resolvers.Query.users(null, {}, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('✅ Should return empty array when no users exist', async () => {
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(userService, 'getAllUsers').resolves([]);

            const result = await resolvers.Query.users(null, {}, mockContext);

            expect(result).to.be.an('array');
            expect(result).to.have.length(0);
        });
    });

    describe('Query: userBalance', () => {
        it('✅ Should return user balance', async () => {
            const mockBalance = { balance: 1500 };
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(userService, 'getUserBalance').resolves(mockBalance);

            const result = await resolvers.Query.userBalance(null, {}, mockContext);

            expect(result).to.deep.equal(mockBalance);
            expect(userService.getUserBalance.calledWith(1)).to.be.true;
        });

        it('❌ Should throw error when not authenticated', async () => {
            const mockContext = {};

            try {
                await resolvers.Query.userBalance(null, {}, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('✅ Should handle zero balance', async () => {
            const mockBalance = { balance: 0 };
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(userService, 'getUserBalance').resolves(mockBalance);

            const result = await resolvers.Query.userBalance(null, {}, mockContext);

            expect(result.balance).to.equal(0);
        });
    });

    describe('Mutation: register', () => {
        it('✅ Should register new user and return auth payload', async () => {
            const input = {
                name: 'New User',
                email: 'newuser@email.com',
                password: 'password123'
            };

            const mockUser = {
                id: 1,
                name: input.name,
                email: input.email,
                account: '123456',
                balance: 1000
            };

            const mockAuthPayload = {
                token: 'jwt-token-123',
                user: mockUser
            };

            sandbox.stub(userService, 'createUser').resolves(mockUser);
            sandbox.stub(authService, 'login').resolves(mockAuthPayload);

            const result = await resolvers.Mutation.register(null, { input });

            expect(result).to.deep.equal(mockAuthPayload);
            expect(userService.createUser.calledWith(input)).to.be.true;
            expect(authService.login.calledWith(input.email, input.password)).to.be.true;
        });

        it('❌ Should handle duplicate email error', async () => {
            const input = {
                name: 'Duplicate User',
                email: 'existing@email.com',
                password: 'password123'
            };

            sandbox.stub(userService, 'createUser').rejects(new Error('E-mail já cadastrado'));

            try {
                await resolvers.Mutation.register(null, { input });
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('E-mail já cadastrado');
            }
        });

        it('❌ Should handle invalid email format', async () => {
            const input = {
                name: 'User',
                email: 'invalid-email',
                password: 'password123'
            };

            sandbox.stub(userService, 'createUser').rejects(new Error('E-mail inválido'));

            try {
                await resolvers.Mutation.register(null, { input });
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('E-mail inválido');
            }
        });

        it('❌ Should handle weak password', async () => {
            const input = {
                name: 'User',
                email: 'user@email.com',
                password: '123'
            };

            sandbox.stub(userService, 'createUser').rejects(new Error('Senha deve ter no mínimo 6 caracteres'));

            try {
                await resolvers.Mutation.register(null, { input });
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Senha deve ter no mínimo 6 caracteres');
            }
        });
    });

    describe('Mutation: login', () => {
        it('✅ Should login user with valid credentials', async () => {
            const input = {
                email: 'user@email.com',
                password: 'password123'
            };

            const mockAuthPayload = {
                token: 'jwt-token-123',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: input.email,
                    account: '123456',
                    balance: 1000
                }
            };

            sandbox.stub(authService, 'login').resolves(mockAuthPayload);

            const result = await resolvers.Mutation.login(null, { input });

            expect(result).to.deep.equal(mockAuthPayload);
            expect(authService.login.calledWith(input.email, input.password)).to.be.true;
        });

        it('❌ Should fail with invalid email', async () => {
            const input = {
                email: 'nonexistent@email.com',
                password: 'password123'
            };

            sandbox.stub(authService, 'login').rejects(new Error('Credenciais inválidas'));

            try {
                await resolvers.Mutation.login(null, { input });
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Credenciais inválidas');
            }
        });

        it('❌ Should fail with incorrect password', async () => {
            const input = {
                email: 'user@email.com',
                password: 'wrongpassword'
            };

            sandbox.stub(authService, 'login').rejects(new Error('Credenciais inválidas'));

            try {
                await resolvers.Mutation.login(null, { input });
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Credenciais inválidas');
            }
        });

        it('❌ Should handle missing credentials', async () => {
            const input = {
                email: '',
                password: ''
            };

            sandbox.stub(authService, 'login').rejects(new Error('Email e senha são obrigatórios'));

            try {
                await resolvers.Mutation.login(null, { input });
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('obrigatórios');
            }
        });
    });

    describe('Field Resolvers', () => {
        describe('User field resolvers', () => {
            it('✅ Should format user ID as string', () => {
                const mockUser = { id: 123 };
                const result = resolvers.User.id(mockUser);
                expect(result).to.equal('123');
            });

            it('✅ Should format balance as float', () => {
                const mockUser = { balance: '1000' };
                const result = resolvers.User.balance(mockUser);
                expect(result).to.equal(1000);
            });

            it('✅ Should handle decimal balance', () => {
                const mockUser = { balance: '1234.56' };
                const result = resolvers.User.balance(mockUser);
                expect(result).to.equal(1234.56);
            });

            it('✅ Should return createdAt date', () => {
                const mockDate = new Date();
                const mockUser = { createdAt: mockDate };
                const result = resolvers.User.createdAt(mockUser);
                expect(result).to.equal(mockDate);
            });

            it('✅ Should return updatedAt date', () => {
                const mockDate = new Date();
                const mockUser = { updatedAt: mockDate };
                const result = resolvers.User.updatedAt(mockUser);
                expect(result).to.equal(mockDate);
            });
        });
    });

    describe('Date Scalar Type', () => {
        it('✅ Should serialize Date to ISO string', () => {
            const mockDate = new Date('2024-01-15T10:30:00Z');
            const result = resolvers.Date.serialize(mockDate);
            expect(result).to.equal('2024-01-15T10:30:00.000Z');
        });

        it('✅ Should serialize ISO string as is', () => {
            const isoString = '2024-01-15T10:30:00.000Z';
            const result = resolvers.Date.serialize(isoString);
            expect(result).to.equal(isoString);
        });

        it('✅ Should parse value to Date', () => {
            const isoString = '2024-01-15T10:30:00.000Z';
            const result = resolvers.Date.parseValue(isoString);
            expect(result).to.be.instanceOf(Date);
            expect(result.toISOString()).to.equal(isoString);
        });

        it('✅ Should parse literal string to Date', () => {
            const ast = {
                kind: 'StringValue',
                value: '2024-01-15T10:30:00.000Z'
            };
            const result = resolvers.Date.parseLiteral(ast);
            expect(result).to.be.instanceOf(Date);
        });

        it('❌ Should return null for non-string literal', () => {
            const ast = {
                kind: 'IntValue',
                value: 12345
            };
            const result = resolvers.Date.parseLiteral(ast);
            expect(result).to.be.null;
        });
    });

    describe('Error Handling', () => {
        it('✅ Should propagate service layer errors', async () => {
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(userService, 'getUserById').rejects(new Error('Database error'));

            try {
                await resolvers.Query.me(null, {}, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.equal('Database error');
            }
        });

        it('✅ Should handle timeout errors gracefully', async () => {
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(userService, 'getUserBalance').rejects(new Error('Request timeout'));

            try {
                await resolvers.Query.userBalance(null, {}, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('timeout');
            }
        });
    });
});

