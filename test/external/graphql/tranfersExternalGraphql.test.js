const { expect } = require('chai');
const {
    checkGraphQLHealth,
    registerAndLoginGraphQL,
    getUserBalance,
    getUserProfile,
    getUserTransfers,
    createTransferGraphQL,
    getUserFavorites,
    addFavoriteGraphQL,
    removeFavoriteGraphQL,
    getAllUsers,
    executeGraphQL,
    cleanupGraphQLTestData
} = require('../../helpers/graphqlApiHelper');

describe('🔗 GraphQL External Tests - Complete Coverage', () => {
    let authToken;
    let testUser;
    let secondUser;
    let secondUserToken;

    before(async function() {
        this.timeout(15000);
        
        console.log('🔍 Checking if GraphQL API is running...');
        const isApiRunning = await checkGraphQLHealth();
        
        if (!isApiRunning) {
            throw new Error(`
❌ GraphQL API not running

To run GraphQL external tests:
1. Run: npm start
2. Wait for both servers to start (REST on port 3000, GraphQL on port 4000)
3. Run: npm run test-externalGraphql
            `);
        }
        
        console.log('✅ GraphQL API is running');
        
        // Setup first test user
        try {
            const { token, user } = await registerAndLoginGraphQL();
            authToken = token;
            testUser = user;
            
            expect(authToken).to.be.a('string');
            expect(testUser).to.have.property('id');
            expect(testUser).to.have.property('account');
            
            console.log(`✅ User 1 created: ${testUser.email} (Account: ${testUser.account})`);
        } catch (error) {
            throw new Error(`Failed to setup first test user: ${error.message}`);
        }
        
        // Setup second test user for transfer testing
        try {
            const { token, user } = await registerAndLoginGraphQL({
                name: 'Second GraphQL User',
                email: `second.graphql.${Date.now()}@email.com`,
                password: 'senha123'
            });
            secondUserToken = token;
            secondUser = user;
            
            expect(secondUserToken).to.be.a('string');
            expect(secondUser).to.have.property('account');
            
            console.log(`✅ User 2 created: ${secondUser.email} (Account: ${secondUser.account})`);
        } catch (error) {
            throw new Error(`Failed to setup second test user: ${error.message}`);
        }
    });

    after(async function() {
        // Cleanup test data
        await cleanupGraphQLTestData();
    });

    describe('User Queries', () => {
        it('✅ Should get user balance via GraphQL', async () => {
            const response = await getUserBalance(authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('userBalance');
            expect(response.data.data.userBalance).to.have.property('balance');
            expect(response.data.data.userBalance.balance).to.equal(1000);
        });

        it('✅ Should get user profile via GraphQL', async () => {
            const response = await getUserProfile(authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('me');
            expect(response.data.data.me).to.have.property('id', testUser.id);
            expect(response.data.data.me).to.have.property('name', testUser.name);
            expect(response.data.data.me).to.have.property('email', testUser.email);
            expect(response.data.data.me).to.have.property('account', testUser.account);
        });

        it('✅ Should get user transfers via GraphQL', async () => {
            const response = await getUserTransfers(authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('transfers');
            expect(response.data.data.transfers).to.be.an('array');
            // New user should have no transfers initially
            expect(response.data.data.transfers).to.have.length(0);
        });
    });

    describe('Authentication Errors', () => {
        it('❌ Should fail without authentication token', async () => {
            const response = await getUserBalance(); // No token provided
            
            expect(response.status).to.equal(200); // GraphQL returns 200 even for errors
            expect(response.data).to.have.property('errors');
            expect(response.data.errors).to.be.an('array');
            expect(response.data.errors[0]).to.have.property('message', 'Você deve estar autenticado para realizar esta operação');
        });
    
        it('❌ Should fail with invalid token', async () => {
            const response = await getUserBalance('invalid-token');
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
            expect(response.data.errors[0]).to.have.property('message', 'Você deve estar autenticado para realizar esta operação');
        });
    });

    describe('User List Query', () => {
        it('✅ Should get all users when authenticated', async () => {
            const response = await getAllUsers(authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('users');
            expect(response.data.data.users).to.be.an('array');
            expect(response.data.data.users.length).to.be.at.least(2); // At least our 2 test users
            
            // Verify user structure
            const user = response.data.data.users[0];
            expect(user).to.have.property('id');
            expect(user).to.have.property('name');
            expect(user).to.have.property('email');
            expect(user).to.have.property('account');
            expect(user).to.have.property('balance');
        });

        it('❌ Should fail to get users without authentication', async () => {
            const response = await getAllUsers(); // No token
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
            expect(response.data.errors[0].message).to.include('autenticado');
        });
    });

    describe('Transfer Mutations', () => {
        it('✅ Should create a valid transfer between users', async () => {
            const transferData = {
                toAccount: secondUser.account,
                amount: 100,
                description: 'GraphQL test transfer'
            };
            
            const response = await createTransferGraphQL(transferData, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('createTransfer');
            
            const transfer = response.data.data.createTransfer;
            expect(transfer).to.have.property('id');
            expect(transfer.toAccount).to.equal(secondUser.account);
            expect(transfer.amount).to.equal(100);
            expect(transfer.description).to.equal('GraphQL test transfer');
            expect(transfer.status).to.equal('completed');
            expect(transfer).to.have.property('createdAt');
        });

        it('✅ Should update balance after transfer', async () => {
            const transferData = {
                toAccount: secondUser.account,
                amount: 50,
                description: 'Balance update test'
            };
            
            // Get balance before
            const balanceBefore = await getUserBalance(authToken);
            const initialBalance = balanceBefore.data.data.userBalance.balance;
            
            // Make transfer
            await createTransferGraphQL(transferData, authToken);
            
            // Get balance after
            const balanceAfter = await getUserBalance(authToken);
            const finalBalance = balanceAfter.data.data.userBalance.balance;
            
            expect(finalBalance).to.equal(initialBalance - 50);
        });

        it('✅ Should show transfer in transfers list', async () => {
            const transferData = {
                toAccount: secondUser.account,
                amount: 25,
                description: 'Transfer list test'
            };
            
            await createTransferGraphQL(transferData, authToken);
            
            const response = await getUserTransfers(authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data.data.transfers).to.be.an('array');
            expect(response.data.data.transfers.length).to.be.at.least(1);
            
            // Find our transfer
            const ourTransfer = response.data.data.transfers.find(
                t => t.description === 'Transfer list test'
            );
            
            expect(ourTransfer).to.exist;
            expect(ourTransfer.amount).to.equal(25);
            expect(ourTransfer.toAccount).to.equal(secondUser.account);
        });

        it('❌ Should fail transfer with insufficient balance', async () => {
            const balanceResponse = await getUserBalance(authToken);
            const currentBalance = balanceResponse.data.data.userBalance.balance;
            
            const transferData = {
                toAccount: secondUser.account,
                amount: currentBalance + 1000, // More than available
                description: 'Insufficient balance test'
            };
            
            const response = await createTransferGraphQL(transferData, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
            expect(response.data.errors[0].message).to.include('Saldo insuficiente');
        });

        it('❌ Should fail transfer to non-existent account', async () => {
            const transferData = {
                toAccount: '999999', // Non-existent account
                amount: 50,
                description: 'Invalid account test'
            };
            
            const response = await createTransferGraphQL(transferData, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
        });

        it('❌ Should fail transfer without authentication', async () => {
            const transferData = {
                toAccount: secondUser.account,
                amount: 50,
                description: 'No auth test'
            };
            
            const response = await createTransferGraphQL(transferData); // No token
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
            expect(response.data.errors[0].message).to.include('autenticado');
        });

        it('❌ Should fail transfer with negative amount', async () => {
            const transferData = {
                toAccount: secondUser.account,
                amount: -50,
                description: 'Negative amount test'
            };
            
            const response = await createTransferGraphQL(transferData, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
        });

        it('❌ Should fail transfer with amount zero', async () => {
            const transferData = {
                toAccount: secondUser.account,
                amount: 0,
                description: 'Zero amount test'
            };
            
            const response = await createTransferGraphQL(transferData, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
        });
    });

    describe('Favorite Mutations', () => {
        it('✅ Should add a favorite account', async () => {
            const response = await addFavoriteGraphQL(secondUser.account, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('addFavorite');
            
            const favorite = response.data.data.addFavorite;
            expect(favorite).to.have.property('id');
            expect(favorite.account).to.equal(secondUser.account);
            expect(favorite).to.have.property('createdAt');
        });

        it('✅ Should list user favorites', async () => {
            const response = await getUserFavorites(authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('favorites');
            expect(response.data.data.favorites).to.be.an('array');
            expect(response.data.data.favorites.length).to.be.at.least(1);
            
            const favorite = response.data.data.favorites.find(
                f => f.account === secondUser.account
            );
            expect(favorite).to.exist;
        });

        it('✅ Should remove a favorite account', async () => {
            // First get the favorite ID
            const listResponse = await getUserFavorites(authToken);
            const favorites = listResponse.data.data.favorites;
            const favoriteToRemove = favorites.find(f => f.account === secondUser.account);
            
            expect(favoriteToRemove).to.exist;
            
            // Remove it
            const response = await removeFavoriteGraphQL(favoriteToRemove.id, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data.removeFavorite).to.be.true;
            
            // Verify it's removed
            const verifyResponse = await getUserFavorites(authToken);
            const remainingFavorites = verifyResponse.data.data.favorites;
            const removedFavorite = remainingFavorites.find(f => f.id === favoriteToRemove.id);
            
            expect(removedFavorite).to.be.undefined;
        });

        it('❌ Should fail to add favorite without authentication', async () => {
            const response = await addFavoriteGraphQL(secondUser.account); // No token
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
            expect(response.data.errors[0].message).to.include('autenticado');
        });

        it('❌ Should fail to add non-existent account as favorite', async () => {
            const response = await addFavoriteGraphQL('999999', authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
        });

        it('❌ Should fail to remove favorite without authentication', async () => {
            const response = await removeFavoriteGraphQL('123'); // No token
            
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('errors');
            expect(response.data.errors[0].message).to.include('autenticado');
        });
    });

    describe('Transfer with Favorites Flow', () => {
        it('✅ Should mark transfer as favorite when transferring to favorite account', async () => {
            // Add secondUser as favorite
            await addFavoriteGraphQL(secondUser.account, authToken);
            
            // Make transfer to favorite
            const transferData = {
                toAccount: secondUser.account,
                amount: 30,
                description: 'Transfer to favorite'
            };
            
            const response = await createTransferGraphQL(transferData, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            
            const transfer = response.data.data.createTransfer;
            expect(transfer.isFavorite).to.be.true;
        });
    });

    describe('Advanced GraphQL Operations', () => {
        it('✅ Should handle multiple queries in single request', async () => {
            const customQuery = `
                query MultiQuery {
                    me {
                        name
                        balance
                    }
                    userBalance {
                        balance
                    }
                    transfers {
                        id
                        amount
                    }
                    favorites {
                        id
                        account
                    }
                }
            `;
            
            const response = await executeGraphQL(customQuery, {}, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('me');
            expect(response.data.data).to.have.property('userBalance');
            expect(response.data.data).to.have.property('transfers');
            expect(response.data.data).to.have.property('favorites');
        });

        it('✅ Should handle GraphQL aliases', async () => {
            const queryWithAliases = `
                query WithAliases {
                    currentUser: me {
                        id
                        name
                    }
                    accountBalance: userBalance {
                        balance
                    }
                    allTransfers: transfers {
                        id
                    }
                }
            `;
            
            const response = await executeGraphQL(queryWithAliases, {}, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('currentUser');
            expect(response.data.data).to.have.property('accountBalance');
            expect(response.data.data).to.have.property('allTransfers');
        });

        it('✅ Should handle GraphQL fragments', async () => {
            const queryWithFragments = `
                fragment UserInfo on User {
                    id
                    name
                    email
                    balance
                }
                
                query WithFragments {
                    me {
                        ...UserInfo
                    }
                }
            `;
            
            const response = await executeGraphQL(queryWithFragments, {}, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data.me).to.have.property('id');
            expect(response.data.data.me).to.have.property('name');
            expect(response.data.data.me).to.have.property('email');
            expect(response.data.data.me).to.have.property('balance');
        });

        it('✅ Should handle partial field selection', async () => {
            const partialQuery = `
                query PartialSelection {
                    me {
                        name
                    }
                    transfers {
                        amount
                        description
                    }
                }
            `;
            
            const response = await executeGraphQL(partialQuery, {}, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            
            // Should only have requested fields
            expect(response.data.data.me).to.have.property('name');
            expect(response.data.data.me).to.not.have.property('email');
            
            if (response.data.data.transfers.length > 0) {
                const transfer = response.data.data.transfers[0];
                expect(transfer).to.have.property('amount');
                expect(transfer).to.have.property('description');
                expect(transfer).to.not.have.property('fromAccount');
            }
        });

        it('❌ Should handle invalid GraphQL syntax', async () => {
            const invalidQuery = `
                query InvalidSyntax {
                    me {
                        name
                    // Missing closing brace
                }
            `;
            
            const response = await executeGraphQL(invalidQuery, {}, authToken);
            
            expect(response.status).to.equal(400);
            expect(response.data).to.have.property('errors');
        });

        it('❌ Should handle non-existent fields', async () => {
            const queryWithInvalidField = `
                query NonExistentField {
                    me {
                        name
                        nonExistentField
                    }
                }
            `;
            
            const response = await executeGraphQL(queryWithInvalidField, {}, authToken);
            
            expect(response.status).to.equal(400);
            expect(response.data).to.have.property('errors');
        });
    });

    describe('GraphQL Introspection', () => {
        it('✅ Should support schema introspection', async () => {
            const introspectionQuery = `
                query IntrospectionQuery {
                    __schema {
                        types {
                            name
                        }
                        queryType {
                            name
                        }
                        mutationType {
                            name
                        }
                    }
                }
            `;
            
            const response = await executeGraphQL(introspectionQuery);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data.__schema).to.have.property('types');
            expect(response.data.data.__schema.queryType.name).to.equal('Query');
            expect(response.data.data.__schema.mutationType.name).to.equal('Mutation');
        });

        it('✅ Should get type information', async () => {
            const typeQuery = `
                query TypeInfo {
                    __type(name: "User") {
                        name
                        fields {
                            name
                            type {
                                name
                                kind
                            }
                        }
                    }
                }
            `;
            
            const response = await executeGraphQL(typeQuery);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data.__type.name).to.equal('User');
            expect(response.data.data.__type.fields).to.be.an('array');
            
            const fieldNames = response.data.data.__type.fields.map(f => f.name);
            expect(fieldNames).to.include('id');
            expect(fieldNames).to.include('name');
            expect(fieldNames).to.include('email');
            expect(fieldNames).to.include('balance');
        });
    });
});