// test/helpers/graphqlApiHelper.js
const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:4000/';
const HEALTH_URL = 'http://localhost:3000/health';

/**
 * 🔗 Helper para testes GraphQL com API externa real
 * Substitui queries inline por funções reutilizáveis
 * 
 * IMPORTANTE: Ambos servidores devem estar rodando:
 * - REST API: http://localhost:3000 (para health check)
 * - GraphQL: http://localhost:4000 (para queries)
 */

/**
 * Executa uma query/mutation GraphQL
 */
const executeGraphQL = async (query, variables = {}, token = null) => {
    const config = {
        method: 'POST',
        url: GRAPHQL_URL,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        timeout: 10000,
        validateStatus: () => true // Accept all status codes
    };

    const payload = { query };
    if (Object.keys(variables).length > 0) {
        payload.variables = variables;
    }

    try {
        return await axios({ ...config, data: payload });
    } catch (error) {
        throw new Error(`GraphQL Request failed: ${error.message}`);
    }
};

/**
 * AUTHENTICATION OPERATIONS
 */

const registerUserGraphQL = async (userData) => {
    const mutation = `
        mutation RegisterUser($input: RegisterInput!) {
            register(input: $input) {
                token
                user {
                    id
                    name
                    email
                    account
                    balance
                    createdAt
                }
            }
        }
    `;
    
    return executeGraphQL(mutation, { input: userData });
};

const loginUserGraphQL = async (email, password) => {
    const mutation = `
        mutation LoginUser($input: LoginInput!) {
            login(input: $input) {
                token
                user {
                    id
                    name
                    email
                    account
                    balance
                }
            }
        }
    `;
    
    return executeGraphQL(mutation, { input: { email, password } });
};

/**
 * USER OPERATIONS
 */

const getUserProfile = async (token) => {
    const query = `
        query GetMyProfile {
            me {
                id
                name
                email
                account
                balance
                createdAt
                updatedAt
            }
        }
    `;
    
    return executeGraphQL(query, {}, token);
};

const getUserBalance = async (token) => {
    const query = `
        query GetMyBalance {
            userBalance {
                balance
            }
        }
    `;
    
    return executeGraphQL(query, {}, token);
};

const getAllUsers = async (token) => {
    const query = `
        query GetAllUsers {
            users {
                id
                name
                email
                account
                balance
                createdAt
            }
        }
    `;
    
    return executeGraphQL(query, {}, token);
};

/**
 * TRANSFER OPERATIONS
 */

const getUserTransfers = async (token) => {
    const query = `
        query GetMyTransfers {
            transfers {
                id
                fromAccount
                toAccount
                amount
                description
                status
                isFavorite
                createdAt
            }
        }
    `;
    
    return executeGraphQL(query, {}, token);
};

const createTransferGraphQL = async (transferData, token) => {
    const mutation = `
        mutation CreateTransfer($input: TransferInput!) {
            createTransfer(input: $input) {
                id
                fromAccount
                toAccount
                amount
                description
                status
                isFavorite
                createdAt
            }
        }
    `;
    
    return executeGraphQL(mutation, { input: transferData }, token);
};

/**
 * FAVORITE OPERATIONS
 */

const getUserFavorites = async (token) => {
    const query = `
        query GetMyFavorites {
            favorites {
                id
                account
                name
                createdAt
            }
        }
    `;
    
    return executeGraphQL(query, {}, token);
};

const addFavoriteGraphQL = async (account, token) => {
    const mutation = `
        mutation AddFavorite($input: FavoriteInput!) {
            addFavorite(input: $input) {
                id
                account
                name
                createdAt
            }
        }
    `;
    
    return executeGraphQL(mutation, { input: { account } }, token);
};

const removeFavoriteGraphQL = async (id, token) => {
    const mutation = `
        mutation RemoveFavorite($id: ID!) {
            removeFavorite(id: $id)
        }
    `;
    
    return executeGraphQL(mutation, { id }, token);
};

/**
 * UTILITY FUNCTIONS
 */

const checkGraphQLHealth = async () => {
    try {
        // Check REST API health (servers are linked)
        await axios.get(HEALTH_URL, { timeout: 5000 });
        
        // Try a simple GraphQL introspection query
        const introspectionQuery = `
            query {
                __schema {
                    queryType {
                        name
                    }
                }
            }
        `;
        
        const response = await executeGraphQL(introspectionQuery);
        return response.status === 200 && !response.data.errors;
    } catch (error) {
        return false;
    }
};

const registerAndLoginGraphQL = async (userData = {}) => {
    const defaultData = {
        name: `GraphQL User ${Date.now()}`,
        email: `graphql.${Date.now()}@email.com`,
        password: 'senha123',
        ...userData
    };
    
    const registerResponse = await registerUserGraphQL(defaultData);
    
    if (registerResponse.data.errors) {
        throw new Error(`Registration failed: ${registerResponse.data.errors[0].message}`);
    }
    
    const { token, user } = registerResponse.data.data.register;
    return { token, user, response: registerResponse };
};

/**
 * CLEANUP OPERATIONS
 */

const cleanupGraphQLTestData = async () => {
    // GraphQL API uses the same in-memory database as REST
    // No specific cleanup needed as data resets between test runs
    console.log('⚠️  GraphQL test cleanup: Data persists in shared in-memory database');
};

module.exports = {
    // Core GraphQL execution
    executeGraphQL,
    
    // Authentication
    registerUserGraphQL,
    loginUserGraphQL,
    registerAndLoginGraphQL,
    
    // User operations
    getUserProfile,
    getUserBalance,
    getAllUsers,
    
    // Transfer operations
    getUserTransfers,
    createTransferGraphQL,
    
    // Favorite operations
    getUserFavorites,
    addFavoriteGraphQL,
    removeFavoriteGraphQL,
    
    // Utilities
    checkGraphQLHealth,
    cleanupGraphQLTestData,
    
    // Constants
    GRAPHQL_URL,
    HEALTH_URL
};
