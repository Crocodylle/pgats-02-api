// test/helpers/testDataFactory.js

/**
 * 🏭 Test Data Factory
 * 
 * Provides builders and factories for creating consistent test data
 * across all tests. Follows the Builder pattern for flexibility.
 */

class UserBuilder {
    constructor() {
        this.data = {
            name: `Test User ${Date.now()}`,
            email: `user.${Date.now()}@email.com`,
            password: 'senha123'
        };
    }

    withName(name) {
        this.data.name = name;
        return this;
    }

    withEmail(email) {
        this.data.email = email;
        return this;
    }

    withPassword(password) {
        this.data.password = password;
        return this;
    }

    withUniqueEmail() {
        this.data.email = `unique.${Date.now()}.${Math.random().toString(36).substring(7)}@email.com`;
        return this;
    }

    withInvalidEmail() {
        this.data.email = 'invalid-email-format';
        return this;
    }

    withWeakPassword() {
        this.data.password = '123';
        return this;
    }

    withStrongPassword() {
        this.data.password = 'StrongP@ss123!';
        return this;
    }

    build() {
        return { ...this.data };
    }
}

class TransferBuilder {
    constructor(toAccount = '123456') {
        this.data = {
            toAccount,
            amount: 100,
            description: 'Test transfer'
        };
    }

    toAccount(account) {
        this.data.toAccount = account;
        return this;
    }

    withAmount(amount) {
        this.data.amount = amount;
        return this;
    }

    withDescription(description) {
        this.data.description = description;
        return this;
    }

    withSmallAmount() {
        this.data.amount = 10;
        return this;
    }

    withLargeAmount() {
        this.data.amount = 4500; // Just under limit
        return this;
    }

    withExcessiveAmount() {
        this.data.amount = 6000; // Over limit
        return this;
    }

    withNegativeAmount() {
        this.data.amount = -50;
        return this;
    }

    withZeroAmount() {
        this.data.amount = 0;
        return this;
    }

    withoutDescription() {
        delete this.data.description;
        return this;
    }

    withLongDescription() {
        this.data.description = 'A'.repeat(500);
        return this;
    }

    build() {
        return { ...this.data };
    }
}

class FavoriteBuilder {
    constructor(account = '123456') {
        this.data = {
            account
        };
    }

    withAccount(account) {
        this.data.account = account;
        return this;
    }

    withInvalidAccount() {
        this.data.account = '999999';
        return this;
    }

    build() {
        return { ...this.data };
    }
}

class GraphQLQueryBuilder {
    constructor() {
        this.query = null;
        this.variables = {};
        this.operationName = null;
    }

    userProfileQuery() {
        this.query = `
            query GetUserProfile {
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
        return this;
    }

    userBalanceQuery() {
        this.query = `
            query GetUserBalance {
                userBalance {
                    balance
                }
            }
        `;
        return this;
    }

    allUsersQuery() {
        this.query = `
            query GetAllUsers {
                users {
                    id
                    name
                    email
                    account
                    balance
                }
            }
        `;
        return this;
    }

    transfersQuery() {
        this.query = `
            query GetTransfers {
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
        return this;
    }

    favoritesQuery() {
        this.query = `
            query GetFavorites {
                favorites {
                    id
                    account
                    name
                    createdAt
                }
            }
        `;
        return this;
    }

    createTransferMutation(transferData) {
        this.query = `
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
        this.variables = { input: transferData };
        return this;
    }

    addFavoriteMutation(account) {
        this.query = `
            mutation AddFavorite($input: FavoriteInput!) {
                addFavorite(input: $input) {
                    id
                    account
                    name
                    createdAt
                }
            }
        `;
        this.variables = { input: { account } };
        return this;
    }

    removeFavoriteMutation(id) {
        this.query = `
            mutation RemoveFavorite($id: ID!) {
                removeFavorite(id: $id)
            }
        `;
        this.variables = { id };
        return this;
    }

    registerMutation(userData) {
        this.query = `
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
        this.variables = { input: userData };
        return this;
    }

    loginMutation(email, password) {
        this.query = `
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
        this.variables = { input: { email, password } };
        return this;
    }

    withVariables(variables) {
        this.variables = variables;
        return this;
    }

    withOperationName(name) {
        this.operationName = name;
        return this;
    }

    build() {
        const result = {
            query: this.query,
            variables: this.variables
        };
        
        if (this.operationName) {
            result.operationName = this.operationName;
        }
        
        return result;
    }
}

/**
 * Factory methods for quick data generation
 */
const TestDataFactory = {
    /**
     * User factories
     */
    user: {
        valid: () => new UserBuilder().build(),
        withName: (name) => new UserBuilder().withName(name).build(),
        withEmail: (email) => new UserBuilder().withEmail(email).build(),
        unique: () => new UserBuilder().withUniqueEmail().build(),
        invalidEmail: () => new UserBuilder().withInvalidEmail().build(),
        weakPassword: () => new UserBuilder().withWeakPassword().build(),
        multiple: (count) => {
            const users = [];
            for (let i = 0; i < count; i++) {
                users.push(new UserBuilder().withUniqueEmail().withName(`User ${i + 1}`).build());
            }
            return users;
        }
    },

    /**
     * Transfer factories
     */
    transfer: {
        valid: (toAccount) => new TransferBuilder(toAccount).build(),
        small: (toAccount) => new TransferBuilder(toAccount).withSmallAmount().build(),
        large: (toAccount) => new TransferBuilder(toAccount).withLargeAmount().build(),
        excessive: (toAccount) => new TransferBuilder(toAccount).withExcessiveAmount().build(),
        negative: (toAccount) => new TransferBuilder(toAccount).withNegativeAmount().build(),
        zero: (toAccount) => new TransferBuilder(toAccount).withZeroAmount().build(),
        withoutDescription: (toAccount) => new TransferBuilder(toAccount).withoutDescription().build()
    },

    /**
     * Favorite factories
     */
    favorite: {
        valid: (account) => new FavoriteBuilder(account).build(),
        invalid: () => new FavoriteBuilder().withInvalidAccount().build()
    },

    /**
     * GraphQL query/mutation factories
     */
    graphql: {
        query: {
            userProfile: () => new GraphQLQueryBuilder().userProfileQuery().build(),
            userBalance: () => new GraphQLQueryBuilder().userBalanceQuery().build(),
            allUsers: () => new GraphQLQueryBuilder().allUsersQuery().build(),
            transfers: () => new GraphQLQueryBuilder().transfersQuery().build(),
            favorites: () => new GraphQLQueryBuilder().favoritesQuery().build()
        },
        mutation: {
            register: (userData) => new GraphQLQueryBuilder().registerMutation(userData).build(),
            login: (email, password) => new GraphQLQueryBuilder().loginMutation(email, password).build(),
            createTransfer: (transferData) => new GraphQLQueryBuilder().createTransferMutation(transferData).build(),
            addFavorite: (account) => new GraphQLQueryBuilder().addFavoriteMutation(account).build(),
            removeFavorite: (id) => new GraphQLQueryBuilder().removeFavoriteMutation(id).build()
        }
    },

    /**
     * Scenario factories - complete test scenarios
     */
    scenario: {
        /**
         * Create a complete transfer scenario with two users
         */
        transferBetweenUsers: () => ({
            sender: new UserBuilder().withName('Sender User').withUniqueEmail().build(),
            receiver: new UserBuilder().withName('Receiver User').withUniqueEmail().build(),
            transfer: null // Will be populated with receiver's account
        }),

        /**
         * Create a favorite scenario
         */
        favoriteSetup: () => ({
            user: new UserBuilder().withName('Main User').withUniqueEmail().build(),
            favoriteUser: new UserBuilder().withName('Favorite User').withUniqueEmail().build()
        }),

        /**
         * Create multiple users for batch testing
         */
        multipleUsers: (count = 3) => {
            return TestDataFactory.user.multiple(count);
        }
    },

    /**
     * Mock data for controller tests (with IDs and timestamps)
     */
    mock: {
        user: (overrides = {}) => ({
            id: 1,
            name: 'Mock User',
            email: 'mock@email.com',
            account: '123456',
            balance: 1000,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        }),

        transfer: (overrides = {}) => ({
            id: 1,
            fromAccount: '111111',
            toAccount: '222222',
            amount: 100,
            description: 'Mock transfer',
            status: 'completed',
            isFavorite: false,
            createdAt: new Date(),
            ...overrides
        }),

        favorite: (overrides = {}) => ({
            id: 1,
            account: '222222',
            name: 'Mock Favorite',
            createdAt: new Date(),
            ...overrides
        }),

        authPayload: (userOverrides = {}) => ({
            token: 'mock-jwt-token-123',
            user: TestDataFactory.mock.user(userOverrides)
        })
    }
};

module.exports = {
    UserBuilder,
    TransferBuilder,
    FavoriteBuilder,
    GraphQLQueryBuilder,
    TestDataFactory
};

