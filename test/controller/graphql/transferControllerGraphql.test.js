// test/controller/graphql/transferControllerGraphql.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const transferService = require('../../../src/services/transferService');
const resolvers = require('../../../src/graphql/resolvers');

describe('🧪 GraphQL Transfer Controller - Unit Tests', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Query: transfers', () => {
        it('✅ Should return user transfers', async () => {
            const mockTransfers = [
                {
                    id: 1,
                    fromAccount: '111111',
                    toAccount: '222222',
                    amount: 100,
                    description: 'Test transfer 1',
                    status: 'completed',
                    isFavorite: false,
                    createdAt: new Date()
                },
                {
                    id: 2,
                    fromAccount: '111111',
                    toAccount: '333333',
                    amount: 50,
                    description: 'Test transfer 2',
                    status: 'completed',
                    isFavorite: true,
                    createdAt: new Date()
                }
            ];

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'getTransfersByUserId').resolves(mockTransfers);

            const result = await resolvers.Query.transfers(null, {}, mockContext);

            expect(result).to.deep.equal(mockTransfers);
            expect(transferService.getTransfersByUserId.calledWith(1)).to.be.true;
        });

        it('❌ Should throw error when not authenticated', async () => {
            const mockContext = {}; // No user

            try {
                await resolvers.Query.transfers(null, {}, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('✅ Should return empty array when user has no transfers', async () => {
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'getTransfersByUserId').resolves([]);

            const result = await resolvers.Query.transfers(null, {}, mockContext);

            expect(result).to.be.an('array');
            expect(result).to.have.length(0);
        });
    });

    describe('Query: favorites', () => {
        it('✅ Should return user favorites', async () => {
            const mockFavorites = [
                {
                    id: 1,
                    account: '222222',
                    name: 'Favorite 1',
                    createdAt: new Date()
                },
                {
                    id: 2,
                    account: '333333',
                    name: null,
                    createdAt: new Date()
                }
            ];

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'getFavoritesByUserId').resolves(mockFavorites);

            const result = await resolvers.Query.favorites(null, {}, mockContext);

            expect(result).to.deep.equal(mockFavorites);
            expect(transferService.getFavoritesByUserId.calledWith(1)).to.be.true;
        });

        it('❌ Should throw error when not authenticated', async () => {
            const mockContext = {};

            try {
                await resolvers.Query.favorites(null, {}, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('✅ Should return empty array when user has no favorites', async () => {
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'getFavoritesByUserId').resolves([]);

            const result = await resolvers.Query.favorites(null, {}, mockContext);

            expect(result).to.be.an('array');
            expect(result).to.have.length(0);
        });
    });

    describe('Mutation: createTransfer', () => {
        it('✅ Should create a valid transfer', async () => {
            const input = {
                toAccount: '222222',
                amount: 100,
                description: 'Test transfer'
            };

            const mockTransfer = {
                id: 1,
                fromAccount: '111111',
                toAccount: input.toAccount,
                amount: input.amount,
                description: input.description,
                status: 'completed',
                isFavorite: false,
                createdAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').resolves(mockTransfer);

            const result = await resolvers.Mutation.createTransfer(null, { input }, mockContext);

            expect(result).to.deep.equal(mockTransfer);
            expect(transferService.createTransfer.calledWith(1, input)).to.be.true;
        });

        it('❌ Should throw error when not authenticated', async () => {
            const input = {
                toAccount: '222222',
                amount: 100,
                description: 'Test'
            };

            const mockContext = {};

            try {
                await resolvers.Mutation.createTransfer(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('❌ Should fail with insufficient balance', async () => {
            const input = {
                toAccount: '222222',
                amount: 10000,
                description: 'Too much'
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').rejects(new Error('Saldo insuficiente'));

            try {
                await resolvers.Mutation.createTransfer(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Saldo insuficiente');
            }
        });

        it('❌ Should fail with non-existent destination account', async () => {
            const input = {
                toAccount: '999999',
                amount: 100,
                description: 'Invalid account'
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').rejects(new Error('Conta de destino não encontrada'));

            try {
                await resolvers.Mutation.createTransfer(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Conta de destino não encontrada');
            }
        });

        it('❌ Should fail with negative amount', async () => {
            const input = {
                toAccount: '222222',
                amount: -50,
                description: 'Negative'
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').rejects(new Error('Valor deve ser positivo'));

            try {
                await resolvers.Mutation.createTransfer(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Valor deve ser positivo');
            }
        });

        it('❌ Should fail with amount exceeding limit for non-favorite', async () => {
            const input = {
                toAccount: '222222',
                amount: 6000, // More than 5000 limit
                description: 'Too high'
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').rejects(new Error('Valor máximo para transferência é R$ 5000.00'));

            try {
                await resolvers.Mutation.createTransfer(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Valor máximo');
            }
        });

        it('✅ Should create transfer to favorite account with high amount', async () => {
            const input = {
                toAccount: '222222',
                amount: 7000, // More than normal limit, but to favorite
                description: 'High value to favorite'
            };

            const mockTransfer = {
                id: 1,
                fromAccount: '111111',
                toAccount: input.toAccount,
                amount: input.amount,
                description: input.description,
                status: 'completed',
                isFavorite: true, // Marked as favorite
                createdAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').resolves(mockTransfer);

            const result = await resolvers.Mutation.createTransfer(null, { input }, mockContext);

            expect(result.amount).to.equal(7000);
            expect(result.isFavorite).to.be.true;
        });

        it('✅ Should create transfer without description', async () => {
            const input = {
                toAccount: '222222',
                amount: 100
                // No description
            };

            const mockTransfer = {
                id: 1,
                fromAccount: '111111',
                toAccount: input.toAccount,
                amount: input.amount,
                description: '',
                status: 'completed',
                isFavorite: false,
                createdAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').resolves(mockTransfer);

            const result = await resolvers.Mutation.createTransfer(null, { input }, mockContext);

            expect(result).to.have.property('description');
        });
    });

    describe('Mutation: addFavorite', () => {
        it('✅ Should add a favorite account', async () => {
            const input = {
                account: '222222'
            };

            const mockFavorite = {
                id: 1,
                account: input.account,
                name: 'Test Favorite',
                createdAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'addFavorite').resolves(mockFavorite);

            const result = await resolvers.Mutation.addFavorite(null, { input }, mockContext);

            expect(result).to.have.property('id');
            expect(result.account).to.equal(input.account);
            expect(result).to.have.property('name');
            expect(result).to.have.property('createdAt');
            expect(transferService.addFavorite.calledWith(1, input.account)).to.be.true;
        });

        it('✅ Should add favorite with null name', async () => {
            const input = {
                account: '333333'
            };

            const mockFavorite = {
                id: 2,
                account: input.account,
                name: null,
                createdAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'addFavorite').resolves(mockFavorite);

            const result = await resolvers.Mutation.addFavorite(null, { input }, mockContext);

            expect(result.name).to.be.null;
        });

        it('❌ Should throw error when not authenticated', async () => {
            const input = {
                account: '222222'
            };

            const mockContext = {};

            try {
                await resolvers.Mutation.addFavorite(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('❌ Should fail when account does not exist', async () => {
            const input = {
                account: '999999'
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'addFavorite').rejects(new Error('Conta não encontrada'));

            try {
                await resolvers.Mutation.addFavorite(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Conta não encontrada');
            }
        });

        it('❌ Should fail when favorite already exists', async () => {
            const input = {
                account: '222222'
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'addFavorite').rejects(new Error('Conta já está nos favoritos'));

            try {
                await resolvers.Mutation.addFavorite(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('favoritos');
            }
        });
    });

    describe('Mutation: removeFavorite', () => {
        it('✅ Should remove a favorite successfully', async () => {
            const favoriteId = '1';

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'removeFavorite').resolves();

            const result = await resolvers.Mutation.removeFavorite(null, { id: favoriteId }, mockContext);

            expect(result).to.be.true;
            expect(transferService.removeFavorite.calledWith(1, favoriteId)).to.be.true;
        });

        it('❌ Should throw error when not authenticated', async () => {
            const favoriteId = '1';
            const mockContext = {};

            try {
                await resolvers.Mutation.removeFavorite(null, { id: favoriteId }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('autenticado');
            }
        });

        it('❌ Should fail when favorite does not exist', async () => {
            const favoriteId = '999';

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'removeFavorite').rejects(new Error('Favorito não encontrado'));

            try {
                await resolvers.Mutation.removeFavorite(null, { id: favoriteId }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Favorito não encontrado');
            }
        });

        it('❌ Should fail when trying to remove another user\'s favorite', async () => {
            const favoriteId = '1';

            const mockContext = {
                user: { userId: 2 }
            };

            sandbox.stub(transferService, 'removeFavorite').rejects(new Error('Favorito não pertence ao usuário'));

            try {
                await resolvers.Mutation.removeFavorite(null, { id: favoriteId }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('não pertence ao usuário');
            }
        });
    });

    describe('Field Resolvers', () => {
        describe('Transfer field resolvers', () => {
            it('✅ Should format transfer ID as string', () => {
                const mockTransfer = { id: 456 };
                const result = resolvers.Transfer.id(mockTransfer);
                expect(result).to.equal('456');
            });

            it('✅ Should format amount as float', () => {
                const mockTransfer = { amount: '250.50' };
                const result = resolvers.Transfer.amount(mockTransfer);
                expect(result).to.equal(250.50);
            });

            it('✅ Should handle whole number amounts', () => {
                const mockTransfer = { amount: '100' };
                const result = resolvers.Transfer.amount(mockTransfer);
                expect(result).to.equal(100);
            });

            it('✅ Should return createdAt date', () => {
                const mockDate = new Date();
                const mockTransfer = { createdAt: mockDate };
                const result = resolvers.Transfer.createdAt(mockTransfer);
                expect(result).to.equal(mockDate);
            });
        });

        describe('Favorite field resolvers', () => {
            it('✅ Should format favorite ID as string', () => {
                const mockFavorite = { id: 789 };
                const result = resolvers.Favorite.id(mockFavorite);
                expect(result).to.equal('789');
            });

            it('✅ Should return createdAt date', () => {
                const mockDate = new Date();
                const mockFavorite = { createdAt: mockDate };
                const result = resolvers.Favorite.createdAt(mockFavorite);
                expect(result).to.equal(mockDate);
            });
        });
    });

    describe('Error Handling', () => {
        it('✅ Should propagate service layer errors in transfers query', async () => {
            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'getTransfersByUserId').rejects(new Error('Database connection failed'));

            try {
                await resolvers.Query.transfers(null, {}, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.equal('Database connection failed');
            }
        });

        it('✅ Should handle service errors in createTransfer mutation', async () => {
            const input = {
                toAccount: '222222',
                amount: 100,
                description: 'Test'
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').rejects(new Error('Service unavailable'));

            try {
                await resolvers.Mutation.createTransfer(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Service unavailable');
            }
        });

        it('✅ Should handle validation errors from service', async () => {
            const input = {
                toAccount: '',
                amount: 0,
                description: ''
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').rejects(new Error('Dados inválidos'));

            try {
                await resolvers.Mutation.createTransfer(null, { input }, mockContext);
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Dados inválidos');
            }
        });
    });

    describe('Edge Cases', () => {
        it('✅ Should handle very large transfer amounts within limit', async () => {
            const input = {
                toAccount: '222222',
                amount: 999999.99, // Large but to favorite
                description: 'Very large transfer'
            };

            const mockTransfer = {
                id: 1,
                fromAccount: '111111',
                toAccount: input.toAccount,
                amount: input.amount,
                description: input.description,
                status: 'completed',
                isFavorite: true,
                createdAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').resolves(mockTransfer);

            const result = await resolvers.Mutation.createTransfer(null, { input }, mockContext);

            expect(result.amount).to.equal(999999.99);
        });

        it('✅ Should handle transfer with very long description', async () => {
            const input = {
                toAccount: '222222',
                amount: 100,
                description: 'A'.repeat(500) // Very long description
            };

            const mockTransfer = {
                id: 1,
                fromAccount: '111111',
                toAccount: input.toAccount,
                amount: input.amount,
                description: input.description,
                status: 'completed',
                isFavorite: false,
                createdAt: new Date()
            };

            const mockContext = {
                user: { userId: 1 }
            };

            sandbox.stub(transferService, 'createTransfer').resolves(mockTransfer);

            const result = await resolvers.Mutation.createTransfer(null, { input }, mockContext);

            expect(result.description).to.have.length(500);
        });
    });
});

