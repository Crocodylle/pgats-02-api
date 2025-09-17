const { expect } = require('chai');
const {
    checkGraphQLHealth,
    registerAndLoginGraphQL,
    getUserBalance,
    getUserProfile,
    getUserTransfers,
    executeGraphQL,
    cleanupGraphQLTestData
} = require('../../helpers/graphqlApiHelper');

describe('🔗 Transfers External GraphQL', () => {
    let authToken;
    let testUser;

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
        
        // Setup test user
        try {
            const { token, user } = await registerAndLoginGraphQL();
            authToken = token;
            testUser = user;
            
            expect(authToken).to.be.a('string');
            expect(testUser).to.have.property('id');
            expect(testUser).to.have.property('account');
        } catch (error) {
            throw new Error(`Failed to setup test user: ${error.message}`);
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

    describe('Advanced GraphQL Operations', () => {
        it('✅ Should handle custom GraphQL query', async () => {
            const customQuery = `
                query CustomUserQuery {
                    me {
                        name
                        balance
                    }
                    userBalance {
                        balance
                    }
                }
            `;
            
            const response = await executeGraphQL(customQuery, {}, authToken);
            
            expect(response.status).to.equal(200);
            expect(response.data).to.not.have.property('errors');
            expect(response.data.data).to.have.property('me');
            expect(response.data.data).to.have.property('userBalance');
            expect(response.data.data.me.name).to.equal(testUser.name);
            expect(response.data.data.userBalance.balance).to.equal(1000);
        });
    });
});